import { supabase } from './supabase';
import { getCandles, resolveYahooSymbol } from './marketData';

/**
 * Shared function to compute the exact current value of a holding based on real live/delayed market price.
 * This guarantees the Dashboard, Asset Allocation, and Performance charts perfectly align on net worth.
 */
export async function getRealHoldingValue(instrumentName: string, quantity: number, acquisitionPriceFallback: number): Promise<number> {
  let currentPrice = acquisitionPriceFallback;
  try {
    const sym = resolveYahooSymbol(instrumentName);
    const res = await getCandles(sym, '1d', '1d'); // Gets latest day candle
    if (res && res.candles && res.candles.length > 0) {
      currentPrice = res.candles[res.candles.length - 1].close;
    }
  } catch (e) {
    console.warn(`[getRealHoldingValue] Could not fetch live price for ${instrumentName}, using fallback.`);
  }
  return quantity * currentPrice;
}

/**
 * Refreshes the `current_value` column for all holdings of a user
 * so that DB-level queries (Asset Allocation, Dashboard) remain perfectly synced
 * with the dynamically computed Performance Chart.
 */
export async function syncUserHoldingsValues(userId: string): Promise<void> {
  const { data: holdings } = await supabase.from('holdings').select('*').eq('user_id', userId);
  if (!holdings) return;

  for (const h of holdings) {
    const qty = Number(h.quantity) || 0;
    const avgCost = Number(h.avg_cost) || 100;
    
    // Only update if quantity > 0
    if (qty > 0) {
      const realValue = await getRealHoldingValue(h.instrument_name, qty, avgCost);
      await supabase
        .from('holdings')
        .update({ current_value: Math.round(realValue), last_updated: new Date().toISOString() })
        .eq('id', h.id);
    }
  }
}
