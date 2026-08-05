import { supabase } from '../src/lib/supabase';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { data } = await supabase
    .from('holdings')
    .select('instrument_name, isin_or_scheme_code, asset_class, data_source')
    .limit(15);
  console.log(JSON.stringify(data, null, 2));
}
main();
