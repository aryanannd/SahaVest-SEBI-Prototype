import { supabase } from '../src/lib/supabase';
import { getCandles, resolveYahooSymbol } from '../src/lib/marketData';

async function run() {
  const userId = '716691b9-939e-4118-aafb-9246a3923250';
  
  await supabase.from('transactions').delete().eq('source', 'SYSTEM_BACKFILL');

  const { data: holdings } = await supabase.from('holdings').select('*').eq('user_id', userId);
  const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId);
  
  const txHoldingIds = new Set(transactions.map((t: any) => t.holding_id).filter(Boolean));
  
  const toInsert = [];
  let datePointer = new Date('2025-01-15T10:00:00Z');
  
  for (const h of holdings) {
    if (!txHoldingIds.has(h.id)) {
      let qty = Number(h.quantity);
      let avgCost = Number(h.avg_cost);
      let targetCurrentValue = Number(h.current_value) || 0;

      if (!qty || !avgCost) {
        let currentPrice = 100;
        try {
          const sym = resolveYahooSymbol(h.instrument_name || h.symbol || '');
          const res = await getCandles(sym, '1d', '1d');
          if (res && res.candles && res.candles.length > 0) {
            currentPrice = res.candles[res.candles.length - 1].close;
          }
        } catch(e) {}
        
        if (targetCurrentValue > 0) {
          qty = targetCurrentValue / currentPrice;
          avgCost = currentPrice * 0.9;
        } else {
          qty = 10;
          avgCost = currentPrice;
        }
      }

      toInsert.push({
        user_id: userId,
        holding_id: h.id,
        txn_type: 'buy',
        amount: avgCost * qty,
        units: qty,
        txn_date: datePointer.toISOString().split('T')[0],
        source: 'SYSTEM_BACKFILL'
      });
      datePointer.setDate(datePointer.getDate() + 14);
    }
  }
  
  console.log('Inserting ' + toInsert.length + ' backfill transactions...');
  const { error } = await supabase.from('transactions').insert(toInsert);
  if (error) console.error(error);
  else console.log('Backfill successful!');
}

run().catch(console.error);
