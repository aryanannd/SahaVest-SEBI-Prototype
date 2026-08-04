import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as any } }
);

async function verify() {
  const { data, error } = await sb
    .from('trust_scores')
    .select('id, entity_ref, score, risk_category, confidence, weights_version, created_at')
    .in('id', ['b2aa096f-c0d0-47fc-95ca-ba2845d38769', '8ccf99e7-7932-4776-b091-df8a71bc61d2'])
    .order('created_at', { ascending: false });

  if (error) { console.error('Error:', error); process.exit(1); }
  console.log('\n=== trust_scores DB rows for Step 5 verification ===');
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

verify().catch(e => { console.error(e); process.exit(1); });
