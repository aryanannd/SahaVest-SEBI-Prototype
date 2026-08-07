import { supabase } from './src/lib/supabase.ts';

async function dedup() { 
  const { data } = await supabase.from('holdings').select('id, instrument_name'); 
  const seen = new Set(); 
  for (const h of data) { 
    if (seen.has(h.instrument_name)) { 
      await supabase.from('holdings').delete().eq('id', h.id); 
      console.log('Deleted duplicate', h.instrument_name); 
    } else { 
      seen.add(h.instrument_name); 
    } 
  } 
} 

dedup().then(() => console.log('Done')).catch(console.error);
