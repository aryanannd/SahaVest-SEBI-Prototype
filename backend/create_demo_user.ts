import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import fs from 'fs';

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
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo@sahavest.com',
    password: 'password123',
    email_confirm: true
  });
  console.log("Create user:", error || data.user.id);
  
  if (data?.user?.id) {
    fs.writeFileSync('demo_user_id.txt', data.user.id);
  }
}
run();
