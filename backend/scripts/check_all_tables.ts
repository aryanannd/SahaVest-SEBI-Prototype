import { supabase } from '../src/lib/supabase';

const tables = [
  'users',
  'kyc_records',
  'aa_consents',
  'linked_accounts',
  'holdings',
  'transactions',
  'goals',
  'trust_scores',
  'agent_execution_logs',
  'scam_checks',
  'audit_log',
  'grievances',
  'learning_progress',
  'data_privacy_requests',
  'nominees'
];

async function run() {
  const schema: any = {};
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      schema[table] = { status: 'Missing or Error', error: error.message };
    } else {
      schema[table] = { status: 'Exists', columns: data.length > 0 ? Object.keys(data[0]) : 'Empty table (columns unknown from data)' };
    }
  }
  console.log(JSON.stringify(schema, null, 2));
}
run();
