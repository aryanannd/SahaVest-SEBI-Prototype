import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { supabase } from './supabase';

const redisUrl = process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export const portfolioSyncQueue = new Queue('portfolioSync', { connection });

// Worker to process background jobs
export const portfolioSyncWorker = new Worker('portfolioSync', async (job) => {
  const { consent_id, user_id, fip_list } = job.data;
  console.log(`[Queue] Starting portfolio sync for consent ${consent_id}...`);
  
  // Simulate heavy processing (e.g., JWE decryption, API aggregation)
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Update consent status
  await supabase.from('aa_consents').update({ status: 'ACTIVE' }).eq('consent_id', consent_id);
  
  // Insert mocked data
  const institutions = fip_list || ['Mock Bank'];
  for (const inst of institutions) {
    await supabase.from('linked_accounts').insert({
      user_id,
      institution_name: inst,
      account_type: 'BANK',
      masked_account_number: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
      sync_status: 'SUCCESS',
      last_synced_at: new Date().toISOString()
    });
  }

  console.log(`[Queue] Finished portfolio sync for consent ${consent_id}`);
}, { connection });

portfolioSyncWorker.on('failed', (job, err) => {
  console.error(`[Queue] Job failed for consent ${job?.data?.consent_id}:`, err);
});
