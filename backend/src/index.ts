import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import { supabase } from './lib/supabase';
import { generateAIResponse, type Message } from './lib/llm';
import { createSetuConsent, getSetuConsentStatus } from './lib/setu';
import { portfolioSyncQueue } from './lib/queue';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parseCasPdf } from './lib/cas';
dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running correctly.' });
});

app.get('/api/debug-sentry', function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// ==========================================
// 1. Authentication Endpoints
// ==========================================

app.post('/api/auth/otp', async (req: Request, res: Response) => {
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

app.post('/api/auth/verify', async (req: Request, res: Response) => {
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
    const { fip_list, data_types, purpose, duration_days } = req.body;
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
        const setuRes = await createSetuConsent({ fip_list, data_types, purpose });
        consentId = setuRes.consentId;
        redirectUrl = setuRes.url;
      } catch (err: any) {
        console.error("Setu API error, falling back to mock:", err.message);
        return res.status(500).json({ error: 'Failed to create AA consent with provider' });
      }
    } else {
      consentId = `cst_${crypto.randomBytes(8).toString('hex')}`;
      redirectUrl = `https://sandbox.setu.co/consent/${consentId}`;
    }
    
    const { error } = await supabase.from('aa_consents').insert({
      user_id: user.id,
      aa_provider: isLive ? 'Setu_Live' : 'Setu_Mock',
      consent_id: consentId,
      status: 'PENDING',
      fip_list: fip_list || ['HDFC', 'Zerodha'],
      data_requested: data_types || ['holdings'],
      purpose: purpose || 'portfolio_consolidation'
    });

    if (error) {
      console.error("Failed to create consent:", error);
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ consent_id: consentId, aa_redirect_url: redirectUrl });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/aa/consent/:id/status', async (req: Request, res: Response) => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const { data, error } = await supabase.from('aa_consents').select('status, aa_provider').eq('consent_id', id).single();
    if (error || !data) return res.status(404).json({ error: 'Consent not found' });
    
    let status = data.status;
    const isLive = process.env.AA_LIVE === 'true' && data.aa_provider === 'Setu_Live';
    
    if (isLive) {
      try {
        status = await getSetuConsentStatus(id);
        // Sync status back to DB if it changed
        if (status !== data.status) {
          await supabase.from('aa_consents').update({ status }).eq('consent_id', id);
        }
      } catch (err: any) {
        console.error("Error fetching live status:", err.message);
      }
    }

    res.json({ status });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/aa/fetch', async (req: Request, res: Response) => {
  try {
    const { consent_id } = req.body;
    const { data, error } = await supabase.from('aa_consents').select().eq('consent_id', consent_id);
    
    if (error || !data || data.length === 0) return res.status(404).json({ error: 'Consent not found' });
    
    // Enqueue the background job instead of processing synchronously
    const user_id = data[0].user_id;
    const fip_list = data[0].fip_list;

    await portfolioSyncQueue.add('sync', {
      consent_id,
      user_id,
      fip_list
    });

    res.status(202).json({ success: true, message: 'Data fetch background job queued' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
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
app.get('/api/portfolio/performance/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    let activeUserId = userId === 'me' ? '716691b9-939e-4118-aafb-9246a3923250' : userId;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) activeUserId = user.id;
    }

    // Retrieve total holdings value
    const { data: holdings } = await supabase
      .from('holdings')
      .select('current_value')
      .eq('user_id', activeUserId);
      
    const currentTotal = holdings?.reduce((sum, h) => sum + (h.current_value || 0), 0) || 2456890.50;

    // Generate mock historical data points scaling up to currentTotal
    const history = [
      currentTotal * 0.8,
      currentTotal * 0.82,
      currentTotal * 0.78,
      currentTotal * 0.85,
      currentTotal * 0.90,
      currentTotal * 0.95,
      currentTotal
    ];

    res.status(200).json({
      currentNetWorth: currentTotal,
      todayChange: { value: 124000, percentage: 5.32 },
      history
    });
  } catch (error) {
    console.error("Performance history error:", error);
    res.status(500).json({ error: 'Internal server error fetching performance' });
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
    
    // In a real app we'd query the 'transactions' table to calculate velocity and 'holdings' to check drop.
    // For this prototype, we'll mock the SEBI-priority logic (Overtrading and Panic-Sell).
    const alerts = [];

    // Mock heuristic: If user has > 3 trades in last 24 hours in a volatile sector
    alerts.push({
      id: 'alert_1',
      type: 'overtrading',
      severity: 'high',
      title: 'High Trading Velocity Detected',
      message: 'You have executed 4 trades in the Options segment within the last 24 hours. High-frequency trading often leads to sub-optimal returns due to compounded fees and emotional bias.',
      timestamp: new Date().toISOString(),
      actionUrl: '/learning/overtrading-risks'
    });

    // Mock heuristic: If user is selling an asset that dropped > 10% recently
    alerts.push({
      id: 'alert_2',
      type: 'panic_sell',
      severity: 'medium',
      title: 'Potential Panic Sell',
      message: 'You are attempting to sell "Tech Growth Fund" which is down 12% this week. Historically, markets recover. Consider holding unless your fundamental thesis has changed.',
      timestamp: new Date().toISOString(),
      actionUrl: '/simulation/recovery'
    });

    res.json({
      alerts
    });

  } catch (error) {
    console.error("Behavioral alerts error:", error);
    res.status(500).json({ error: 'Internal server error calculating behavioral alerts' });
  }
});

// ==========================================
app.get('/api/portfolio/exposure/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    // Mock data for prototype
    res.json({
      totalValue: 1450000,
      flags: ["High concentration (45%) in IT Sector"],
      assetClassBreakdown: [
        { name: "Equity", value: 1000000 },
        { name: "Debt", value: 450000 }
      ],
      sectorBreakdown: [
        { name: "IT", value: 45 },
        { name: "Financials", value: 30 },
        { name: "Consumer", value: 25 }
      ]
    });
  } catch (err) {
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

app.get('/api/portfolio/performance/me', async (req: Request, res: Response) => {
  try {
    // Mock data for prototype
    res.json({
      returns1M: 2.4,
      returns3M: 5.1,
      returns1Y: 12.8,
      returnsAllTime: 45.2,
      xirr: 15.4,
      benchmarkComparison: {
        portfolio: 15.4,
        nifty50: 12.1
      },
      chartData: [
        { date: 'Jan', value: 1000000 },
        { date: 'Feb', value: 1050000 },
        { date: 'Mar', value: 1100000 },
        { date: 'Apr', value: 1080000 },
        { date: 'May', value: 1150000 },
        { date: 'Jun', value: 1200000 },
        { date: 'Jul', value: 1250000 },
        { date: 'Aug', value: 1300000 },
        { date: 'Sep', value: 1350000 },
        { date: 'Oct', value: 1400000 },
        { date: 'Nov', value: 1420000 },
        { date: 'Dec', value: 1450000 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
      // Return mock data if table query fails
      return res.json({
        goals: [
          { id: '1', name: 'Retirement Fund', target_amount: 5000000, current_amount: 1500000, target_date: '2040-01-01' },
          { id: '2', name: 'House Downpayment', target_amount: 2000000, current_amount: 800000, target_date: '2028-06-01' }
        ]
      });
    }

    res.json({ goals: goals || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/goals', async (req: Request, res: Response) => {
  try {
    const { name, target_amount, target_date } = req.body;
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
        name,
        target_amount,
        target_date,
        current_amount: 0
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
      console.warn('Failed to save grievance:', error);
    }

    // Fix 10: Write to audit_log for every grievance filing
    const auditHash = crypto.createHash('sha256')
      .update(JSON.stringify({ user_id: userId, category, scores_ref_id: mockScoresRef, filed_at: new Date().toISOString() }))
      .digest('hex');
    const { error: auditError } = await supabase.from('audit_log').insert({
      user_id: userId,
      ref_type: 'GRIEVANCE',
      ref_id: grievanceData?.id || null,
      content_hash: auditHash,
      blockchain_tx_id: null
    });
    if (auditError) console.error('Failed to write grievance audit log:', auditError);

    res.json({ id: grievanceData?.id || mockScoresRef, status: 'submitted', filed_at: new Date().toISOString(), refId: mockScoresRef });
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

app.post('/api/trust/scam-check', async (req: Request, res: Response) => {
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

    let userMessageContent: any = message;
    if (image) {
      userMessageContent = [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: image } }
      ];
    }

    const messages: Message[] = [
      { role: "system", content: "You are the SahaVest financial assistant. Explain concepts clearly. Do not give specific buy/sell advice. Keep answers under 3 paragraphs." },
      ...history,
      { role: "user", content: userMessageContent }
    ];

    let aiResponse;
    try {
      aiResponse = await generateAIResponse(messages);
    } catch (llmError) {
      console.error("LLM Error in chat:", llmError);
      return res.status(503).json({ error: true, message: "AI service temporarily unavailable" });
    }

    await supabase.from('agent_execution_logs').insert({
      user_id: userId,
      agent_role: 'Chat_Assistant',
      input_payload: { message },
      output_payload: { response: aiResponse },
      execution_time_ms: 1000,
      status: 'SUCCESS'
    });

    res.json({ response: aiResponse });
  } catch (err) {
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
    } catch (err) {
      console.error("LLM Error in explain:", err);
      return res.status(503).json({ error: true, message: "AI service temporarily unavailable" });
    }
    res.json({ explanation: aiResponse });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mock fallback data for SEBI Registry
const mockIntermediaries = [
  { reg_no: 'INA000012345', name: 'Ravi Kumar Advisory', type: 'Independent RIA', principal_officer: 'Ravi Kumar', address: '101, Dalal Street, Mumbai', valid_till: '2027-12-31' },
  { reg_no: 'INA000098765', name: 'FinWealth Advisors', type: 'Corporate RIA', principal_officer: 'Sneha Desai', address: '402, Trade Square, Lower Parel, Mumbai', valid_till: '2026-06-30' }
];

app.get('/api/trust/verify-advisor/:regNo', async (req: Request, res: Response) => {
  try {
    const { regNo } = req.params;
    const queryRegNo = typeof regNo === 'string' ? regNo.toUpperCase().trim() : '';
    const startTime = Date.now();

    // Auth
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase
      .from('intermediaries')
      .select('*')
      .eq('reg_no', queryRegNo)
      .single();

    let result: any;
    let found = false;
    if (error || !data) {
      const mockMatch = mockIntermediaries.find(i => i.reg_no === queryRegNo);
      if (mockMatch) {
        result = mockMatch;
        found = true;
      }
    } else {
      result = data;
      found = true;
    }

    // Fix 9: Log every advisor verification to agent_execution_logs
    const latency = Date.now() - startTime;
    const pipelineRunId = crypto.randomUUID();
    await supabase.from('agent_execution_logs').insert({
      user_id: userId,
      pipeline_run_id: pipelineRunId,
      agent_name: 'AdvisorVerificationAgent',
      input_ref: { reg_no: queryRegNo },
      output_ref: found ? { found: true, name: result.name, type: result.type } : { found: false },
      confidence: found ? 0.95 : 0.0,
      latency_ms: latency,
      status: found ? 'success' : 'not_found'
    });

    if (!found) {
      return res.status(404).json({ error: 'Advisor not found in registry' });
    }

    res.json(result);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

app.get('/api/insights/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }
    
    const { data: profile } = await supabase.from('users').select('risk_profile').eq('id', userId).single();
    
    const insights = [
      { id: 1, type: 'greeting', title: 'SahaVest Assistant', message: `Hello! Based on your ${profile?.risk_profile || 'Moderate'} risk profile, I've analyzed your portfolio.` },
      { id: 2, type: 'alert', title: 'Tax Saving Opportunity', message: 'You can save up to ₹46,800 in taxes under Section 80C by investing ₹1.5L in ELSS.' }
    ];
    
    res.json({ insights });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

app.get('/api/goals', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId);
    if (error) return res.status(500).json({ error: 'DB Error' });
    res.json({ goals: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/goals', async (req: Request, res: Response) => {
  try {
    const { name, target_amount, target_date, priority } = req.body;
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data, error } = await supabase.from('goals').insert({
      user_id: userId, name, target_amount, target_date, priority: priority || 1, current_amount: 0
    }).select();
    if (error) return res.status(500).json({ error: 'DB Error' });
    res.json({ goal: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Latest status per module (replaces the old single-row UPSERT query pattern)
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

    const entityName = 'AlphaTech Solutions Pvt Ltd';
    const score = 85;
    const riskCategory = score >= 70 ? 'LOW_RISK' : score >= 40 ? 'MEDIUM_RISK' : 'HIGH_RISK';
    const scoreBreakdown = {
      registration: 'Verified',
      regulatory_fines: 'None in last 5 years',
      community_sentiment: 'Positive'
    };
    const auditHash = crypto.createHash('sha256')
      .update(JSON.stringify({ entity: entityName, score, breakdown: scoreBreakdown, computed_at: new Date().toISOString() }))
      .digest('hex');

    // Fix 8: Persist trust score to trust_scores table (append-only)
    const { data: tsData } = await supabase.from('trust_scores').insert({
      user_id: userId,
      entity_type: 'broker',
      entity_ref: entityName,
      score,
      confidence: 0.88,
      risk_category: riskCategory,
      score_breakdown: scoreBreakdown,
      weights_version: 'v1.0',
      audit_hash: auditHash,
      blockchain_tx_id: null
    }).select('id').single();

    // Fix 8: Also write agent_execution_logs
    const latency = Date.now() - startTime;
    const pipelineRunId = crypto.randomUUID();
    await supabase.from('agent_execution_logs').insert({
      user_id: userId,
      pipeline_run_id: pipelineRunId,
      agent_name: 'TrustScoreAgent',
      input_ref: { entity: entityName, entity_type: 'broker' },
      output_ref: { score, risk_category: riskCategory, trust_score_id: tsData?.id || null },
      confidence: 0.88,
      latency_ms: latency,
      status: 'success'
    });

    res.json({
      entity: { name: entityName, type: 'Broker' },
      score,
      last_updated: new Date().toISOString(),
      breakdown: scoreBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});




app.get('/api/trust/alerts', async (req: Request, res: Response) => {
  try {
    res.json({
      alerts: [
        { id: 1, type: 'overtrading', message: 'You have executed 4 trades in the Options segment within the last 24 hours. High-frequency trading often leads to sub-optimal returns due to compounded fees and emotional bias.', severity: 'high', title: 'High Trading Velocity Detected', timestamp: new Date().toISOString() },
        { id: 2, type: 'panic_sell', message: 'You are attempting to sell "Tech Growth Fund" which is down 12% this week. Historically, markets recover. Consider holding unless your fundamental thesis has changed.', severity: 'medium', title: 'Potential Panic Sell', timestamp: new Date().toISOString() }
      ]
    });
  } catch (err) {
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

app.get('/api/profile/security/me', async (req: Request, res: Response) => {
  try {
    res.json({
      two_factor_enabled: true,
      last_password_change: '2023-09-15T00:00:00Z',
      active_sessions: 2
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

app.get('/api/profile/me', async (req: Request, res: Response) => {
  try {
    let userId = '716691b9-939e-4118-aafb-9246a3923250';
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('full_name, email, phone, dob, marital_status, annual_income, kyc_status')
      .eq('id', userId)
      .single();
      
    const { data: nominees } = await supabase
      .from('nominees')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      // Mock data fallback
      return res.json({
        profile: {
          full_name: 'Demo User',
          email: 'demo@sahavest.com',
          phone: '+91 9876543210',
          kyc_status: 'pending'
        },
        nominees: []
      });
    }

    res.json({ profile: profile || {}, nominees: nominees || [] });
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
