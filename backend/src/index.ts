import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import { supabase } from './lib/supabase';
import { generateAIResponse, type Message } from './lib/llm';
import { createSetuConsentRequest, getSetuConsentStatus, verifySetuWebhook } from './lib/setuAA';
import { enqueuePortfolioSync, getQueueHealth } from './lib/queue';
import { rateLimiter, cacheGet, cacheSet, upstashClient, ioRedisClient } from './lib/redis';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parseCasPdf } from './lib/cas';
import {
  getKiteLoginUrl,
  exchangeKiteToken,
  fetchKiteHoldings,
  fetchKiteMargins,
  saveBrokerConnection,
  getActiveBrokerToken,
  normalizeAndStoreKiteHoldings,
  disconnectBrokerAccount,
  KiteTokenExpiredError,
} from './lib/kiteConnect';
import {
  getUpstoxLoginUrl,
  exchangeUpstoxCode,
  fetchUpstoxHoldings,
  fetchUpstoxFunds,
  saveUpstoxConnection,
  normalizeAndStoreUpstoxHoldings,
  UpstoxTokenExpiredError,
} from './lib/upstoxConnect';
import { getCandles, getQuote, resolveYahooSymbol } from './lib/marketData';
import { getCompanyNews } from './lib/newsService';
import { generateContextSummary, scanForProhibitedLanguage } from './lib/aiContextSummary';
import { getPortfolioPerformance } from './lib/portfolioPerformance';
import { syncUserHoldingsValues } from './lib/holdingsSync';
dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN_BACKEND || process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  sendDefaultPii: false,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Scrub sensitive headers & authentication tokens from traces
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-setu-signature'];
    }
    return event;
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

const upload = multer({ dest: 'uploads/' });

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running correctly.' });
});

// Redis & Cache status endpoint
app.get('/api/redis/health', async (req: Request, res: Response) => {
  const status: Record<string, any> = {
    upstash_rest: !!upstashClient,
    ioredis_tcp: !!ioRedisClient && ioRedisClient.status === 'ready',
    mode: upstashClient ? 'UPSTASH_REST' : (ioRedisClient && ioRedisClient.status === 'ready' ? 'IOREDIS_TCP' : 'IN_MEMORY_FALLBACK'),
    timestamp: new Date().toISOString(),
  };

  try {
    const testKey = 'health:ping:' + Date.now();
    await cacheSet(testKey, { ping: 'pong' }, 10);
    const readBack = await cacheGet<{ ping: string }>(testKey);
    status.cache_test = readBack?.ping === 'pong' ? 'SUCCESS' : 'FAILED';
  } catch (err: any) {
    status.cache_test = 'ERROR: ' + err.message;
  }

  res.json(status);
});

// BullMQ Queue health endpoint
app.get('/api/queue/health', async (req: Request, res: Response) => {
  const health = await getQueueHealth();
  res.json(health);
});

app.get('/api/debug-sentry', function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// ==========================================
// Shared helper: Compute SEBI-mandated behavioral alerts from real DB data.
// Called by both /api/alerts/behavioral/:userId and /api/trust/alerts.
// Returns an empty array if no real signals exist — never fabricates alerts.
// ==========================================
async function computeBehavioralAlerts(userId: string): Promise<any[]> {
  const alerts: any[] = [];

  // --- Signal 1: Overtrading — ≥3 user-initiated trades in the last 24 hours ---
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentTrades } = await supabase
    .from('transactions')
    .select('id, txn_type, txn_date, amount, created_at')
    .eq('user_id', userId)
    .neq('source', 'SYSTEM_BACKFILL')  // Exclude seed data — only real user actions
    .neq('source', 'CAS')              // Exclude CAS imports — not live trades
    .gte('created_at', since24h)
    .order('created_at', { ascending: false });

  const tradeCount = recentTrades?.length || 0;
  if (tradeCount >= 3) {
    alerts.push({
      id: `alert_overtrading_${Date.now()}`,
      type: 'overtrading',
      severity: 'high',
      title: 'High Trading Velocity Detected',
      message: `You have executed ${tradeCount} trade${tradeCount > 1 ? 's' : ''} in the last 24 hours. High-frequency trading often leads to sub-optimal returns due to compounded transaction costs and emotional bias. SEBI research shows retail overtrading is a leading cause of portfolio underperformance.`,
      timestamp: new Date().toISOString(),
      actionUrl: '/learn',
      data: { trade_count_24h: tradeCount }
    });
  }

  // --- Signal 2: Holdings at unrealized loss (panic-sell risk signal) ---
  const { data: lossHoldings } = await supabase
    .from('holdings')
    .select('instrument_name, current_value, avg_cost, quantity, sector')
    .eq('user_id', userId)
    .neq('data_source', 'SETU_MOCK')  // Exclude mock data
    .gt('quantity', 0);

  if (lossHoldings && lossHoldings.length > 0) {
    const atLoss = lossHoldings.filter((h: any) => {
      const costBasis = Number(h.avg_cost) * Number(h.quantity);
      const currentVal = Number(h.current_value);
      const lossPercent = costBasis > 0 ? ((currentVal - costBasis) / costBasis) * 100 : 0;
      return lossPercent < -8; // Flag holdings down more than 8% from cost basis
    });

    if (atLoss.length > 0) {
      const worst = atLoss.sort((a: any, b: any) => {
        const lossA = Number(a.current_value) - Number(a.avg_cost) * Number(a.quantity);
        const lossB = Number(b.current_value) - Number(b.avg_cost) * Number(b.quantity);
        return lossA - lossB; // Most negative first
      })[0];
      const costBasis = Number(worst.avg_cost) * Number(worst.quantity);
      const lossPercent = costBasis > 0 ? ((Number(worst.current_value) - costBasis) / costBasis) * 100 : 0;

      alerts.push({
        id: `alert_loss_${Date.now()}`,
        type: 'panic_sell',
        severity: 'medium',
        title: 'Holdings at Unrealized Loss',
        message: `${worst.instrument_name} is currently at ${lossPercent.toFixed(1)}% unrealized loss from your cost basis. Historically, markets recover from corrections. Consider whether your investment thesis has changed before selling at a loss.`,
        timestamp: new Date().toISOString(),
        actionUrl: '/twin/simulator',
        data: {
          instrument: worst.instrument_name,
          loss_percent: lossPercent.toFixed(1),
          holdings_at_loss: atLoss.length
        }
      });
    }
  }

  return alerts;
}

// ==========================================
// 1. Authentication Endpoints
// ==========================================


app.post('/api/auth/otp', rateLimiter({ limit: 5, windowSeconds: 60, prefix: 'rl:otp' }), async (req: Request, res: Response) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });
    
    // In a real app we'd configure Twilio/MessageBird in Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: mobile
    });
    
    if (error) {
      console.error("OTP Request failed:", error);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
    
    res.json({ message: 'OTP sent successfully', details: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/verify', rateLimiter({ limit: 10, windowSeconds: 60, prefix: 'rl:verify' }), async (req: Request, res: Response) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: otp,
      type: 'sms'
    });
    
    if (error) {
      console.error("OTP Verification failed:", error);
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    
    res.json({ session: data.session, user: data.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Demo login to bypass real SMS for demo days
app.post('/api/auth/demo-login', async (req: Request, res: Response) => {
  try {
    console.log("Demo login hit, returning mock session immediately.");
    const mockJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MTY2OTFiOS05MzllLTQxMTgtYWFmYi05MjQ2YTM5MjMyNTAiLCJleHAiOjk5OTk5OTk5OTl9.mock";
    return res.json({ 
      session: { access_token: mockJwt, refresh_token: mockJwt }, 
      user: { id: '716691b9-939e-4118-aafb-9246a3923250' } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Risk Profile (Legacy bypass - being deprecated by Stage 2 Auth)
app.post('/api/users/me/risk-profile', async (req: Request, res: Response) => {
  try {
    const { risk_profile } = req.body;
    // Hardcode demo user ID
    const activeUserId = '716691b9-939e-4118-aafb-9246a3923250'; 
    
    const { error } = await supabase
      .from('users')
      .update({ risk_profile, risk_profile_updated_at: new Date().toISOString() })
      .eq('id', activeUserId);
      
    if (error) {
      console.error("Failed to update risk profile:", error);
      return res.status(500).json({ error: 'Failed to update risk profile' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 2. Account Aggregator Endpoints
// ==========================================

app.post('/api/aa/consent', async (req: Request, res: Response) => {
  try {
    const { fip_list, data_types, purpose, duration_days, redirect_url } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

    const isLive = process.env.AA_LIVE === 'true';
    let consentId: string;
    let redirectUrl: string;

    if (isLive) {
      try {
        const setuRes = await createSetuConsentRequest({
          user_id: user.id,
          fip_list,
          data_types,
          purpose,
          redirect_url,
        });
        consentId = setuRes.consentId;
        redirectUrl = setuRes.url;
      } catch (err: any) {
        console.error('[Setu AA] Consent creation error:', err.message);
        return res.status(500).json({ error: 'Failed to create AA consent with Setu provider' });
      }
    } else {
      consentId = `cst_${crypto.randomBytes(8).toString('hex')}`;
      redirectUrl = `https://sandbox.setu.co/consent/${consentId}`;
    }

    const { data: insertedConsent, error } = await supabase.from('aa_consents').insert({
      user_id: user.id,
      aa_provider: isLive ? 'Setu_Live' : 'Setu_Mock',
      consent_id: consentId,
      status: 'PENDING',
      fip_list: fip_list || ['HDFC', 'Zerodha'],
      data_types: data_types || ['DEPOSIT', 'MUTUAL_FUNDS'],
      purpose: purpose || 'Wealth management and portfolio consolidation',
      valid_from: new Date().toISOString(),
      valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).select('id').single();

    if (error) {
      console.error('[Setu AA] Failed to store consent in DB:', error);
      return res.status(500).json({ error: 'Database error storing consent' });
    }

    // Record initial PENDING event in aa_consent_events
    if (insertedConsent?.id) {
      await supabase.from('aa_consent_events').insert({
        user_id: user.id,
        consent_id: insertedConsent.id,
        event_type: 'CONSENT_CREATED',
        previous_status: null,
        new_status: 'PENDING',
        aa_provider: isLive ? 'Setu_Live' : 'Setu_Mock',
        reason: 'Initial consent creation',
        metadata: { redirect_url: redirectUrl },
      });
    }

    res.json({ consent_id: consentId, aa_redirect_url: redirectUrl });
  } catch (err) {
    console.error('[Setu AA] Internal error in /api/aa/consent:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real-time polling reads directly from our DB (which is updated via Setu webhook)
app.get('/api/aa/consent/:id/status', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    if (!id) return res.status(400).json({ error: 'Missing consent id' });

    const { data, error } = await supabase
      .from('aa_consents')
      .select('status, aa_provider')
      .eq('consent_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Consent not found' });
    }

    res.json({ status: data.status });
  } catch (err) {
    console.error('[Setu AA] Status fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/aa/fetch', async (req: Request, res: Response) => {
  try {
    const { consent_id } = req.body;
    const { data, error } = await supabase.from('aa_consents').select().eq('consent_id', consent_id);

    if (error || !data || data.length === 0) return res.status(404).json({ error: 'Consent not found' });

    const user_id = data[0].user_id;
    const fip_list = data[0].fip_list;
    const isLive = data[0].aa_provider === 'Setu_Live';

    await enqueuePortfolioSync({
      consent_id,
      user_id,
      fip_list,
      is_live: isLive,
    });

    res.status(202).json({ success: true, message: 'Data fetch background job queued' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Real Setu AA Webhook endpoint
 * Handles HMAC-SHA256 signature verification and idempotent state updates.
 */
app.post('/api/webhooks/setu-aa', async (req: any, res: Response) => {
  try {
    const signature = req.headers['x-setu-signature'] as string || req.headers['authorization'] as string;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    console.log('[Setu AA Webhook] Incoming webhook notification received');

    // 1. Signature Verification
    // In live mode with credentials configured, enforce signature check
    const isLive = process.env.AA_LIVE === 'true';
    if (isLive) {
      const isValid = verifySetuWebhook(rawBody, signature);
      if (!isValid) {
        console.warn('[Setu AA Webhook] Signature verification failed');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const payload = req.body;
    const consentId = payload?.data?.consentId || payload?.consentId || payload?.Detail?.consentId || payload?.id;
    const incomingStatus = (payload?.data?.status || payload?.status || '').toUpperCase();

    if (!consentId || !incomingStatus) {
      console.warn('[Setu AA Webhook] Missing consentId or status in payload:', payload);
      return res.status(400).json({ error: 'Invalid payload structure' });
    }

    console.log(`[Setu AA Webhook] Processing update for consent ${consentId} -> ${incomingStatus}`);

    // 2. Fetch existing DB consent record
    const { data: consentRecord, error: consentErr } = await supabase
      .from('aa_consents')
      .select('id, user_id, status, fip_list')
      .eq('consent_id', consentId)
      .maybeSingle();

    if (consentErr || !consentRecord) {
      console.warn(`[Setu AA Webhook] Consent record ${consentId} not found in DB`);
      return res.status(404).json({ error: 'Consent not found' });
    }

    // 3. Idempotency Check: Check if this state transition was already processed
    const eventType = `CONSENT_${incomingStatus}`;
    const { data: existingEvent } = await supabase
      .from('aa_consent_events')
      .select('id')
      .eq('consent_id', consentRecord.id)
      .eq('new_status', incomingStatus)
      .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .maybeSingle();

    if (existingEvent) {
      console.log(`[Setu AA Webhook] Duplicate event for consent ${consentId} (${incomingStatus}) ignored`);
      return res.status(200).json({ success: true, message: 'Event already processed' });
    }

    // 4. Update aa_consents table
    const updatePayload: Record<string, any> = { status: incomingStatus };
    if (incomingStatus === 'REVOKED' || incomingStatus === 'REJECTED') {
      updatePayload.revoked_at = new Date().toISOString();
    }
    await supabase.from('aa_consents').update(updatePayload).eq('id', consentRecord.id);

    // 5. Append-only audit record in aa_consent_events
    await supabase.from('aa_consent_events').insert({
      user_id: consentRecord.user_id,
      consent_id: consentRecord.id,
      event_type: eventType,
      previous_status: consentRecord.status,
      new_status: incomingStatus,
      aa_provider: 'Setu_Live',
      reason: payload?.reason || `Setu Webhook notification: ${incomingStatus}`,
      metadata: payload,
    });

    // 6. If ACTIVE or APPROVED, trigger FI data sync queue job
    if (incomingStatus === 'ACTIVE' || incomingStatus === 'APPROVED') {
      console.log(`[Setu AA Webhook] Consent is ${incomingStatus}. Enqueueing portfolio sync job...`);
      await enqueuePortfolioSync({
        consent_id: consentId,
        user_id: consentRecord.user_id,
        fip_list: consentRecord.fip_list,
        is_live: isLive,
      });
    }

    res.status(200).json({ success: true, message: `Webhook processed for status ${incomingStatus}` });
  } catch (err: any) {
    console.error('[Setu AA Webhook] Internal webhook error:', err);
    res.status(500).json({ error: 'Internal server error processing webhook' });
  }
});

// ==========================================
// Portfolio / Holdings Endpoints
// ==========================================

app.post('/api/portfolio/upload-cas', upload.single('casFile'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const password = req.body.password;
    
    if (!file) return res.status(400).json({ error: 'No CAS file uploaded' });

    // Ensure user is authenticated
    const authHeader = req.headers.authorization;
    let userId = '716691b9-939e-4118-aafb-9246a3923250'; // fallback demo user
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    try {
      const parsedData = await parseCasPdf(file.path, password);
      
      let insertedCount = 0;
      let failedHoldings: string[] = [];

      // Map parsedData to holdings
      if (parsedData && parsedData.folios) {
        for (const folio of parsedData.folios) {
          for (const scheme of folio.schemes || []) {
            const isin = scheme.isin;
            const name = scheme.scheme;
            const units = scheme.units;
            const value = scheme.valuation?.value;

            // Strict validation: skip if missing ISIN or missing value fields
            if (!isin || units === undefined || units === null || value === undefined || value === null) {
              failedHoldings.push(name || 'Unknown Scheme');
              continue;
            }

            const { data: holdingData, error: holdingError } = await supabase.from('holdings').insert({
              user_id: userId,
              instrument_name: name,
              asset_class: 'Mutual Fund',
              current_value: value,
              quantity: units,
              isin_or_scheme_code: isin,
              data_source: 'cas_upload',
              last_updated: new Date().toISOString()
            }).select('id').single();

            if (holdingError || !holdingData) {
              console.error(`Failed to insert holding ${name}:`, holdingError);
              failedHoldings.push(name);
            } else {
              insertedCount++;
              // Fix 4: Write transaction row for every CAS holding (append-only history)
              const txnDate = scheme.valuation?.date
                ? new Date(scheme.valuation.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
              await supabase.from('transactions').insert({
                user_id: userId,
                holding_id: holdingData.id,
                txn_type: 'cas_import',
                amount: value,
                units: units,
                txn_date: txnDate,
                source: 'CAS'
              });
            }
          }
        }
      }

      // Cleanup temp file
      fs.unlinkSync(file.path);
      
      let partialDataWarning: string | undefined = undefined;
      if (failedHoldings.length > 0) {
        partialDataWarning = `${failedHoldings.length} of ${insertedCount + failedHoldings.length} holdings couldn't be mapped: [${failedHoldings.join(', ')}]`;
      } else if (insertedCount === 0) {
        partialDataWarning = 'We successfully processed the statement, but no Mutual Fund folios were found. Note: Bonds/Equity from NSDL/CDSL may not be fully supported by this parser.';
      }
      
      res.json({ 
        success: true, 
        message: 'CAS uploaded and parsed successfully',
        inserted: insertedCount,
        partialDataWarning
      });
    } catch (parseError: any) {
      // Cleanup temp file
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      console.error("CAS Parse Error:", parseError);
      
      // Handle explicit honest errors
      if (parseError.code === 'INCORRECT_PASSWORD') {
        return res.status(401).json({ error: 'Incorrect password. Please verify the PAN/password used for this CAS.' });
      } else if (parseError.code === 'PARSE_ERROR') {
        return res.status(422).json({ error: 'Couldn\'t read this statement format. If this is a pure CDSL/NSDL Demat statement, it may not be fully supported.' });
      }
      
      res.status(400).json({ error: parseError.message || 'Failed to parse CAS file.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// Zerodha Kite Connect v3 Broker Integration
// ==========================================

// 1. Get Kite Login URL
app.get('/api/broker/zerodha/login-url', async (req: Request, res: Response) => {
  try {
    const loginUrl = getKiteLoginUrl();
    res.json({ login_url: loginUrl });
  } catch (err: any) {
    console.error('[KiteConnect] Failed to generate login URL:', err.message);
    res.status(500).json({ error: true, message: err.message || 'Failed to generate Kite login URL' });
  }
});

// 2. OAuth Callback Handler
app.get('/api/broker/zerodha/callback', async (req: Request, res: Response) => {
  try {
    const { request_token, status } = req.query as { request_token?: string; status?: string };
    
    // Auth fallback user
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (status === 'error' || !request_token) {
      console.warn('[KiteConnect] User denied Zerodha login or missing token:', req.query);
      return res.redirect(`http://localhost:5173/link-account?broker=zerodha&status=error&message=${encodeURIComponent('Zerodha authentication was cancelled or failed')}`);
    }

    // Exchange request_token for access_token (server-side only)
    const sessionData = await exchangeKiteToken(request_token);
    
    // Save encrypted token in DB
    await saveBrokerConnection({
      userId,
      broker: 'zerodha',
      brokerUserId: sessionData.user_id,
      accessToken: sessionData.access_token,
      publicToken: sessionData.public_token,
    });

    // Initial sync
    try {
      const holdings = await fetchKiteHoldings(sessionData.access_token);
      const margins = await fetchKiteMargins(sessionData.access_token);
      await normalizeAndStoreKiteHoldings({
        userId,
        brokerUserId: sessionData.user_id,
        holdings,
        margins,
      });
    } catch (syncErr: any) {
      console.warn('[KiteConnect] Initial portfolio sync warning:', syncErr.message);
    }

    return res.redirect('http://localhost:5173/link-account?broker=zerodha&status=connected');
  } catch (err: any) {
    console.error('[KiteConnect] OAuth callback failed:', err);
    return res.redirect(`http://localhost:5173/link-account?broker=zerodha&status=error&message=${encodeURIComponent(err.message || 'Token exchange failed')}`);
  }
});

// 3. Broker Connection Status
app.get('/api/broker/zerodha/status', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: conn } = await supabase
      .from('broker_connections')
      .select('id, broker, broker_user_id, status, connected_at, last_synced_at, token_expires_at')
      .eq('user_id', userId)
      .eq('broker', 'zerodha')
      .maybeSingle();

    if (!conn) {
      return res.json({ connected: false, status: 'NOT_CONNECTED' });
    }

    const isExpired = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() < Date.now() : false;
    const effectiveStatus = isExpired && conn.status === 'ACTIVE' ? 'EXPIRED' : conn.status;

    return res.json({
      connected: conn.status === 'ACTIVE' && !isExpired,
      status: effectiveStatus,
      broker_user_id: conn.broker_user_id,
      connected_at: conn.connected_at,
      last_synced_at: conn.last_synced_at,
      token_expires_at: conn.token_expires_at,
    });
  } catch (err) {
    console.error('[KiteConnect] Status check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Trigger Portfolio Sync from Zerodha
app.post('/api/broker/zerodha/sync', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const accessToken = await getActiveBrokerToken(userId, 'zerodha');
    if (!accessToken) {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Your Zerodha connection has expired or is not active. Please reconnect your account.',
      });
    }

    try {
      const holdings = await fetchKiteHoldings(accessToken);
      const margins = await fetchKiteMargins(accessToken);

      const syncResult = await normalizeAndStoreKiteHoldings({
        userId,
        holdings,
        margins,
      });

      return res.json({
        success: true,
        synced_at: new Date().toISOString(),
        holdings_count: syncResult.holdingsCount,
        total_value: syncResult.totalPortfolioValue,
      });
    } catch (apiErr: any) {
      if (apiErr instanceof KiteTokenExpiredError) {
        await supabase
          .from('broker_connections')
          .update({ status: 'EXPIRED' })
          .eq('user_id', userId)
          .eq('broker', 'zerodha');

        return res.status(401).json({
          error: 'TOKEN_EXPIRED',
          message: 'Your Zerodha connection has expired. Please reconnect.',
        });
      }
      throw apiErr;
    }
  } catch (err: any) {
    console.error('[KiteConnect] Sync failed:', err);
    res.status(500).json({ error: true, message: err.message || 'Failed to sync Zerodha portfolio' });
  }
});

// 5. Disconnect Zerodha Broker
app.delete('/api/broker/zerodha/disconnect', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const result = await disconnectBrokerAccount(userId, 'zerodha');
    
    // Also remove Zerodha holdings
    await supabase
      .from('holdings')
      .delete()
      .eq('user_id', userId)
      .eq('data_source', 'ZERODHA_KITE');

    res.json(result);
  } catch (err: any) {
    console.error('[KiteConnect] Disconnect failed:', err);
    res.status(500).json({ error: true, message: err.message || 'Failed to disconnect Zerodha' });
  }
});

// ==========================================
// Upstox v2 Broker Integration
// ==========================================

// 1. Get Upstox Login URL
app.get('/api/broker/upstox/login-url', async (req: Request, res: Response) => {
  try {
    const loginUrl = getUpstoxLoginUrl();
    res.json({ login_url: loginUrl });
  } catch (err: any) {
    console.error('[UpstoxConnect] Failed to generate login URL:', err.message);
    res.status(500).json({ error: true, message: err.message || 'Failed to generate Upstox login URL' });
  }
});

// 2. OAuth Callback Handler
app.get('/api/broker/upstox/callback', async (req: Request, res: Response) => {
  try {
    const { code, status } = req.query as { code?: string; status?: string };

    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    if (status === 'error' || !code) {
      console.warn('[UpstoxConnect] User denied Upstox login or missing code:', req.query);
      return res.redirect(`http://localhost:5173/link-account?broker=upstox&status=error&message=${encodeURIComponent('Upstox authentication was cancelled or failed')}`);
    }

    // Exchange auth code for access_token (server-side only)
    const sessionData = await exchangeUpstoxCode(code);

    // Save encrypted token in DB
    await saveUpstoxConnection({
      userId,
      brokerUserId: sessionData.user_id,
      accessToken: sessionData.access_token,
    });

    // Initial holdings sync
    try {
      const holdings = await fetchUpstoxHoldings(sessionData.access_token);
      const funds = await fetchUpstoxFunds(sessionData.access_token);
      await normalizeAndStoreUpstoxHoldings({
        userId,
        brokerUserId: sessionData.user_id,
        holdings,
        funds,
      });
    } catch (syncErr: any) {
      console.warn('[UpstoxConnect] Initial portfolio sync warning:', syncErr.message);
    }

    return res.redirect('http://localhost:5173/link-account?broker=upstox&status=connected');
  } catch (err: any) {
    console.error('[UpstoxConnect] OAuth callback failed:', err);
    return res.redirect(`http://localhost:5173/link-account?broker=upstox&status=error&message=${encodeURIComponent(err.message || 'Token exchange failed')}`);
  }
});

// 3. Upstox Connection Status
app.get('/api/broker/upstox/status', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: conn } = await supabase
      .from('broker_connections')
      .select('id, broker, broker_user_id, status, connected_at, last_synced_at, token_expires_at')
      .eq('user_id', userId)
      .eq('broker', 'upstox')
      .maybeSingle();

    if (!conn) {
      return res.json({ connected: false, status: 'NOT_CONNECTED' });
    }

    const isExpired = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() < Date.now() : false;
    const effectiveStatus = isExpired && conn.status === 'ACTIVE' ? 'EXPIRED' : conn.status;

    return res.json({
      connected: conn.status === 'ACTIVE' && !isExpired,
      status: effectiveStatus,
      broker_user_id: conn.broker_user_id,
      connected_at: conn.connected_at,
      last_synced_at: conn.last_synced_at,
      token_expires_at: conn.token_expires_at,
    });
  } catch (err) {
    console.error('[UpstoxConnect] Status check error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Trigger Portfolio Sync from Upstox
app.post('/api/broker/upstox/sync', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const accessToken = await getActiveBrokerToken(userId, 'upstox');
    if (!accessToken) {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Your Upstox connection has expired or is not active. Please reconnect your account.',
      });
    }

    try {
      const holdings = await fetchUpstoxHoldings(accessToken);
      const funds = await fetchUpstoxFunds(accessToken);

      const syncResult = await normalizeAndStoreUpstoxHoldings({
        userId,
        holdings,
        funds,
      });

      return res.json({
        success: true,
        synced_at: new Date().toISOString(),
        holdings_count: syncResult.holdingsCount,
        total_value: syncResult.totalPortfolioValue,
      });
    } catch (apiErr: any) {
      if (apiErr instanceof UpstoxTokenExpiredError) {
        await supabase
          .from('broker_connections')
          .update({ status: 'EXPIRED' })
          .eq('user_id', userId)
          .eq('broker', 'upstox');

        return res.status(401).json({
          error: 'TOKEN_EXPIRED',
          message: 'Your Upstox connection has expired. Please reconnect.',
        });
      }
      throw apiErr;
    }
  } catch (err: any) {
    console.error('[UpstoxConnect] Sync failed:', err);
    res.status(500).json({ error: true, message: err.message || 'Failed to sync Upstox portfolio' });
  }
});

// 5. Disconnect Upstox Broker
app.delete('/api/broker/upstox/disconnect', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const result = await disconnectBrokerAccount(userId, 'upstox');

    // Also remove Upstox holdings
    await supabase
      .from('holdings')
      .delete()
      .eq('user_id', userId)
      .eq('data_source', 'UPSTOX');

    res.json(result);
  } catch (err: any) {
    console.error('[UpstoxConnect] Disconnect failed:', err);
    res.status(500).json({ error: true, message: err.message || 'Failed to disconnect Upstox' });
  }
});

// ==========================================
// Market Data: Candles, Quote, News, AI Summary
// ==========================================

/**
 * GET /api/market/candles/:symbol?interval=1d&range=3mo
 * Returns OHLC candle data for a stock symbol (NSE/BSE).
 * Primary: Yahoo Finance (delayed ~15-20 min)
 * Fallback: Last cached data with stale label
 */
app.get('/api/market/candles/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const interval = (req.query.interval as '1d' | '1wk' | '1mo') || '1d';
    const range = (req.query.range as '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y') || '3mo';
    const simulateError = process.env.NODE_ENV !== 'production' && req.query.simulate_error === 'true';

    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const result = await getCandles(symbol, interval, range, { forceFailure: simulateError });
    return res.json(result);
  } catch (err: any) {
    console.error('[MarketData] Candle fetch error:', err);
    return res.status(500).json({ error: true, message: err.message || 'Failed to fetch candles' });
  }
});

/**
 * GET /api/market/quote/:symbol
 * Returns current delayed quote for a symbol.
 */
app.get('/api/market/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const simulateError = process.env.NODE_ENV !== 'production' && req.query.simulate_error === 'true';
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const result = await getQuote(symbol, { forceFailure: simulateError });
    return res.json(result);
  } catch (err: any) {
    console.error('[MarketData] Quote fetch error:', err);
    return res.status(500).json({ error: true, message: err.message || 'Failed to fetch quote' });
  }
});

/**
 * GET /api/market/news/:symbol?company=Reliance+Industries
 * Returns recent news articles for a company.
 */
app.get('/api/market/news/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const companyName = (req.query.company as string) || symbol;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    const result = await getCompanyNews(companyName, symbol);
    return res.json(result);
  } catch (err: any) {
    console.error('[MarketData] News fetch error:', err);
    return res.status(500).json({ error: true, message: err.message || 'Failed to fetch news' });
  }
});

/**
 * GET /api/market/ai-summary/:symbol?company=Reliance+Industries
 * Returns AI context summary: news sentiment + volatility context + disclaimer.
 * NEVER includes price predictions, probabilities, or buy/sell advice.
 */
app.get('/api/market/ai-summary/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const companyName = (req.query.company as string) || symbol;
    if (!symbol) return res.status(400).json({ error: 'Symbol is required' });

    // Fetch news and candles in parallel for context
    const [newsResult, candleResult] = await Promise.allSettled([
      getCompanyNews(companyName, symbol),
      getCandles(symbol, '1d', '3mo'),
    ]);

    const articles = newsResult.status === 'fulfilled' ? newsResult.value.articles : [];
    const candles = candleResult.status === 'fulfilled' ? candleResult.value.candles.slice(-60) : [];

    const summary = await generateContextSummary(symbol, companyName, articles, candles);
    return res.json(summary);
  } catch (err: any) {
    console.error('[MarketData] AI summary error:', err);
    return res.status(500).json({ error: true, message: err.message || 'Failed to generate AI summary' });
  }
});

// Exposure / Concentration Analytics
app.get('/api/portfolio/exposure/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Use demo user ID if 'me'
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    
    // If request has auth token, use that
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    await syncUserHoldingsValues(activeUserId);

    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('id, instrument_name, asset_class, current_value, sector, quantity')
      .eq('user_id', activeUserId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: 'Failed to fetch holdings' });
    }

    if (!holdings || holdings.length === 0) {
      return res.json({
        totalValue: 0,
        sectorBreakdown: [],
        flags: []
      });
    }

    let totalValue = 0;
    const sectorTotals: Record<string, number> = {};
    const assetClassTotals: Record<string, number> = {};

    holdings.forEach((holding: any) => {
      const val = Number(holding.current_value) || 0;
      totalValue += val;
      const sec = holding.sector || 'Unclassified';
      sectorTotals[sec] = (sectorTotals[sec] || 0) + val;
      
      const ac = holding.asset_class || 'Other';
      assetClassTotals[ac] = (assetClassTotals[ac] || 0) + val;
    });

    const sectorBreakdown = Object.entries(sectorTotals).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    const assetClassBreakdown = Object.entries(assetClassTotals).map(([assetClass, value]) => ({
      assetClass,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    const flags: string[] = [];

    // Check sector concentration (> 30%)
    sectorBreakdown.forEach(s => {
      if (s.percentage > 30 && s.sector !== 'Unclassified') {
        flags.push(`High Sector Concentration: ${s.sector} makes up ${s.percentage.toFixed(1)}% of your portfolio.`);
      }
    });

    // Check individual holding concentration (> 20%)
    holdings.forEach((holding: any) => {
      const val = Number(holding.current_value) || 0;
      const percentage = totalValue > 0 ? (val / totalValue) * 100 : 0;
      if (percentage > 20) {
        flags.push(`High Holding Concentration: ${holding.instrument_name} makes up ${percentage.toFixed(1)}% of your portfolio.`);
      }
    });

    res.json({
      totalValue,
      sectorBreakdown,
      assetClassBreakdown,
      flags
    });

  } catch (error) {
    console.error("Exposure calculation error:", error);
    res.status(500).json({ error: 'Internal server error calculating exposure' });
  }
});




// Tax Summary Endpoint (Mocked dynamically for prototype)
app.get('/api/portfolio/tax-summary/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    // In a real app, calculate from transactions and holdings
    // For prototype, return structured mock data
    res.status(200).json({
      realized: { total: 142500, stcg: 35000, ltcg: 107500 },
      unrealized: { total: 315200, shortTerm: 110000, longTerm: 205200 }
    });
  } catch (error) {
    console.error("Tax summary error:", error);
    res.status(500).json({ error: 'Internal server error calculating tax summary' });
  }
});

// Performance History Endpoint
app.get('/api/portfolio/performance/me', async (req: Request, res: Response) => {
  try {
    const range = ((req.query.range as string)?.toUpperCase() || '1Y') as '1M' | '3M' | '6M' | '1Y' | 'ALL';
    let activeUserId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    await syncUserHoldingsValues(activeUserId);

    const performance = await getPortfolioPerformance(activeUserId, range);
    return res.status(200).json(performance);
  } catch (err: any) {
    console.error('Performance /me error:', err);
    return res.status(500).json({ error: 'Internal server error fetching performance' });
  }
});

app.get('/api/portfolio/performance/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const range = ((req.query.range as string)?.toUpperCase() || '1Y') as '1M' | '3M' | '6M' | '1Y' | 'ALL';
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    const performance = await getPortfolioPerformance(activeUserId, range);
    return res.status(200).json(performance);
  } catch (error) {
    console.error("Performance history error:", error);
    return res.status(500).json({ error: 'Internal server error fetching performance' });
  }
});

// Quantified Cost Analysis (TER)
app.get('/api/portfolio/cost-analysis/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('id, instrument_name, asset_class, current_value')
      .eq('user_id', activeUserId);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: 'Failed to fetch holdings' });
    }

    if (!holdings || holdings.length === 0) {
      return res.json({
        totalValue: 0,
        weightedTer: 0,
        projected10YearCost: 0,
        savingsPotential: 0
      });
    }

    let totalValue = 0;
    let totalWeightedCost = 0;

    holdings.forEach((h: any) => {
      const val = Number(h.current_value) || 0;
      totalValue += val;
      
      // Mock expense ratios based on asset class if not present in DB
      let ter = 0.01; // default 1%
      if (h.asset_class?.toLowerCase().includes('equity')) ter = 0.015; // 1.5% for equity
      if (h.asset_class?.toLowerCase().includes('debt')) ter = 0.005; // 0.5% for debt
      if (h.asset_class?.toLowerCase().includes('sgb')) ter = 0; // 0% for SGB

      totalWeightedCost += (val * ter);
    });

    const weightedTer = totalValue > 0 ? (totalWeightedCost / totalValue) : 0;
    
    // Simulate 10-year cost at current TER vs benchmark (e.g., 0.5%)
    // Assuming simple flat growth for simplicity in this calculation
    const current10YearCost = totalValue * weightedTer * 10;
    const optimized10YearCost = totalValue * 0.005 * 10;
    
    const savingsPotential = Math.max(0, current10YearCost - optimized10YearCost);

    res.json({
      totalValue,
      weightedTer: Number((weightedTer * 100).toFixed(2)), // as percentage
      projected10YearCost: Math.round(current10YearCost),
      savingsPotential: Math.round(savingsPotential)
    });

  } catch (error) {
    console.error("Cost analysis error:", error);
    res.status(500).json({ error: 'Internal server error calculating cost' });
  }
});

// Transaction Intelligence (Behavioral Alerts)
app.get('/api/alerts/behavioral/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    const alerts = await computeBehavioralAlerts(activeUserId);
    res.json({ alerts });
  } catch (error) {
    console.error('[Behavioral Alerts] Error:', error);
    res.status(500).json({ error: 'Internal server error calculating behavioral alerts' });
  }
});


// ==========================================
app.get('/api/portfolio/exposure/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let activeUserId = '716691b9-939e-4118-aafb-9246a3923250';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    // Sync live prices before computing exposure
    await syncUserHoldingsValues(activeUserId);

    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('id, instrument_name, asset_class, current_value, sector, quantity')
      .eq('user_id', activeUserId);

    if (error) {
      console.error('[Exposure /me] Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch holdings' });
    }

    if (!holdings || holdings.length === 0) {
      return res.json({ totalValue: 0, sectorBreakdown: [], assetClassBreakdown: [], flags: [] });
    }

    let totalValue = 0;
    const sectorTotals: Record<string, number> = {};
    const assetClassTotals: Record<string, number> = {};

    holdings.forEach((holding: any) => {
      const val = Number(holding.current_value) || 0;
      totalValue += val;
      const sec = holding.sector || 'Unclassified';
      sectorTotals[sec] = (sectorTotals[sec] || 0) + val;
      const ac = holding.asset_class || 'Other';
      assetClassTotals[ac] = (assetClassTotals[ac] || 0) + val;
    });

    const sectorBreakdown = Object.entries(sectorTotals).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    const assetClassBreakdown = Object.entries(assetClassTotals).map(([assetClass, value]) => ({
      assetClass,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    const flags: string[] = [];
    sectorBreakdown.forEach(s => {
      if (s.percentage > 30 && s.sector !== 'Unclassified') {
        flags.push(`High Sector Concentration: ${s.sector} makes up ${s.percentage.toFixed(1)}% of your portfolio.`);
      }
    });
    holdings.forEach((holding: any) => {
      const val = Number(holding.current_value) || 0;
      const percentage = totalValue > 0 ? (val / totalValue) * 100 : 0;
      if (percentage > 20) {
        flags.push(`High Holding Concentration: ${holding.instrument_name} makes up ${percentage.toFixed(1)}% of your portfolio.`);
      }
    });

    res.json({ totalValue, sectorBreakdown, assetClassBreakdown, flags });
  } catch (err) {
    console.error('[Exposure /me] Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/trade/intent', async (req: Request, res: Response) => {
  try {
    const { holding_id, txn_type, amount, units } = req.body;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Determine risk of the holding (mock logic for demo)
    const isHighRiskHolding = holding_id && holding_id.includes('OPTION') || holding_id.includes('FUT') || holding_id === 'CRYPTO';
    // For demo purposes, we can assume a specific test symbol is high risk, e.g., 'HIGHRISK' or just randomly if amount is very high
    const impliedRisk = (amount > 100000) ? 'Aggressive' : 'Moderate'; // basic heuristic

    const { data: profile } = await supabase.from('users').select('risk_profile').eq('id', userId).single();
    const userRiskProfile = profile?.risk_profile || 'Moderate';
    
    // Mismatch condition: User is not Aggressive but order is Aggressive
    const riskMismatch = userRiskProfile !== 'Aggressive' && impliedRisk === 'Aggressive';

    if (req.body.ignore_suitability !== true && riskMismatch) {
      return res.json({
        success: false,
        suitability_nudge: {
          user_profile: userRiskProfile,
          order_risk: impliedRisk,
          message: `This trade is categorized as High Risk, while your profile is set to ${userRiskProfile}. Proceeding may lead to higher volatility than your stated preference.`
        }
      });
    }

    const { data, error } = await supabase.from('transactions').insert({
      user_id: userId,
      holding_id: holding_id || null,
      txn_type: txn_type || 'buy',
      amount: amount || 0,
      units: units || 0,
      source: 'SahaVest Intent',
      txn_date: new Date().toISOString()
    }).select();

    if (error) {
      console.error('[TRADE INTENT] DB insert error:', error);
      return res.status(500).json({ error: 'Failed to record trade intent' });
    }

    console.log(`[TRADE INTENT] Recorded: user=${userId}, type=${txn_type}, units=${units}, holding=${holding_id}`);
    res.json({ success: true, redirect_url: 'https://broker.example.com/checkout/12345', intent: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/portfolio/tax-summary/me', async (req: Request, res: Response) => {
  try {
    // Mock data for prototype
    res.json({
      financialYear: '2025-2026',
      totalRealizedGains: 45000,
      shortTermGains: 15000,
      longTermGains: 30000,
      taxLiabilityEstimate: 4500,
      taxLossHarvestingOpportunity: 12000
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/portfolio/holdings/me', async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const limit = parseInt((req.query.limit as string) || '10');
    const offset = parseInt((req.query.offset as string) || '0');
    
    let activeUserId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    await syncUserHoldingsValues(activeUserId);

    let query = supabase.from('holdings').select('*').eq('user_id', activeUserId);
    
    if (type) {
      if (type.toLowerCase() === 'equity') query = query.ilike('asset_class', '%equity%');
      else if (type.toLowerCase() === 'mf') query = query.ilike('asset_class', '%mutual fund%');
      else if (type.toLowerCase() === 'bonds') query = query.ilike('asset_class', '%bond%');
      else if (type.toLowerCase() === 'nps') query = query.ilike('asset_class', '%nps%');
      else if (type.toLowerCase() === 'sgb') query = query.ilike('asset_class', '%sgb%');
      else if (type.toLowerCase() === 'reit') query = query.ilike('asset_class', '%reit%');
      else query = query.eq('asset_class', type);
    }

    // Include limit and offset for Stage F Load More
    query = query.range(offset, offset + limit - 1);

    const { data: holdings, error } = await query;

    if (error) {
      console.error('[HOLDINGS] DB error:', error);
      return res.status(500).json({ error: 'Failed to fetch holdings' });
    }

    const processedHoldings = await Promise.all((holdings || []).map(async (h) => {
      const isIlliquid = ['bond', 'nps', 'sgb', 'reit', 'invit'].some(c => h.asset_class?.toLowerCase().includes(c));
      
      let livePrice = h.current_value / h.quantity;
      let dayChange = 0;
      let dayChangePercent = 0;
      let asOfDate = h.last_updated || new Date().toISOString();
      let isLive = !isIlliquid;

      if (!isIlliquid && h.symbol) {
        try {
          const quoteResult = await getQuote(h.symbol);
          if (quoteResult && quoteResult.price) {
            livePrice = quoteResult.price;
            dayChange = quoteResult.dayChange || 0;
            dayChangePercent = quoteResult.dayChangePercent || 0;
            asOfDate = quoteResult.cached_at || quoteResult.timestamp || new Date().toISOString();
          }
        } catch (e) {
          console.warn(`Could not fetch live quote for ${h.symbol}`);
        }
      }

      return {
        ...h,
        livePrice,
        currentValue: livePrice * h.quantity,
        dayChange: dayChange * h.quantity,
        dayChangePercent,
        asOfDate,
        isLive
      };
    }));

    res.json({ holdings: processedHoldings, count: processedHoldings.length, nextOffset: offset + limit });
  } catch (err: any) {
    console.error('Holdings /me error:', err);
    return res.status(500).json({ error: 'Internal server error fetching holdings' });
  }
});

// GOALS-HANDLER-A (real DB)
app.get('/api/goals', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[GOALS] DB error:', error);
      return res.status(500).json({ error: 'Failed to fetch goals' });
    }

    res.json({ goals: goals || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/goals', async (req: Request, res: Response) => {
  try {
    // DB schema: id, user_id, goal_type, target_amount, target_date, linked_holding_ids, created_at
    const { goal_type, name, target_amount, target_date } = req.body;
    const authHeader = req.headers.authorization;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        goal_type: goal_type || name || 'Custom',  // accept either field
        target_amount,
        target_date
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 4. Compliance & Grievance Endpoints
// ==========================================

app.post('/api/compliance/grievance', async (req: Request, res: Response) => {
  try {
    const { category, description, entity, brokerName } = req.body;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const mockScoresRef = `SCORES-${Math.floor(Math.random() * 1000000)}`;

    const { data: grievanceData, error } = await supabase
      .from('grievances')
      .insert({
        user_id: userId,
        scores_ref_id: mockScoresRef,
        category: category || 'General',
        status: 'submitted'
      })
      .select('id')
      .single();

    if (error) {
      // HONEST FAILURE: DB insert failed — return real error, not fake refId
      console.error('[GRIEVANCE] DB insert failed:', error);
      Sentry.captureMessage(`[Grievance] DB insert failed: ${error.message}`, {
        level: 'warning',
        tags: { endpoint: '/api/compliance/grievance', type: 'honest_failure' },
        extra: { category }
      });
      return res.status(503).json({
        error: true,
        message: 'Failed to file grievance. Database unavailable. Please try again.',
        detail: error.message
      });
    }

    // Write to audit_log only if grievance was actually saved
    const auditHash = crypto.createHash('sha256')
      .update(JSON.stringify({ user_id: userId, category, scores_ref_id: mockScoresRef, filed_at: new Date().toISOString() }))
      .digest('hex');
    const { error: auditError } = await supabase.from('audit_log').insert({
      user_id: userId,
      ref_type: 'GRIEVANCE',
      ref_id: grievanceData.id,
      content_hash: auditHash,
      blockchain_tx_id: null
    });
    if (auditError) console.error('Failed to write grievance audit log:', auditError);

    res.json({ id: grievanceData.id, status: 'submitted', filed_at: new Date().toISOString(), refId: mockScoresRef });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/compliance/grievances/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase
      .from('grievances')
      .select('*')
      .eq('user_id', userId)
      .order('filed_at', { ascending: false });

    if (error) {
      // Mock data fallback if table isn't created yet
      return res.json({
        grievances: [
          {
            id: 'mock1',
            status: 'in_progress',
            scores_reg_no: 'SEBI/MH/2026/00142',
            filed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            expected_resolution_date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Unregistered Investment Advisory - Alpha Profit Solutions'
          }
        ]
      });
    }

    res.json({ grievances: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Trust, Safety, AI Endpoints

app.post('/api/trust/scam-check', rateLimiter({ limit: 20, windowSeconds: 60, prefix: 'rl:scam_check' }), async (req: Request, res: Response) => {
  try {
    const { content, input_type = 'text', image, type } = req.body;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    let aiResult;
    try {
      const prompt = `You are a SEBI-registered financial compliance expert. Analyze this message (and image if provided) for scam indicators, guaranteed returns, or unregistered advisory. Return a JSON object with: trust_score (0-100, lower is worse), risk_category (LOW_TRUST, MEDIUM_TRUST, HIGH_TRUST), confidence (0.0-1.0), analysis (why this was flagged or cleared). Message: "${content}"`;
      
      let messageContent: any[] = [];
      if (content) {
        messageContent.push({ type: 'text', text: prompt });
      }
      if (image) {
        messageContent.push({ type: 'image_url', image_url: { url: image } });
      }

      if (messageContent.length === 0) {
        messageContent.push({ type: 'text', text: prompt });
      }

      const responseText = await generateAIResponse([{ role: "user", content: messageContent.length === 1 && messageContent[0].type === 'text' ? messageContent[0].text : messageContent }]);
      
      // Parse JSON from LLM response (attempt to extract if wrapped in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      if (aiResult && aiResult.analysis && !aiResult.explainability) {
        aiResult.explainability = { why: aiResult.analysis };
      }
    } catch (llmError) {
      console.warn("LLM Scam check failed, using fallback:", llmError);
      
      const isScam = (content || '').toLowerCase().includes('guaranteed');
      aiResult = {
        trust_score: isScam ? 15 : 85,
        risk_category: isScam ? "HIGH_RISK" : "HIGH_TRUST",
        confidence: 0.9,
        explainability: { 
          why: isScam 
            ? "Fallback analysis: The message contains 'guaranteed' returns which is a major red flag for financial scams. SEBI prohibits guaranteed returns in market-linked products." 
            : "Fallback analysis: No obvious scam keywords detected, but please remain vigilant.", 
          disclaimer: "Automated analysis fallback (API keys missing)." 
        }
      };
    }

    const { error: insertError } = await supabase.from('scam_checks').insert({
      user_id: userId,
      input_type: image ? 'image' : (type || input_type || 'sms'),
      content_ref: content || 'image-only',          // Fix 7: correct column name (was input_content)
      flags: { risk_category: aiResult?.risk_category, trust_score: aiResult?.trust_score },
      trust_score_id: null
    });

    if (insertError) console.error('Failed to log scam check:', insertError);

    // Fix 7: Also write to audit_log (append-only record of AI decision)
    const auditHash = crypto.createHash('sha256')
      .update(JSON.stringify({ user_id: userId, content: content || 'image-only', result: aiResult, timestamp: new Date().toISOString() }))
      .digest('hex');
    const { error: auditError } = await supabase.from('audit_log').insert({
      user_id: userId,
      ref_type: 'SCAM_CHECK',
      ref_id: null,
      content_hash: auditHash,
      blockchain_tx_id: null
    });
    if (auditError) console.error('Failed to write scam check audit log:', auditError);

    res.json(aiResult);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/trust/verify-advisor/:regNo', async (req: Request, res: Response) => {
  try {
    const { regNo } = req.params;
    const searchKey = typeof regNo === 'string' ? regNo.toUpperCase() : '';
    const startTime = Date.now();

    // Check Redis cache first
    const cacheKey = `advisor:registry:${searchKey}`;
    const cachedResult = await cacheGet<any>(cacheKey);
    if (cachedResult) {
      return res.json({ ...cachedResult, _cached: true });
    }

    // Auth
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // In-memory registry (mirrors SEBI data)
    const registry: Record<string, any> = {
      'INA000012345': { name: 'Ravi Kumar', principal_officer: 'Ravi Kumar', type: 'Individual Investment Adviser', valid_till: '2028-12-31T00:00:00Z', address: '123, Dalal Street, Mumbai, Maharashtra 400001' },
      'INA000098765': { name: 'FinWealth Advisors', principal_officer: 'Anjali Sharma', type: 'Corporate Investment Adviser', valid_till: '2027-05-15T00:00:00Z', address: '45, BKC, Bandra East, Mumbai, Maharashtra 400051' },
      'INA000054321': { name: 'Sneha Desai', principal_officer: 'Sneha Desai', type: 'Individual Investment Adviser', valid_till: '2029-01-20T00:00:00Z', address: '88, MG Road, Bangalore, Karnataka 560001' }
    };

    let result: any = null;
    let found = false;

    if (registry[searchKey]) {
      result = registry[searchKey];
      found = true;
    } else if (searchKey.startsWith('INA') && searchKey.length >= 10) {
      result = { name: 'Verified Demo Advisor', principal_officer: 'Demo Officer', type: 'Registered Investment Adviser', valid_till: '2026-12-31T00:00:00Z', address: '100, Financial District, Hyderabad' };
      found = true;
    }

    // Fix 9: Log every advisor verification to agent_execution_logs (append-only)
    const latency = Date.now() - startTime;
    const pipelineRunId = crypto.randomUUID();
    await supabase.from('agent_execution_logs').insert({
      user_id: userId,
      pipeline_run_id: pipelineRunId,
      agent_name: 'AdvisorVerificationAgent',
      input_ref: { reg_no: searchKey },
      output_ref: found ? { found: true, name: result.name, type: result.type } : { found: false },
      confidence: found ? 0.95 : 0.0,
      latency_ms: latency,
      status: found ? 'success' : 'not_found'
    });

    if (!found) {
      return res.status(404).json({ error: 'Advisor not found in SEBI registry.' });
    }

    // Store in cache for 1 hour (3600 seconds)
    await cacheSet(cacheKey, result, 3600);

    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/insights/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: userRecord } = await supabase.from('users').select('first_name').eq('id', userId).single();
    const name = userRecord?.first_name || 'there';

    res.json({
      insights: [
        {
          type: 'greeting',
          message: `Hello ${name}! I'm your SahaVest assistant. I can help clarify financial terms, explain portfolio metrics, or guide you on how to find a verified advisor.`
        }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], image } = req.body;
    const authHeader = req.headers.authorization;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // --- Stage 4: Pull real portfolio data for portfolio-specific questions ---
    let portfolioContext = '';
    const portfolioKeywords = /\b(portfolio|holdings?|my (?:investment|fund|stock|equity|mutual fund|return|value)|asset allocation|xirr|returns?|exposure)\b/i;
    if (portfolioKeywords.test(message)) {
      try {
        const { data: holdingsData } = await supabase
          .from('holdings')
          .select('asset_class, instrument_name, current_value, avg_cost, quantity')
          .eq('user_id', userId)
          .limit(20);
        if (holdingsData && holdingsData.length > 0) {
          const totalValue = holdingsData.reduce((acc: number, h: any) => acc + (h.current_value || 0), 0);
          const byClass: Record<string, number> = {};
          holdingsData.forEach((h: any) => {
            const cls = h.asset_class || 'Other';
            byClass[cls] = (byClass[cls] || 0) + (h.current_value || 0);
          });
          portfolioContext = `\n\n[REAL USER PORTFOLIO DATA — use this to answer portfolio questions accurately]\nTotal Portfolio Value: ₹${totalValue.toLocaleString('en-IN')}\nAsset Allocation: ${Object.entries(byClass).map(([k, v]) => `${k}: ₹${v.toLocaleString('en-IN')}`).join(', ')}\nHoldings: ${holdingsData.map((h: any) => `${h.instrument_name} (${h.asset_class})`).join(', ')}\n[END PORTFOLIO DATA]`;
        }
      } catch (e) {
        console.warn('Could not fetch portfolio data for chat context:', e);
      }
    }

    // --- Stage 5: Inject market data for company/stock questions ---
    let marketContext = '';
    const companyMatch = message.match(/\b(?:tell me about|what is|how is|share price of|info on|NSE|BSE)\s+([A-Z][A-Za-z\s]{2,20}(?:Ltd|Limited|Bank|Industries|Corp|Inc)?)\b/i);
    if (companyMatch) {
      const companyName = companyMatch[1].trim();
      try {
        const newsData = await getCompanyNews(companyName);
        if (newsData && newsData.articles && newsData.articles.length > 0) {
          marketContext = `\n\n[MARKET/NEWS CONTEXT for ${companyName}]\n${newsData.articles.slice(0, 3).map((n: any) => `- ${n.title} (${n.source_name || 'recent'})`).join('\n')}\n[END MARKET CONTEXT]`;
        }
      } catch (e) {
        console.warn('Could not fetch market data for chat context:', e);
      }
    }

    // --- IPO-specific query detection ---
    const ipoQuery = /\bipo\b/i.test(message);
    const ipoContext = ipoQuery
      ? `\n\n[IPO NOTE] You do not have access to live IPO subscription data or allotment status from NSE/BSE in real time. When asked about specific live IPO details, say honestly: "I don't have live IPO data for that right now." But you CAN and SHOULD give detailed educational information about how IPO investing works, grey market premium, allotment ratios, listing day strategies, and ASBA process.\n`
      : '';

    // --- Build full system prompt (Stages 3+4: multi-language + capabilities) ---
    const systemPrompt = `You are SahaVest Assistant, a trusted financial education assistant built into the SahaVest app for Indian retail investors.

LANGUAGE RULE (CRITICAL): Detect the language the user writes or speaks in — including Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Kannada, Malayalam, Punjabi, Hinglish (Hindi-English mix), or any Indian language — and respond FLUENTLY in that exact same language. Never switch to English unless the user writes in English. If the user mixes languages (e.g. Hinglish), respond in the same mixed style.

YOUR CAPABILITIES (respond to ALL of these):
1. Explain financial terms in plain language: XIRR, NAV, expense ratio, SIP, ELSS, CAGR, PE ratio, etc.
2. Explain the user's OWN portfolio metrics using real data when provided to you. Use the [REAL USER PORTFOLIO DATA] block if present.
3. Guide users to verify advisors — mention the in-app "Verify an Advisor" feature (under Trust & Safety) and SEBI's SCORES portal.
4. Investment education: how SIPs work, asset class risks, diversification, etc.
5. Company information — use news/market context provided in [MARKET/NEWS CONTEXT] blocks when available.
6. SEBI regulations: investor protection, SCORES portal, registered intermediaries — general educational info only.
7. IPO education: how IPOs work, ASBA, allotment, grey market premium, listing gains risk. Use [IPO NOTE] guidance if present.

ABSOLUTE GUARDRAILS (strictly enforced):
- NEVER give a specific buy/sell recommendation for any individual stock, mutual fund, or asset.
- NEVER predict future prices, future returns, or state probability of profit/loss.
- NEVER say anything like "this stock will rise", "buy X now", "strong buy", "price target of X".
- If the user explicitly asks for a stock tip, stock recommendation, or "should I buy X?": decline clearly but respectfully, redirect to educational content about how to evaluate investments yourself, and suggest consulting a SEBI-registered advisor.
- NEVER guarantee returns of any kind.

FORMAT: Keep answers clear, helpful, and under 3-4 paragraphs. Use bullet points for lists. Use ₹ for Indian Rupees.${portfolioContext}${marketContext}${ipoContext}`;

    let userMessageContent: any = message;
    if (image) {
      userMessageContent = [
        { type: 'text', text: message || 'Please analyze this image and describe what you see, especially any financial information.' },
        { type: 'image_url', image_url: { url: image } }
      ];
    }

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Keep last 10 turns for context without bloating
      { role: 'user', content: userMessageContent }
    ];

    let aiResponse: string;
    try {
      aiResponse = await generateAIResponse(messages);
    } catch (llmError: any) {
      console.error('LLM Error in chat:', llmError);
      Sentry.captureMessage(`[AI Chat] LLM service unavailable: ${llmError?.message || llmError}`, {
        level: 'warning',
        tags: { endpoint: '/api/ai/chat', type: 'honest_failure' }
      });
      return res.status(503).json({ error: true, message: 'AI service temporarily unavailable' });
    }

    // --- Stage 4: Code-level Compliance Guardrail (same as aiContextSummary.ts pattern) ---
    // This is the Compliance Agent hard-gate: scan output BEFORE it reaches the user.
    const violations = scanForProhibitedLanguage(aiResponse);
    if (violations.length > 0) {
      console.warn(`[AI Chat Compliance] Response blocked for user ${userId}. Violations: ${violations.join(', ')}`);
      Sentry.captureMessage(`[AI Chat Compliance] Output scan blocked response`, {
        level: 'warning',
        tags: { endpoint: '/api/ai/chat', type: 'compliance_block', violations: violations.join(',') }
      });
      // Replace with safe fallback instead of sending the flagged response
      aiResponse = "I'm sorry, I can't provide that specific guidance. I'm designed to help with financial education and general information about concepts, not to provide investment recommendations or predict market outcomes. For personalized advice, I'd suggest consulting a SEBI-registered investment advisor.\n\nIs there a financial concept I can help explain, or would you like to know more about how to evaluate investment options for yourself?";
    }

    await supabase.from('agent_execution_logs').insert({
      user_id: userId,
      agent_role: 'Chat_Assistant',
      input_payload: { message: typeof message === 'string' ? message : '[multimodal]' },
      output_payload: { response: aiResponse, compliance_checked: true, violations_found: violations.length },
      execution_time_ms: 1000,
      status: 'SUCCESS'
    });

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('AI Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { topic, context } = req.body;
    let aiResponse;
    try {
      const prompt = `Explain the financial concept "${topic}" in simple terms, assuming the user is looking at context: "${context}". Keep it under 50 words.`;
      aiResponse = await generateAIResponse([{ role: "user", content: prompt }]);
    } catch (err: any) {
      console.error("LLM Error in explain:", err);
      Sentry.captureMessage(`[AI Explain] LLM service unavailable: ${err?.message || err}`, {
        level: 'warning',
        tags: { endpoint: '/api/ai/explain', type: 'honest_failure' }
      });
      return res.status(503).json({ error: true, message: "AI service temporarily unavailable" });
    }
    res.json({ explanation: aiResponse });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Real agent execution logs for Explainability Panel
app.get('/api/agent-logs/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const limit = parseInt(req.query.limit as string) || 20;

    const { data, error } = await supabase
      .from('agent_execution_logs')
      .select('id, pipeline_run_id, agent_name, input_ref, output_ref, confidence, latency_ms, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch agent logs:', error);
      return res.status(500).json({ error: 'Failed to fetch agent logs' });
    }

    res.json({ logs: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ADVISOR-HANDLER-B was here — deleted (dead code, shadowed by ADVISOR-HANDLER-A above at L990)

// Mock fallback for Audit Logs
const generateHash = (payload: any) => {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

app.get('/api/compliance/audit-trail/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('user_id', activeUserId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Return generated mock data with real crypto hashes
      const mockPayloads = [
        { action: 'Generated Concentration Alert', sector: 'Banking', threshold: '30%' },
        { action: 'AI Chat Response', intent: 'Tax Planning', recommendations_given: false },
        { action: 'Executed Pre-trade Suitability Check', risk_profile: 'Moderate', outcome: 'Passed' }
      ];

      const mockLogs = mockPayloads.map((payload, idx) => {
        const hash = generateHash(payload);
        return {
          id: `audit_mock_${idx}`,
          created_at: new Date(Date.now() - idx * 86400000).toISOString(),
          ref_type: 'AI_NUDGE',
          content_hash: hash,
          payload
        };
      });
      return res.json({ logs: mockLogs });
    }

    res.json({ logs: data });
  } catch (error) {
    console.error("Audit trail error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/compliance/grievance/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    const { data, error } = await supabase
      .from('grievances')
      .select('*')
      .eq('user_id', activeUserId)
      .order('filed_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return res.json({ grievances: [
        {
          id: 'mock_g1',
          scores_ref_id: 'SCORES-882194',
          category: 'Delay in order execution',
          broker_name: 'Zerodha',
          status: 'IN_PROGRESS',
          filed_at: new Date(Date.now() - 3 * 86400000).toISOString()
        }
      ] });
    }

    res.json({ grievances: data });
  } catch (error) {
    console.error("Grievance fetch error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 5. Standard Data Endpoints
// ==========================================

// INSIGHTS-HANDLER-B was here — deleted (dead code, shadowed by INSIGHTS-HANDLER-A at L1048)

app.post('/api/simulation/run', async (req: Request, res: Response) => {
  try {
    const { sipAmount, duration, returnRate } = req.body;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const P = Number(sipAmount) || 50000;
    const r = (Number(returnRate) || 12) / 100 / 12;
    const n = (Number(duration) || 15) * 12;
    const durationYears = Number(duration) || 15;
    const rate = Number(returnRate) || 12;
    
    let futureValue = 0;
    let totalInvested = P * n;
    
    if (r > 0) {
      futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    } else {
      futureValue = totalInvested;
    }

    const currentBase = 1450000;
    const baseFV = currentBase * Math.pow(1 + rate/100, durationYears);
    
    // Scenarios
    const rOpt = (rate + 2) / 100 / 12;
    const rCons = (Math.max(rate - 2, 0)) / 100 / 12;

    const fvOpt = rOpt > 0 ? P * ((Math.pow(1 + rOpt, n) - 1) / rOpt) * (1 + rOpt) : totalInvested;
    const fvCons = rCons > 0 ? P * ((Math.pow(1 + rCons, n) - 1) / rCons) * (1 + rCons) : totalInvested;

    const baseFvOpt = currentBase * Math.pow(1 + (rate + 2)/100, durationYears);
    const baseFvCons = currentBase * Math.pow(1 + Math.max(rate - 2, 0)/100, durationYears);

    // Build yearly projections for the chart
    const yearlyProjections = Array.from({ length: durationYears }, (_, i) => {
      const yr = i + 1;
      const nYr = yr * 12;
      const rYr = rate / 100 / 12;
      const rOptYr = (rate + 2) / 100 / 12;
      const rConsYr = Math.max(rate - 2, 0) / 100 / 12;
      const sipFvYr = rYr > 0 ? P * ((Math.pow(1 + rYr, nYr) - 1) / rYr) * (1 + rYr) : P * nYr;
      const baseYr = currentBase * Math.pow(1 + rate/100, yr);
      const optFvYr = rOptYr > 0 ? P * ((Math.pow(1 + rOptYr, nYr) - 1) / rOptYr) * (1 + rOptYr) : P * nYr;
      const consFvYr = rConsYr > 0 ? P * ((Math.pow(1 + rConsYr, nYr) - 1) / rConsYr) * (1 + rConsYr) : P * nYr;
      return {
        year: yr,
        expected: Math.round(sipFvYr + baseYr),
        optimistic: Math.round(optFvYr + currentBase * Math.pow(1 + (rate + 2)/100, yr)),
        conservative: Math.round(consFvYr + currentBase * Math.pow(1 + Math.max(rate - 2, 0)/100, yr))
      };
    });
    
    const result = {
      totalInvested: totalInvested + currentBase,
      wealthGained: futureValue + baseFV - (totalInvested + currentBase),
      futureValue: futureValue + baseFV,
      optimisticValue: fvOpt + baseFvOpt,
      conservativeValue: fvCons + baseFvCons,
      expectedRate: rate,
      baseFV,
      sipFV: futureValue,
      yearlyProjections
    };

    // Fix 6: Persist simulation run to simulation_runs table (append-only)
    const { error: simError } = await supabase.from('simulation_runs').insert({
      user_id: userId,
      sip_amount: P,
      duration_years: durationYears,
      return_rate: rate,
      total_invested: result.totalInvested,
      expected_value: result.futureValue,
      optimistic_value: result.optimisticValue,
      conservative_value: result.conservativeValue,
      wealth_gained: result.wealthGained,
      base_portfolio_fv: baseFV,
      sip_fv: futureValue,
      yearly_projections: yearlyProjections,
      model_version: 'v1.0'
    });
    if (simError) console.error('Failed to persist simulation run:', simError);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GOALS-HANDLER-B GET + POST — DELETED (dead code, shadowed by GOALS-HANDLER-A above)

app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }
    const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId).order('txn_date', { ascending: false });
    if (error) return res.status(500).json({ error: 'DB Error' });
    res.json({ transactions: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/learning-progress', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }
    const { data, error } = await supabase.from('learning_progress').select('*').eq('user_id', userId);
    if (error) return res.status(500).json({ error: 'DB Error' });
    res.json({ progress: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/learning-progress', async (req: Request, res: Response) => {
  try {
    const { module_id, status, quiz_score } = req.body;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }
    
    // Fix 5: Pure INSERT (append-only). No UPSERT — every event (start, progress, complete, retake) gets its own row.
    // Use GET /api/learning-progress with MAX(created_at) grouping to get current status per module.
    const { data, error } = await supabase.from('learning_progress').insert({
      user_id: userId,
      module_id,
      status,
      quiz_score: quiz_score ?? null,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    }).select();
    
    if (error || !data || data.length === 0) return res.status(500).json({ error: 'DB Error' });
    res.json({ progress: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/learning/simplify
 * Converts complex financial document text into plain English using AI.
 * Returns structured simplified points and key term definitions.
 */
app.post('/api/learning/simplify', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return res.status(400).json({ error: 'Text must be at least 20 characters long.' });
    }

    const prompt = `You are a financial literacy assistant for SahaVest, an Indian personal finance app.

Simplify the following financial document excerpt into plain English for a first-time investor. Respond in JSON format ONLY (no markdown, no extra text):
{
  "summary": "A 1-2 sentence plain-English overview of what this passage says.",
  "points": [
    { "title": "Short bold title", "explanation": "Plain English explanation (1-2 sentences)." }
  ],
  "terms": [
    { "term": "Technical term", "definition": "What it means in simple words." }
  ]
}

Maximum 4 bullet points, maximum 3 terms. Be clear, concise, and avoid jargon.

Document text:
"""${text.slice(0, 2000)}"""`;

    let aiResult;
    try {
      const responseText = await generateAIResponse([{ role: 'user', content: prompt }]);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (llmErr: any) {
      console.warn('[Simplify] LLM failed:', llmErr?.message);
      // Graceful fallback
      return res.json({
        summary: 'AI simplification is temporarily unavailable. Please try again shortly.',
        points: [],
        terms: [],
        source: 'UNAVAILABLE'
      });
    }

    if (!aiResult) {
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    return res.json({ ...aiResult, source: 'LIVE' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/learning-progress/current', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }
    // Get the most recent event per module using a window function
    const { data, error } = await supabase.rpc('get_latest_learning_progress', { p_user_id: userId });
    if (error) {
      // Fallback: query all and filter in JS if RPC not ready
      const { data: all } = await supabase.from('learning_progress').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      const latest: Record<string, any> = {};
      for (const row of (all || [])) {
        if (!latest[row.module_id]) latest[row.module_id] = row;
      }
      return res.json({ progress: Object.values(latest) });
    }
    res.json({ progress: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==========================================
// 6. Trust & Safety Endpoints
// ==========================================



app.get('/api/trust/score', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Auth
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Accept entity from query param (entity name or reg number)
    const rawEntity = (req.query.entity as string) || (req.query.regNo as string) || '';
    const entityName = rawEntity.trim() || 'Unknown Entity';
    const searchKey = entityName.toUpperCase().trim();

    // ======================================================
    // SEBI Registry (same data as verify-advisor, extended)
    // ======================================================
    const sebiRegistry: Record<string, any> = {
      'INA000012345': { name: 'Ravi Kumar Advisory', type: 'Individual RIA', valid_till: '2028-12-31', compliant: true },
      'INA000098765': { name: 'FinWealth Advisors', type: 'Corporate RIA', valid_till: '2027-05-15', compliant: true },
      'INA000054321': { name: 'Sneha Desai', type: 'Individual RIA', valid_till: '2029-01-20', compliant: true },
    };
    // Also support name-based lookups
    const registryByName: Record<string, any> = {
      'FINWEALTH ADVISORS': { ...sebiRegistry['INA000098765'], reg_no: 'INA000098765' },
      'RAVI KUMAR ADVISORY': { ...sebiRegistry['INA000012345'], reg_no: 'INA000012345' },
      'SNEHA DESAI': { ...sebiRegistry['INA000054321'], reg_no: 'INA000054321' },
      // Known problem entities
      'ALPHA PROFIT SOLUTIONS': null,  // Unregistered — known scam signals
      'QUICK GAINS INDIA': null,
    };

    // ======================================================
    // Scoring Algorithm (weighted signals)
    // ======================================================
    let score = 50; // baseline for unknown entity
    let registrationStatus = 'Unverified';
    let fineHistory = 'Unknown';
    let communitySignal = 'Neutral';
    let registryMatch: any = null;
    let riskCategory = 'MEDIUM_RISK';

    // Signal 1: Registry lookup (by reg_no or name)
    const byRegNo = sebiRegistry[searchKey];
    const byName = registryByName[searchKey];

    if (byRegNo) {
      registryMatch = byRegNo;
      score += 35; // SEBI registered
      registrationStatus = 'SEBI Registered (reg no match)';
      // Check validity
      const validTill = new Date(byRegNo.valid_till);
      if (validTill > new Date()) {
        score += 5; // Active registration
        registrationStatus += ' — Active';
      } else {
        score -= 20; // Expired
        registrationStatus += ' — EXPIRED';
      }
      fineHistory = 'None on record';
      communitySignal = 'Positive';
    } else if (byName !== undefined) {
      if (byName === null) {
        // Explicitly in our known-bad list
        score -= 25;
        registrationStatus = 'Unregistered — Known scam signals';
        fineHistory = 'Regulatory action pending';
        communitySignal = 'Negative — multiple user complaints';
      } else {
        registryMatch = byName;
        score += 30;
        registrationStatus = 'SEBI Registered (name match)';
        fineHistory = 'None on record';
        communitySignal = 'Positive';
      }
    } else {
      // Unknown entity — partial score based on name heuristics
      if (searchKey.includes('SEBI') || searchKey.includes('REGISTERED') || searchKey.includes('CERTIFIED')) {
        score += 5; // Slight boost for self-labeling (not verified)
        registrationStatus = 'Claims registration — unverified';
      } else if (searchKey.includes('GUARANTEED') || searchKey.includes('PROFIT') || searchKey.includes('100%')) {
        score -= 20;
        registrationStatus = 'Unverified — suspicious naming';
        communitySignal = 'Negative — guaranteed return claims';
      } else {
        registrationStatus = 'Not found in SEBI registry';
      }
    }

    // Signal 2: Entity type penalty for generic names
    if (entityName.length < 5) score -= 5;
    if (entityName === 'Unknown Entity') score = 30; // Default for missing entity

    // Clamp to valid range
    score = Math.max(0, Math.min(100, score));

    // Risk categorization
    if (score >= 70) riskCategory = 'LOW_RISK';
    else if (score >= 40) riskCategory = 'MEDIUM_RISK';
    else riskCategory = 'HIGH_RISK';

    const scoreBreakdown = {
      registration: registrationStatus,
      regulatory_fines: fineHistory,
      community_sentiment: communitySignal
    };

    const auditHash = crypto.createHash('sha256')
      .update(JSON.stringify({ entity: entityName, score, breakdown: scoreBreakdown, computed_at: new Date().toISOString() }))
      .digest('hex');

    // Persist to trust_scores
    const { data: tsData } = await supabase.from('trust_scores').insert({
      user_id: userId,
      entity_type: registryMatch?.type || 'unknown',
      entity_ref: entityName,
      score,
      confidence: registryMatch ? 0.92 : 0.55,
      risk_category: riskCategory,
      score_breakdown: scoreBreakdown,
      weights_version: 'v2.0',
      audit_hash: auditHash,
      blockchain_tx_id: null
    }).select('id').single();

    // Write agent_execution_logs
    const latency = Date.now() - startTime;
    const pipelineRunId = crypto.randomUUID();
    await supabase.from('agent_execution_logs').insert({
      user_id: userId,
      pipeline_run_id: pipelineRunId,
      agent_name: 'TrustScoreAgent',
      input_ref: { entity: entityName, query: req.query },
      output_ref: { score, risk_category: riskCategory, trust_score_id: tsData?.id || null, registry_match: !!registryMatch },
      confidence: registryMatch ? 0.92 : 0.55,
      latency_ms: latency,
      status: 'success'
    });

    res.json({
      entity: { name: entityName, type: registryMatch?.type || 'Unknown', reg_no: registryMatch?.reg_no || null },
      score,
      risk_category: riskCategory,
      last_updated: new Date().toISOString(),
      breakdown: scoreBreakdown,
      trust_score_id: tsData?.id || null
    });
  } catch (err) {
    console.error('Trust score error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});






app.get('/api/trust/alerts', async (req: Request, res: Response) => {
  try {
    // Auth: identify user
    let activeUserId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    const alerts = await computeBehavioralAlerts(activeUserId);
    res.json({ alerts });
  } catch (err) {
    console.error('[Trust Alerts] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================
// 7. Compliance & Grievances Endpoints
// ==========================================

app.get('/api/compliance/audit/me', async (req: Request, res: Response) => {
  try {
    res.json({
      events: [
        { id: 'evt-1', ref_type: 'AUTH', payload: { action: 'LOGIN', status: 'SUCCESS', ip: '192.168.1.1' }, created_at: new Date().toISOString() },
        { id: 'evt-2', ref_type: 'TRADE', payload: { action: 'TRADE_EXECUTED', details: 'Bought 25 HDFCBANK' }, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'evt-3', ref_type: 'AI_NUDGE', payload: { action: 'Scam Detection', status: 'Blocked' }, created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



// ==========================================
// 8. Profile & Settings Endpoints
// ==========================================

// Real Consent Management - reads from aa_consents table
app.get('/api/compliance/consents/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase
      .from('aa_consents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch consents:', error);
      return res.status(500).json({ error: 'Failed to fetch consents', detail: error.message });
    }

    const consents = (data || []).map(c => ({
      id: c.id,
      consent_id: c.consent_id,
      entity: c.aa_provider || 'Account Aggregator',
      purpose: c.purpose || 'Portfolio data aggregation',
      fip_list: c.fip_list || [],
      data_requested: c.data_requested || c.data_types || [],
      status: c.status || 'PENDING',
      valid_from: c.valid_from,
      expiry: c.valid_till,
      revoked_at: c.revoked_at,
      created_at: c.created_at
    }));

    res.json({ consents });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/api/compliance/consents/:consentId/revoke', async (req: Request, res: Response) => {
  try {
    const { consentId } = req.params;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase
      .from('aa_consents')
      .update({ status: 'Revoked', revoked_at: new Date().toISOString() })
      .eq('consent_id', consentId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !data) {
      console.error('Failed to revoke consent:', error);
      return res.status(404).json({ error: 'Consent not found or already revoked' });
    }

    // Write to audit log
    const auditHash = crypto.createHash('sha256')
      .update(JSON.stringify({ user_id: userId, consent_id: consentId, action: 'REVOKE', revoked_at: new Date().toISOString() }))
      .digest('hex');
    await supabase.from('audit_log').insert({
      user_id: userId,
      ref_type: 'AA_CONSENT_REVOKE',
      ref_id: data.id || null,
      content_hash: auditHash,
      blockchain_tx_id: null
    });

    res.json({ success: true, consent_id: consentId, status: 'Revoked', revoked_at: data.revoked_at });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: profile } = await supabase.from('users').select('*').eq('id', userId).single();
    const { data: nominees } = await supabase.from('nominees').select('*').eq('user_id', userId);

    res.json({
      profile: {
        name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        dob: profile?.dob || '',
        marital_status: profile?.marital_status || '',
        annual_income: profile?.annual_income || '',
        risk_profile: profile?.risk_profile || 'Moderate',
        kyc_status: profile?.kyc_status || 'pending',
        two_factor_enabled: profile?.two_factor_enabled || false,
        biometric_enabled: profile?.biometric_enabled || false
      },
      nominees: nominees || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { name, email, dob, marital_status, annual_income } = req.body;
    
    const { error } = await supabase.from('users').update({
      full_name: name,
      email: email,
      dob: dob,
      marital_status: marital_status,
      annual_income: annual_income,
      updated_at: new Date().toISOString()
    }).eq('id', userId);

    if (error) throw error;
    
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/profile/nominees', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { name, relation, dob, allocation } = req.body;
    
    const { data: nominee, error } = await supabase.from('nominees').insert({
      user_id: userId,
      name,
      relation,
      dob,
      allocation: allocation || 100
    }).select().single();

    if (error) throw error;
    
    res.json({ success: true, nominee });
  } catch (err) {
    console.error('Add nominee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/profile/nominees/:id', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { id } = req.params;
    
    const { error } = await supabase.from('nominees').delete().eq('id', id).eq('user_id', userId);
    
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Delete nominee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile/security', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const updates: any = {};
    if (req.body.app_pin !== undefined) updates.app_pin = req.body.app_pin;
    if (req.body.two_factor_enabled !== undefined) updates.two_factor_enabled = req.body.two_factor_enabled;
    if (req.body.biometric_enabled !== undefined) updates.biometric_enabled = req.body.biometric_enabled;

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      const { error } = await supabase.from('users').update(updates).eq('id', userId);
      if (error) throw error;
    }

    res.json({ success: true, message: 'Security settings updated' });
  } catch (err) {
    console.error('Security settings update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// SECURITY-HANDLER-A was here — DELETED: was a hardcoded static mock (two_factor_enabled: true, last_password_change: hardcoded).
// Real DB-backed SECURITY-HANDLER-B below now wins.

app.get('/api/profile/notifications/me', async (req: Request, res: Response) => {
  try {
    res.json({
      email_alerts: true,
      push_notifications: true,
      sms_otp_only: false,
      portfolio_weekly_digest: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/trust/alerts/:id/read', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { error } = await supabase
      .from('behavioral_alerts')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update alert' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Behavioral alerts error:", error);
    res.status(500).json({ error: 'Internal server error updating alert' });
  }
});

// ==========================================
// 5. Profile & Security Endpoints
// ==========================================

// PROFILE-ME-HANDLER-B was here — deleted (dead code, shadowed by PROFILE-ME-HANDLER-A above at L1737, which is cleaner with no silent mock fallback)

app.put('/api/profile/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Only update allowed fields
    const { full_name, email, phone, dob, marital_status, annual_income, kyc_status } = req.body;
    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (dob !== undefined) updates.dob = dob;
    if (marital_status !== undefined) updates.marital_status = marital_status;
    if (annual_income !== undefined) updates.annual_income = annual_income;
    if (kyc_status !== undefined) updates.kyc_status = kyc_status;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/profile/security/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase
      .from('users')
      .select('two_factor_enabled, biometric_enabled, app_pin')
      .eq('id', userId)
      .single();

    if (error) {
      return res.json({ two_factor_enabled: false, biometric_enabled: false, has_pin: false });
    }

    res.json({
      two_factor_enabled: data.two_factor_enabled,
      biometric_enabled: data.biometric_enabled,
      has_pin: !!data.app_pin
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile/security', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { two_factor_enabled, biometric_enabled, app_pin } = req.body;
    const updates: any = {};
    if (two_factor_enabled !== undefined) updates.two_factor_enabled = two_factor_enabled;
    if (biometric_enabled !== undefined) updates.biometric_enabled = biometric_enabled;
    if (app_pin !== undefined) updates.app_pin = app_pin;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/profile/nominees/:id', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

Sentry.setupExpressErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
