import { supabase } from '../src/lib/supabase';

async function verify() {
  console.log('--- Priority 1 Verification ---');
  
  const p1Tables = ['aa_consent_events', 'sync_attempts', 'simulation_runs'];
  for (const table of p1Tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`Table: ${table} | Exists: ${error ? 'No (' + error.message + ')' : 'Yes (Row count check ok)'}`);
  }

  console.log('\n--- Fix 4: Transactions from CAS Upload ---');
  const { data: txs, error: txsErr } = await supabase.from('transactions')
    .select('id, user_id, txn_type, amount, source, created_at')
    .eq('source', 'CAS')
    .order('created_at', { ascending: false })
    .limit(3);
  console.log(JSON.stringify(txs, null, 2));

  console.log('\n--- Fix 5: Learning Progress Append-Only ---');
  const { data: lp, error: lpErr } = await supabase.from('learning_progress')
    .select('id, user_id, module_id, status, quiz_score, created_at')
    .eq('module_id', 'investing_101')
    .order('created_at', { ascending: true })
    .limit(5);
  console.log(JSON.stringify(lp, null, 2));

  console.log('\n--- Fix 6: Simulation Runs ---');
  const { data: sim, error: simErr } = await supabase.from('simulation_runs')
    .select('id, user_id, sip_amount, duration_years, return_rate, expected_value, created_at')
    .order('created_at', { ascending: false })
    .limit(1);
  console.log(JSON.stringify(sim, null, 2));
}

verify().catch(console.error);
