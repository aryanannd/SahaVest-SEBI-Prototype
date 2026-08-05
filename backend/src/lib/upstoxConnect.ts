import crypto from 'crypto';
import { supabase } from './supabase';
import { encryptToken, decryptToken } from './kiteConnect';

export interface UpstoxTokenResponse {
  access_token: string;
  user_id?: string;
  user_name?: string;
  email?: string;
  broker?: string;
  is_active?: boolean;
  expires_in?: number;
}

export interface UpstoxHoldingItem {
  isin: string;
  company_name: string;
  trading_symbol: string;
  quantity: number;
  average_price: number;
  last_price: number;
  close_price?: number;
  pnl?: number;
  day_change?: number;
  day_change_percentage?: number;
  collateral_type?: string;
  collateral_quantity?: number;
}

export interface UpstoxFundItem {
  equity?: {
    used_margin?: number;
    payin_amount?: number;
    span_margin?: number;
    adhoc_margin?: number;
    notional_cash?: number;
    available_margin?: number;
    exposure_margin?: number;
  };
  commodity?: {
    used_margin?: number;
    payin_amount?: number;
    available_margin?: number;
  };
}

export class UpstoxTokenExpiredError extends Error {
  constructor(message = 'Upstox access token has expired or is invalid') {
    super(message);
    this.name = 'UpstoxTokenExpiredError';
  }
}

/**
 * Generates official Upstox v2 OAuth Authorization Login URL.
 */
export function getUpstoxLoginUrl(redirectUrlOverride?: string): string {
  const apiKey = process.env.UPSTOX_API_KEY;
  if (!apiKey || apiKey.includes('your_upstox_api_key')) {
    throw new Error('UPSTOX_API_KEY is not configured in environment');
  }

  const redirectUrl = redirectUrlOverride || process.env.UPSTOX_REDIRECT_URL || 'http://localhost:3000/api/broker/upstox/callback';
  return `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${encodeURIComponent(
    apiKey
  )}&redirect_uri=${encodeURIComponent(redirectUrl)}`;
}

/**
 * Server-side exchange of OAuth code + client_secret for access_token.
 */
export async function exchangeUpstoxCode(code: string, redirectUrlOverride?: string): Promise<UpstoxTokenResponse> {
  const apiKey = process.env.UPSTOX_API_KEY;
  const apiSecret = process.env.UPSTOX_API_SECRET;
  const redirectUrl = redirectUrlOverride || process.env.UPSTOX_REDIRECT_URL || 'http://localhost:3000/api/broker/upstox/callback';

  if (!apiKey || !apiSecret) {
    throw new Error('UPSTOX_API_KEY or UPSTOX_API_SECRET is missing from environment');
  }

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('client_id', apiKey);
  params.append('client_secret', apiSecret);
  params.append('redirect_uri', redirectUrl);
  params.append('grant_type', 'authorization_code');

  const response = await fetch('https://api.upstox.com/v2/login/authorization/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: params.toString(),
  });

  const body: any = await response.json();

  if (!response.ok || body.status === 'error') {
    const errorMsg = body?.errors?.[0]?.message || body?.message || `Upstox token exchange failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    access_token: body.access_token,
    user_id: body.user_id,
    user_name: body.user_name,
    email: body.email,
    broker: 'UPSTOX',
    is_active: body.is_active,
  };
}

/**
 * Fetches holdings from Upstox v2 Portfolio API.
 */
export async function fetchUpstoxHoldings(accessToken: string): Promise<UpstoxHoldingItem[]> {
  const response = await fetch('https://api.upstox.com/v2/portfolio/long-term-holdings', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new UpstoxTokenExpiredError();
  }

  const body: any = await response.json();
  if (!response.ok || body.status === 'error') {
    throw new Error(body?.errors?.[0]?.message || body?.message || 'Failed to fetch Upstox holdings');
  }

  return (body.data || []) as UpstoxHoldingItem[];
}

/**
 * Fetches user funds & available margin from Upstox v2 API.
 */
export async function fetchUpstoxFunds(accessToken: string): Promise<UpstoxFundItem> {
  const response = await fetch('https://api.upstox.com/v2/user/get-funds-and-margin', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    throw new UpstoxTokenExpiredError();
  }

  const body: any = await response.json();
  if (!response.ok || body.status === 'error') {
    return {};
  }

  return (body.data || {}) as UpstoxFundItem;
}

/**
 * Stores/updates Upstox broker connection with encrypted access token.
 */
export async function saveUpstoxConnection(params: {
  userId: string;
  brokerUserId?: string;
  accessToken: string;
}) {
  const { userId, brokerUserId, accessToken } = params;
  const encryptedToken = encryptToken(accessToken);

  // Upstox tokens expire next morning 03:30 AM IST (22:00 UTC)
  const now = new Date();
  const nextExpiry = new Date(now);
  nextExpiry.setUTCHours(22, 0, 0, 0);
  if (nextExpiry.getTime() <= now.getTime()) {
    nextExpiry.setUTCDate(nextExpiry.getUTCDate() + 1);
  }

  const { data, error } = await supabase
    .from('broker_connections')
    .upsert(
      {
        user_id: userId,
        broker: 'upstox',
        broker_user_id: brokerUserId || null,
        access_token: encryptedToken,
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
    throw new Error(`Failed to save Upstox broker connection: ${error.message}`);
  }

  return data;
}

/**
 * Normalizes Upstox holdings and funds into unified holdings & linked_accounts tables.
 */
export async function normalizeAndStoreUpstoxHoldings(params: {
  userId: string;
  brokerUserId?: string;
  holdings: UpstoxHoldingItem[];
  funds?: UpstoxFundItem;
}): Promise<{ linkedAccountId: string; holdingsCount: number; totalPortfolioValue: number }> {
  const { userId, brokerUserId, holdings, funds } = params;

  // 1. Create or retrieve linked_accounts record for Upstox Demat
  const maskedRef = brokerUserId ? `UPSTOX_${brokerUserId}` : 'UPSTOX_DEMAT';

  const { data: existingAccount } = await supabase
    .from('linked_accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('provider_name', 'Upstox Securities')
    .single();

  let linkedAccountId = existingAccount?.id;

  if (!linkedAccountId) {
    const { data: newAccount, error: accErr } = await supabase
      .from('linked_accounts')
      .insert({
        user_id: userId,
        fip_type: 'DEMAT',
        provider_name: 'Upstox Securities',
        masked_account_ref: maskedRef,
        sync_status: 'SUCCESS',
        last_synced_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (accErr || !newAccount) {
      throw new Error(`Failed to create linked account for Upstox: ${accErr?.message}`);
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

  // 2. Clear old Upstox holdings
  await supabase
    .from('holdings')
    .delete()
    .eq('user_id', userId)
    .eq('data_source', 'UPSTOX');

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

    // Detect asset class
    let assetClass = 'EQUITY';
    const symbol = (item.trading_symbol || '').toUpperCase();
    if (symbol.includes('GOLD') || symbol.includes('SGB') || symbol.endsWith('BEES')) {
      assetClass = symbol.includes('GOLD') || symbol.includes('SGB') ? 'COMMODITIES' : 'EQUITY';
    } else if (item.isin && item.isin.startsWith('INF')) {
      assetClass = 'MUTUAL_FUND';
    }

    holdingRecords.push({
      user_id: userId,
      linked_account_id: linkedAccountId,
      asset_class: assetClass,
      instrument_name: item.company_name || item.trading_symbol,
      isin_or_scheme_code: item.isin || `UPSTOX_${item.trading_symbol}`,
      quantity: qty,
      avg_cost: avgPrice,
      current_value: currentValue,
      currency: 'INR',
      data_source: 'UPSTOX',
      last_updated: new Date().toISOString(),
      sector: 'Broking Equity',
    });
  }

  // 4. Ingest Available Margin / Cash balance if present
  const availableCash = funds?.equity?.available_margin || 0;
  if (availableCash > 0) {
    const cashValue = Math.round(availableCash * 100) / 100;
    totalPortfolioValue += cashValue;
    holdingRecords.push({
      user_id: userId,
      linked_account_id: linkedAccountId,
      asset_class: 'CASH_EQUIVALENT',
      instrument_name: 'Upstox Trading Margin',
      isin_or_scheme_code: 'UPSTOX_CASH_MARGIN',
      quantity: 1,
      avg_cost: cashValue,
      current_value: cashValue,
      currency: 'INR',
      data_source: 'UPSTOX',
      last_updated: new Date().toISOString(),
      sector: 'Cash & Equivalents',
    });
  }

  if (holdingRecords.length > 0) {
    const { error: insertErr } = await supabase.from('holdings').insert(holdingRecords);
    if (insertErr) {
      throw new Error(`Failed to persist Upstox holdings: ${insertErr.message}`);
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
    .eq('broker', 'upstox');

  return {
    linkedAccountId,
    holdingsCount: holdingRecords.length,
    totalPortfolioValue,
  };
}
