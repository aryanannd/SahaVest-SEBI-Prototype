import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { enqueuePortfolioSync } from '../src/lib/queue';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const userId = '716691b9-939e-4118-aafb-9246a3923250';
  
  // 1. Delete existing holdings and accounts for the mock user
  console.log('Deleting existing mock holdings...');
  await supabase.from('holdings').delete().eq('user_id', userId);
  await supabase.from('linked_accounts').delete().eq('user_id', userId);
  
  // 2. Queue the mock portfolio sync
  console.log('Enqueuing mock portfolio sync...');
  await enqueuePortfolioSync({
    consent_id: 'MOCK_CONSENT_123',
    user_id: userId,
    fip_list: ['HDFC Bank', 'Zerodha', 'SBI Mutual Fund'],
    is_live: false
  });
  
  console.log('Done! Please wait a few seconds for the background queue to process.');
}

run();
