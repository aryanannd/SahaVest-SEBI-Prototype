import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import ws from 'ws';
dotenv.config();

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as any } }
  );
  
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'set' : 'MISSING');
  console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set (length=' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'MISSING');
  
  const { data, error } = await supabase.from('simulation_runs').insert({
    user_id: '716691b9-939e-4118-aafb-9246a3923250',
    sip_amount: 30000,
    duration_years: 15,
    return_rate: 12,
    total_invested: 6000000,
    expected_value: 28000000,
    model_version: 'v1.0-test'
  }).select();
  
  console.log('DATA:', JSON.stringify(data, null, 2));
  console.log('ERROR:', JSON.stringify(error, null, 2));
  
  // Also test learning_progress insert
  const { data: lpData, error: lpError } = await supabase.from('learning_progress').insert({
    user_id: '716691b9-939e-4118-aafb-9246a3923250',
    module_id: 'test_module_001',
    status: 'started',
    quiz_score: null,
    completed_at: null
  }).select();
  
  console.log('LEARNING DATA:', JSON.stringify(lpData, null, 2));
  console.log('LEARNING ERROR:', JSON.stringify(lpError, null, 2));
}
main().catch(console.error);
