import { supabase } from '../src/lib/supabase';

async function run() {
  const { data, error } = await supabase
    .from('holdings')
    .select('instrument_name, quantity, current_value, isin_or_scheme_code, data_source, created_at')
    .eq('data_source', 'cas_upload');
    
  if (error) {
    console.error('Error fetching holdings:', error);
  } else {
    console.log('Inserted Holdings (cas_upload):', JSON.stringify(data, null, 2));
  }
}
run();
