import { supabase } from '../src/lib/supabase';

async function run() {
  const { data, error } = await supabase.from('holdings').select('*').limit(1);
  if (error) {
    console.error('Error fetching holdings:', error);
  } else {
    console.log('Columns in holdings:', data.length > 0 ? Object.keys(data[0]) : 'No rows');
  }
}
run();
