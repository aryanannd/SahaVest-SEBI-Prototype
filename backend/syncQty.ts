import { supabase } from './src/lib/supabase.ts';

async function syncQuantities() { 
  const { data: holdings } = await supabase.from('holdings').select('id, instrument_name'); 
  const { data: txs } = await supabase.from('transactions').select('*, holdings(instrument_name)'); 

  for (const h of holdings) { 
    const hTxs = txs.filter(t => t.holdings?.instrument_name === h.instrument_name); 
    let qty = 0; 
    let amt = 0; 
    for (const tx of hTxs) { 
      const isBuy = tx.txn_type?.toLowerCase() === 'buy' || tx.txn_type?.toLowerCase() === 'cas_import'; 
      qty += isBuy ? Number(tx.units) : -Number(tx.units); 
      amt += isBuy ? Number(tx.amount) : -Number(tx.amount); 
    } 
    const avgCost = qty > 0 ? amt / qty : 0; 
    if (qty > 0) {
      await supabase.from('holdings').update({ quantity: qty, avg_cost: avgCost }).eq('id', h.id); 
    }
    console.log('Updated', h.instrument_name, 'qty:', qty, 'avg_cost:', avgCost); 
  } 
} 

syncQuantities().then(() => console.log('Done')).catch(console.error);
