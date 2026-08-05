import crypto from 'crypto';
import { supabase } from './supabase';

export interface KiteSessionResponse {
  user_id: string;
  user_name: string;
  user_shortname?: string;
  email?: string;
  user_type?: string;
  broker: string;
  access_token: string;
  public_token?: string;
  refresh_token?: string;
  login_time: string;
}

export interface KiteHoldingItem {
  tradingsymbol: string;
  exchange: string;
  isin: string;
  quantity: number;
  authorised_quantity?: number;
  product?: string;
  collateral_quantity?: number;
  collateral_type?: string;
  t1_quantity?: number;
  average_price: number;
  last_price: number;
  close_price?: number;
  pnl?: number;
  day_change?: number;
  day_change_percentage?: number;
}

export interface KiteMarginItem {
  enabled: boolean;
  net: number;
  available: {
    adhoc_margin?: number;
    cash?: number;
    opening_balance?: number;
    live_balance?: number;
    collateral?: number;
    intraday_payin?: number;
  };
  utilised: {
    debits?: number;
    exposure?: number;
    m2m_realised?: number;
    m2m_unrealised?: number;
    option_premium?: number;
    payout?: number;
    span?: number;
    holding_sales?: number;
    turnover?: number;
  };
}

export class KiteTokenExpiredError extends Error {
  constructor(message = 'Zerodha Kite access token has expired or is invalid') {
    super(message);
    this.name = 'KiteTokenExpiredError';
  }
}

/**
 * Derives a 32-byte encryption key for AES-256-GCM.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.TOKEN_ENCRYPTION_KEY;
  if (envKey && envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }
  if (envKey && envKey.length === 32) {
    return Buffer.from(envKey, 'utf8');
  }
  // Deterministic fallback derived from server secret
  const fallbackSeed = process.env.KITE_API_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sahavest_broker_sec_seed_2026';
  return crypto.createHash('sha256').update(fallbackSeed).digest();
}

/**
 * Encrypts sensitive OAuth access tokens at rest using AES-256-GCM.
 */
export function encryptToken(plainToken: string): string {
  if (!plainToken) throw new Error('Cannot encrypt empty token');
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // standard 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plainToken, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypts sensitive OAuth access tokens using AES-256-GCM with authentication tag validation.
 */
export function decryptToken(encryptedPayload: string): string {
  if (!encryptedPayload) throw new Error('Cannot decrypt empty payload');
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted token format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

/**
 * Generates the official Kite Connect v3 login URL.
 */
export function getKiteLoginUrl(redirectUrlOverride?: string): string {
  const apiKey = process.env.KITE_API_KEY;
  if (!apiKey || apiKey.includes('your_kite_api_key')) {
    throw new Error('KITE_API_KEY is not configured in environment');
  }
  
  const redirectUrl = redirectUrlOverride || process.env.KITE_REDIRECT_URL;
  let url = `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(apiKey)}`;
  if (redirectUrl) {
    url += `&redirect_params=${encodeURIComponent(`redirect_url=${redirectUrl}`)}`;
  }
  return url;
}

/**
 * Server-side exchange of request_token + api_secret for access_token.
 */
export async function exchangeKiteToken(requestToken: string): Promise<KiteSessionResponse> {
  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('KITE_API_KEY or KITE_API_SECRET is missing from environment');
  }

  // Kite Connect SHA-256 checksum: sha256(api_key + request_token + api_secret)
  const checksum = crypto
    .createHash('sha256')
    .update(`${apiKey}${requestToken}${apiSecret}`)
    .digest('hex');

  const params = new URLSearchParams();
  params.append('api_key', apiKey);
  params.append('request_token', requestToken);
  params.append('checksum', checksum);

  const response = await fetch('https://api.kite.trade/session/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Kite-Version': '3',
    },
    body: params.toString(),
  });

  const body: any = await response.json();

  if (!response.ok || body.status === 'error') {
    const errorMsg = body?.message || `Kite token exchange failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return body.data as KiteSessionResponse;
}

/**
 * Fetches equity and mutual fund holdings from Kite Connect REST API.
 */
export async function fetchKiteHoldings(accessToken: string): Promise<KiteHoldingItem[]> {
  const apiKey = process.env.KITE_API_KEY;
  if (!apiKey) throw new Error('KITE_API_KEY is missing');

  const response = await fetch('https://api.kite.trade/portfolio/holdings', {
    method: 'GET',
    headers: {
      'X-Kite-Version': '3',
      'Authorization': `token ${apiKey}:${accessToken}`,
    },
  });

  if (response.status === 403 || response.status === 401) {
    throw new KiteTokenExpiredError();
  }

  const body: any = await response.json();
  if (!response.ok || body.status === 'error') {
    throw new Error(body?.message || 'Failed to fetch Kite holdings');
  }

  return (body.data || []) as KiteHoldingItem[];
}

/**
 * Fetches user margins (cash balance and collateral) from Kite Connect REST API.
 */
export async function fetchKiteMargins(accessToken: string): Promise<Record<string, KiteMarginItem>> {
  const apiKey = process.env.KITE_API_KEY;
  if (!apiKey) throw new Error('KITE_API_KEY is missing');

  const response = await fetch('https://api.kite.trade/user/margins', {
    method: 'GET',
    headers: {
      'X-Kite-Version': '3',
      'Authorization': `token ${apiKey}:${accessToken}`,
    },
  });

  if (response.status === 403 || response.status === 401) {
    throw new KiteTokenExpiredError();
  }

  const body: any = await response.json();
  if (!response.ok || body.status === 'error') {
    return {};
  }

  return body.data || {};
}

/**
 * Stores/updates broker connection in the database with encrypted access token.
 */
export async function saveBrokerConnection(params: {
  userId: string;
  broker: 'zerodha' | 'upstox';
  brokerUserId?: string;
  accessToken: string;
  publicToken?: string;
}) {
  const { userId, broker, brokerUserId, accessToken, publicToken } = params;
  const encryptedToken = encryptToken(accessToken);

  // Daily token expiration for Zerodha: Next day 06:00 AM IST
  const now = new Date();
  const nextExpiry = new Date(now);
  nextExpiry.setUTCHours(0, 30, 0, 0); // 06:00 IST is 00:30 UTC
  if (nextExpiry.getTime() <= now.getTime()) {
    nextExpiry.setUTCDate(nextExpiry.getUTCDate() + 1);
  }

  const { data, error } = await supabase
    .from('broker_connections')
    .upsert(
      {
        user_id: userId,
        broker,
        broker_user_id: brokerUserId || null,
        access_token: encryptedToken,
        public_token: publicToken || null,
        token_expires_at: nextExpiry.toISOString(),
        connected_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
        status: 'ACTIVE',
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,broker',
      }
    )
    .select('id, user_id, broker, broker_user_id, status, connected_at, last_synced_at, token_expires_at')
    .single();

  if (error) {
    throw new Error(`Failed to save broker connection: ${error.message}`);
  }

  return data;
}

/**
 * Retrieves the stored decrypted access token for a user's broker connection.
 */
export async function getActiveBrokerToken(userId: string, broker: 'zerodha' | 'upstox'): Promise<string | null> {
  const { data, error } = await supabase
    .from('broker_connections')
    .select('access_token, status, token_expires_at')
    .eq('user_id', userId)
    .eq('broker', broker)
    .single();

  if (error || !data) {
    return null;
  }

  if (data.status !== 'ACTIVE') {
    return null;
  }

  try {
    return decryptToken(data.access_token);
  } catch (decErr) {
    console.error(`[KiteConnect] Token decryption failed for user ${userId}:`, decErr);
    return null;
  }
}

/**
 * Normalizes Kite holdings and cash balances into the unified SahaVest holdings and linked_accounts tables.
 */
export async function normalizeAndStoreKiteHoldings(params: {
  userId: string;
  brokerUserId?: string;
  holdings: KiteHoldingItem[];
  margins?: Record<string, KiteMarginItem>;
}): Promise<{ linkedAccountId: string; holdingsCount: number; totalPortfolioValue: number }> {
  const { userId, brokerUserId, holdings, margins } = params;

  // 1. Create or retrieve linked_accounts record for Zerodha Demat
  const maskedRef = brokerUserId ? `ZERODHA_${brokerUserId}` : 'ZERODHA_DEMAT';
  
  const { data: existingAccount } = await supabase
    .from('linked_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('provider_name', 'Zerodha Broking Ltd.')
    .single();

  let linkedAccountId = existingAccount?.id;

  if (!linkedAccountId) {
    const { data: newAccount, error: accErr } = await supabase
      .from('linked_accounts')
      .insert({
        user_id: userId,
        fip_type: 'DEMAT',
        provider_name: 'Zerodha Broking Ltd.',
        masked_account_ref: maskedRef,
        sync_status: 'SUCCESS',
        last_synced_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (accErr || !newAccount) {
      throw new Error(`Failed to create linked account for Zerodha: ${accErr?.message}`);
    }
    linkedAccountId = newAccount.id;
  } else {
    await supabase
      .from('linked_accounts')
      .update({
        sync_status: 'SUCCESS',
        last_synced_at: new Date().toISOString(),
        masked_account_ref: maskedRef,
      })
      .eq('id', linkedAccountId);
  }

  // 2. Remove existing Zerodha holdings for this linked account before refreshing
  await supabase
    .from('holdings')
    .delete()
    .eq('user_id', userId)
    .eq('data_source', 'ZERODHA_KITE');

  // 3. Transform and insert fresh holdings
  let totalPortfolioValue = 0;
  const holdingRecords: any[] = [];

  for (const item of holdings) {
    const qty = Number(item.quantity) || 0;
    if (qty <= 0) continue;

    const avgPrice = Number(item.average_price) || 0;
    const ltp = Number(item.last_price) || avgPrice;
    const currentValue = Math.round(qty * ltp * 100) / 100;
    totalPortfolioValue += currentValue;

    // Detect asset class (Mutual Fund vs Equity vs Gold/SGB vs ETF)
    let assetClass = 'EQUITY';
    const symbol = (item.tradingsymbol || '').toUpperCase();
    if (symbol.includes('GOLD') || symbol.includes('SGB') || symbol.endsWith('BEES')) {
      assetClass = symbol.includes('GOLD') || symbol.includes('SGB') ? 'COMMODITIES' : 'EQUITY';
    } else if (item.isin && item.isin.startsWith('INF')) {
      assetClass = 'MUTUAL_FUND';
    }

    holdingRecords.push({
      user_id: userId,
      linked_account_id: linkedAccountId,
      asset_class: assetClass,
      instrument_name: item.tradingsymbol,
      isin_or_scheme_code: item.isin || `KITE_${item.tradingsymbol}`,
      quantity: qty,
      avg_cost: avgPrice,
      current_value: currentValue,
      currency: 'INR',
      data_source: 'ZERODHA_KITE',
      last_updated: new Date().toISOString(),
      sector: 'Broking Equity',
    });
  }

  // 4. If margin available cash is present, add cash balance entry
  if (margins?.equity?.available?.cash && margins.equity.available.cash > 0) {
    const cashValue = Math.round(margins.equity.available.cash * 100) / 100;
    totalPortfolioValue += cashValue;
    holdingRecords.push({
      user_id: userId,
      linked_account_id: linkedAccountId,
      asset_class: 'CASH_EQUIVALENT',
      instrument_name: 'Zerodha Trading Balance',
      isin_or_scheme_code: 'ZERODHA_CASH_MARGIN',
      quantity: 1,
      avg_cost: cashValue,
      current_value: cashValue,
      currency: 'INR',
      data_source: 'ZERODHA_KITE',
      last_updated: new Date().toISOString(),
      sector: 'Cash & Equivalents',
    });
  }

  if (holdingRecords.length > 0) {
    const { error: insertErr } = await supabase.from('holdings').insert(holdingRecords);
    if (insertErr) {
      throw new Error(`Failed to persist Zerodha holdings: ${insertErr.message}`);
    }
  }

  // 5. Update broker_connections last_synced_at
  await supabase
    .from('broker_connections')
    .update({
      last_synced_at: new Date().toISOString(),
      status: 'ACTIVE',
    })
    .eq('user_id', userId)
    .eq('broker', 'zerodha');

  return {
    linkedAccountId,
    holdingsCount: holdingRecords.length,
    totalPortfolioValue,
  };
}

/**
 * Disconnects a user's broker account and cleans up records.
 */
export async function disconnectBrokerAccount(userId: string, broker: 'zerodha' | 'upstox') {
  const { error } = await supabase
    .from('broker_connections')
    .update({
      status: 'DISCONNECTED',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('broker', broker);

  if (error) {
    throw new Error(`Failed to disconnect broker: ${error.message}`);
  }

  return { success: true, message: `Successfully disconnected ${broker}` };
}
