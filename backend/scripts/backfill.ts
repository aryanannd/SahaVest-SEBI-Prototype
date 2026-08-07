import { supabase } from '../src/lib/supabase';
import { resolveYahooSymbol } from '../src/lib/marketData';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

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
        let historicalPrice = 100;
        try {
          const sym = resolveYahooSymbol(h.instrument_name || h.symbol || '');
          if (sym) {
            const startDate = new Date(datePointer);
            startDate.setDate(startDate.getDate() - 5); // Look back up to 5 days in case of weekend/holiday
            const endDate = new Date(datePointer);
            endDate.setDate(endDate.getDate() + 1);
            
            const chartData = await yahooFinance.chart(sym, {
              period1: Math.floor(startDate.getTime() / 1000),
              period2: Math.floor(endDate.getTime() / 1000),
              interval: '1d'
            });

            if (chartData && chartData.quotes && chartData.quotes.length > 0) {
              const validQuotes = chartData.quotes.filter(q => q.close !== null);
              if (validQuotes.length > 0) {
                historicalPrice = validQuotes[validQuotes.length - 1].close;
              }
            }
          }
        } catch(e) {
          console.warn(`Could not fetch historical price for ${h.instrument_name} on ${datePointer.toISOString()}`);
        }
        
        if (targetCurrentValue > 0) {
          qty = targetCurrentValue / historicalPrice;
          avgCost = historicalPrice;
        } else {
          qty = 10;
          avgCost = historicalPrice;
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
