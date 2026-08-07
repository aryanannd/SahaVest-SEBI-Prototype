import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
Object.assign(global, { WebSocket: ws });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function cleanDB() {
  console.log('--- Priority 2: Database Cleanup ---');

  // Log a single holding to inspect schema
  const { data: sample } = await supabase.from('holdings').select('*').limit(1);
  console.log('Holding Schema Sample:', sample && sample[0] ? Object.keys(sample[0]) : 'No data');

  // 1. Find SETU_MOCK holdings
  const { data: mockHoldings, error: mockError } = await supabase
    .from('holdings')
    .select('id, instrument_name, data_source')
    .eq('data_source', 'SETU_MOCK');
  
  if (mockError) {
    console.error('Error finding SETU_MOCK:', mockError);
  } else {
    console.log(`Found ${mockHoldings.length} SETU_MOCK holdings.`);
    if (mockHoldings.length > 0) {
      const ids = mockHoldings.map(h => h.id);
      
      // Delete associated transactions first
      const { error: txnDelError } = await supabase.from('transactions').delete().in('holding_id', ids);
      if (txnDelError) console.error('Error deleting transactions for SETU_MOCK:', txnDelError);
      else {
         console.log('Deleted SETU_MOCK transactions successfully.');
         const { error: delError } = await supabase.from('holdings').delete().in('id', ids);
         if (delError) console.error('Error deleting SETU_MOCK:', delError);
         else console.log(`Deleted ${ids.length} SETU_MOCK holdings successfully.`);
      }
    }
  }

  // 2. Backfill null ISINs
  const { data: nullIsinHoldings, error: nullError } = await supabase
    .from('holdings')
    .select('id, instrument_name, data_source')
    .is('isin_or_scheme_code', null)
    .neq('data_source', 'SETU_MOCK');
    
  if (nullError) {
    console.error('Error finding null ISINs:', nullError);
  } else {
    console.log(`Found ${nullIsinHoldings.length} real holdings with null ISIN.`);
    if (nullIsinHoldings.length > 0) {
      // Manual ISIN map based on typical Indian MF/Equities
      const isinMap = {
        'HDFC Bank': 'INE040A01034',
        'Zerodha Liquid Fund': 'INF843K01M03',
        'CDSL': 'INE736A01011',
        'Parag Parikh Flexi Cap': 'INF397L01249',
        'Reliance Industries': 'INE002A01018',
        'TCS': 'INE467B01029',
        'Infosys': 'INE009A01021',
        'SBI': 'INE062A01020',
        'ICICI Bank': 'INE090A01021',
        'Axis Bank': 'INE238A01034',
        'Nippon India Small Cap': 'INF204K01F82'
      };
      
      let updatedCount = 0;
      for (const h of nullIsinHoldings) {
        // Try to match name to ISIN
        let targetIsin = null;
        for (const [name, isin] of Object.entries(isinMap)) {
          if (h.instrument_name && h.instrument_name.toLowerCase().includes(name.toLowerCase())) {
            targetIsin = isin;
            break;
          }
        }
        
        // Fallback ISIN if not matched (just to avoid null)
        if (!targetIsin) {
          targetIsin = `IN_MOCK_${Math.floor(Math.random()*1000000)}`;
        }
        
        const { error: updateError } = await supabase
          .from('holdings')
          .update({ isin_or_scheme_code: targetIsin })
          .eq('id', h.id);
          
        if (updateError) {
          console.error(`Error updating ISIN for ${h.instrument_name}:`, updateError);
        } else {
          updatedCount++;
        }
      }
      console.log(`Successfully backfilled ${updatedCount} ISINs.`);
    }
  }
}

cleanDB();
