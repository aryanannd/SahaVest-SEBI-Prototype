import YahooFinance from 'yahoo-finance2';
import { supabase } from './supabase';
import dotenv from 'dotenv';

dotenv.config();

// Instantiate per v3 API requirement
const yahooFinance = new YahooFinance();

// NSE/BSE symbol mapping: instrument name or symbol → Yahoo Finance ticker
const SYMBOL_MAP: Record<string, string> = {
  // NSE Blue chips
  'RELIANCE': 'RELIANCE.NS',
  'RELIANCE INDUSTRIES': 'RELIANCE.NS',
  'TCS': 'TCS.NS',
  'TATA CONSULTANCY SERVICES': 'TCS.NS',
  'INFY': 'INFY.NS',
  'INFOSYS': 'INFY.NS',
  'INFOSYS LTD': 'INFY.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'HDFC BANK': 'HDFCBANK.NS',
  'HDFC BANK LTD': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'ITC': 'ITC.NS',
  'ITC LTD': 'ITC.NS',
  'SBIN': 'SBIN.NS',
  'SBI': 'SBIN.NS',
  'STATE BANK OF INDIA': 'SBIN.NS',
  'KOTAKBANK': 'KOTAKBANK.NS',
  'LT': 'LT.NS',
  'AXISBANK': 'AXISBANK.NS',
  'BAJFINANCE': 'BAJFINANCE.NS',
  'WIPRO': 'WIPRO.NS',
  'WIPRO LTD.': 'WIPRO.NS',
  'TATAMOTORS': 'TATAMOTORS.NS',
  'TATA MOTORS': 'TATAMOTORS.NS',
  'TATACHEM': 'TATACHEM.NS',
  'MARUTI': 'MARUTI.NS',
  'SUNPHARMA': 'SUNPHARMA.NS',
  'HCLTECH': 'HCLTECH.NS',
  'TITAN': 'TITAN.NS',
  'ASIANPAINT': 'ASIANPAINT.NS',
  'NESTLEIND': 'NESTLEIND.NS',
  'ULTRACEMCO': 'ULTRACEMCO.NS',
  'POWERGRID': 'POWERGRID.NS',
  'NTPC': 'NTPC.NS',
  'ONGC': 'ONGC.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'BRITANNIA': 'BRITANNIA.NS',
};

export interface Candle {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuoteData {
  symbol: string;
  displaySymbol: string;
  price: number;
  dayChange: number;
  dayChangePercent: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  cached_at: string;
  source: 'LIVE_DELAYED' | 'CACHE_STALE' | 'UNAVAILABLE';
}

export interface CandleResponse {
  symbol: string;
  candles: Candle[];
  cached_at: string;
  source: 'LIVE_DELAYED' | 'CACHE_STALE' | 'NO_DATA';
  live_fetch_failed?: boolean;
  error_hint?: string;
}

/**
 * Normalise a raw symbol or company name to a Yahoo Finance ticker (e.g. RELIANCE → RELIANCE.NS).
 */
export function resolveYahooSymbol(raw: string): string {
  const upper = raw.trim().toUpperCase();
  if (SYMBOL_MAP[upper]) return SYMBOL_MAP[upper];
  // If already has exchange suffix, pass through
  if (upper.includes('.NS') || upper.includes('.BO')) return upper;
  // Default: try as NSE symbol
  return `${upper}.NS`;
}

// Cache TTL constants (milliseconds)
const CANDLE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const QUOTE_TTL_MS = 5 * 60 * 1000;   // 5 minutes

// ────────────────────────────────────────────────────────────
// CANDLES
// ────────────────────────────────────────────────────────────

async function getCachedCandles(yahooSymbol: string): Promise<{ candles: Candle[]; cached_at: string } | null> {
  const { data } = await supabase
    .from('market_cache')
    .select('payload, cached_at')
    .eq('cache_key', `candles:${yahooSymbol}`)
    .single();

  if (!data || !data.payload) return null;
  return { candles: data.payload as Candle[], cached_at: data.cached_at };
}

async function saveCandleCache(yahooSymbol: string, candles: Candle[]): Promise<string> {
  const cached_at = new Date().toISOString();
  await supabase
    .from('market_cache')
    .upsert(
      { cache_key: `candles:${yahooSymbol}`, payload: candles, cached_at },
      { onConflict: 'cache_key' }
    );
  return cached_at;
}

/**
 * Fetch OHLC candle data.
 * Primary: yahoo-finance2 chart() (NSE delayed ~15-20 min for intraday, EOD for daily)
 * Fallback: last cached entry with 'CACHE_STALE' label
 * Never returns a blank if cached data exists.
 */
export async function getCandles(
  symbol: string,
  interval: '1d' | '1wk' | '1mo' = '1d',
  range: '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' = '3mo',
  options?: { forceFailure?: boolean }
): Promise<CandleResponse> {
  const yahooSymbol = resolveYahooSymbol(symbol);

  // 1. Check cache freshness
  const cached = await getCachedCandles(yahooSymbol);
  const isCacheFresh = cached && (Date.now() - new Date(cached.cached_at).getTime() < CANDLE_TTL_MS);

  if (isCacheFresh && cached && !options?.forceFailure) {
    return {
      symbol: yahooSymbol,
      candles: cached.candles,
      cached_at: cached.cached_at,
      source: 'LIVE_DELAYED',
    };
  }

  // 2. Live fetch from Yahoo Finance using chart()
  try {
    if (options?.forceFailure) {
      throw new Error('Simulated upstream HTTP 429 / Rate Limit Exceeded on Yahoo Finance');
    }

    const period1 = getPeriod1(range);
    const period2 = new Date();

    const result = await yahooFinance.chart(yahooSymbol, {
      period1: period1.toISOString().split('T')[0], // YYYY-MM-DD string
      period2: period2.toISOString().split('T')[0],
      interval,
    });

    const quotes = result?.quotes;
    if (!quotes || quotes.length === 0) {
      throw new Error('Empty response from Yahoo Finance chart()');
    }

    const candles: Candle[] = quotes
      .filter((r: any) => r.open && r.high && r.low && r.close)
      .map((r: any) => ({
        time: Math.floor(new Date(r.date).getTime() / 1000),
        open: Math.round(r.open * 100) / 100,
        high: Math.round(r.high * 100) / 100,
        low: Math.round(r.low * 100) / 100,
        close: Math.round(r.close * 100) / 100,
        volume: r.volume || 0,
      }));

    const cached_at = await saveCandleCache(yahooSymbol, candles);

    return {
      symbol: yahooSymbol,
      candles,
      cached_at,
      source: 'LIVE_DELAYED',
    };
  } catch (err: any) {
    console.warn(`[MarketData] Yahoo Finance candle fetch failed for ${yahooSymbol}:`, err.message);

    // Fallback: return stale cache if available
    if (cached) {
      return {
        symbol: yahooSymbol,
        candles: cached.candles,
        cached_at: cached.cached_at,
        source: 'CACHE_STALE',
        live_fetch_failed: true,
        error_hint: 'Live price fetch temporarily unavailable. Showing last known data.',
      };
    }

    // No data at all
    return {
      symbol: yahooSymbol,
      candles: [],
      cached_at: new Date().toISOString(),
      source: 'NO_DATA',
      live_fetch_failed: true,
      error_hint: 'No price history available for this symbol yet.',
    };
  }
}

// ────────────────────────────────────────────────────────────
// QUOTE (current delayed price)
// ────────────────────────────────────────────────────────────

async function getCachedQuote(yahooSymbol: string): Promise<QuoteData | null> {
  const { data } = await supabase
    .from('market_cache')
    .select('payload, cached_at')
    .eq('cache_key', `quote:${yahooSymbol}`)
    .single();

  if (!data || !data.payload) return null;
  return data.payload as QuoteData;
}

/**
 * Fetch current (delayed) quote for a symbol.
 */
export async function getQuote(
  symbol: string,
  options?: { forceFailure?: boolean }
): Promise<QuoteData> {
  const yahooSymbol = resolveYahooSymbol(symbol);

  // 1. Check cache freshness
  const cached = await getCachedQuote(yahooSymbol);
  const isCacheFresh = cached && (Date.now() - new Date(cached.cached_at).getTime() < QUOTE_TTL_MS);

  if (isCacheFresh && cached && !options?.forceFailure) {
    return { ...cached, source: 'LIVE_DELAYED' };
  }

  // 2. Live fetch
  try {
    if (options?.forceFailure) {
      throw new Error('Simulated upstream HTTP 429 / Rate Limit Exceeded on Yahoo Finance Quote');
    }

    const quote = await yahooFinance.quote(yahooSymbol);
    if (!quote || !quote.regularMarketPrice) {
      throw new Error('No quote data returned');
    }

    const cached_at = new Date().toISOString();
    const quoteData: QuoteData = {
      symbol: yahooSymbol,
      displaySymbol: symbol.toUpperCase(),
      price: Math.round((quote.regularMarketPrice || 0) * 100) / 100,
      dayChange: Math.round((quote.regularMarketChange || 0) * 100) / 100,
      dayChangePercent: Math.round((quote.regularMarketChangePercent || 0) * 100) / 100,
      dayHigh: Math.round((quote.regularMarketDayHigh || 0) * 100) / 100,
      dayLow: Math.round((quote.regularMarketDayLow || 0) * 100) / 100,
      previousClose: Math.round((quote.regularMarketPreviousClose || 0) * 100) / 100,
      volume: quote.regularMarketVolume || 0,
      marketCap: quote.marketCap,
      cached_at,
      source: 'LIVE_DELAYED',
    };

    await supabase
      .from('market_cache')
      .upsert(
        { cache_key: `quote:${yahooSymbol}`, payload: quoteData, cached_at },
        { onConflict: 'cache_key' }
      );

    return quoteData;
  } catch (err: any) {
    console.warn(`[MarketData] Yahoo Finance quote fetch failed for ${yahooSymbol}:`, err.message);

    // Fallback: return stale cache
    if (cached) {
      return {
        ...cached,
        source: 'CACHE_STALE',
      };
    }

    // No data at all
    return {
      symbol: yahooSymbol,
      displaySymbol: symbol.toUpperCase(),
      price: 0,
      dayChange: 0,
      dayChangePercent: 0,
      dayHigh: 0,
      dayLow: 0,
      previousClose: 0,
      volume: 0,
      cached_at: new Date().toISOString(),
      source: 'UNAVAILABLE',
    };
  }
}

// ────────────────────────────────────────────────────────────
// Utility: compute period1 from range string
// ────────────────────────────────────────────────────────────
function getPeriod1(range: string): Date {
  const now = new Date();
  switch (range) {
    case '1mo': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3mo': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6mo': return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1y':  return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case '2y':  return new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
    case '5y':  return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    default:    return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }
}
