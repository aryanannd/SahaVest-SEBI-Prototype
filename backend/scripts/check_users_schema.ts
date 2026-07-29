import { supabase } from '../src/lib/supabase';

async function run() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Columns in users:', data.length > 0 ? Object.keys(data[0]) : 'No rows');
  }
}
run();
