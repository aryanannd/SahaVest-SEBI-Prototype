import dotenv from 'dotenv';
import { enqueuePortfolioSync } from '../src/lib/queue';

dotenv.config();

async function run() {
  const userId = '716691b9-939e-4118-aafb-9246a3923250';
  
  // Queue the mock portfolio sync
  console.log('Enqueuing mock portfolio sync...');
  await enqueuePortfolioSync({
    consent_id: 'MOCK_CONSENT_123',
    user_id: userId,
    fip_list: ['HDFC Bank', 'Zerodha', 'SBI Mutual Fund'],
    is_live: false
  });
  
  console.log('Done! Please wait a few seconds for the background queue to process.');
  process.exit(0);
}

run();
