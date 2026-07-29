import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { // @ts-expect-error type mismatch
      transport: ws }
  }
);

async function run() {
  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
    email: 'demo@sahavest.com',
    password: 'password123'
  });
  console.log("Login:", sessionError || sessionData.session?.access_token.slice(0, 15) + '...');
  if (sessionData.user) {
    console.log("User ID:", sessionData.user.id);
  }
}
run();
