import { supabase } from './src/lib/supabase';

async function testSupabase() {
  console.log("Testing Supabase connection...");
  console.log("URL:", process.env.SUPABASE_URL);
  
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error("Error querying users table:", error.message);
  } else {
    console.log("Success! Users found:", data?.length);
    console.log(data);
  }
}

testSupabase();
