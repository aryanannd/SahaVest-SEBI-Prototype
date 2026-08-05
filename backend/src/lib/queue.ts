import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { supabase } from './supabase';
import {
  createSetuDataSession,
  fetchSetuDataSession,
  processAndStoreFIData,
} from './setuAA';

let portfolioSyncQueue: Queue | null = null;
let portfolioSyncWorker: Worker | null = null;

function getQueue(): Queue | null {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (!redisUrl || redisUrl.includes('your-upstash-url') || redisUrl.includes('placeholder')) {
    return null;
  }

  if (!portfolioSyncQueue) {
    try {
      const connection = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        connectTimeout: 2000,
      });
      connection.on('error', (err) => {
        console.warn('[Redis] Connection notice:', err.message);
      });
      portfolioSyncQueue = new Queue('portfolioSync', { connection });

      portfolioSyncWorker = new Worker(
        'portfolioSync',
        async (job) => {
          await executePortfolioSync(job.data);
        },
        { connection }
      );

      portfolioSyncWorker.on('failed', (job, err) => {
        console.error(`[Queue] Job failed for consent ${job?.data?.consent_id}:`, err);
      });
    } catch (err: any) {
      console.warn('[Queue] Failed to initialize BullMQ with Redis:', err.message);
    }
  }
  return portfolioSyncQueue;
}

export async function executePortfolioSync(data: {
  consent_id: string;
  user_id: string;
  fip_list?: string[];
  is_live?: boolean;
}) {
  const { consent_id, user_id, fip_list, is_live } = data;
  console.log(`[Queue] Starting portfolio sync for consent ${consent_id} (is_live: ${!!is_live})...`);

  try {
    if (is_live) {
      // 1. Create FI data session on Setu
      const sessionId = await createSetuDataSession(consent_id);
      console.log(`[Queue] Created Setu FI session ${sessionId}, waiting for data readiness...`);

      // 2. Poll session readiness with backoff (up to 30 seconds)
      let sessionData: any = null;
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        try {
          sessionData = await fetchSetuDataSession(sessionId);
          if (
            sessionData &&
            (sessionData.status === 'COMPLETED' ||
              sessionData.status === 'PARTIAL' ||
              sessionData.Payload ||
              sessionData.data)
          ) {
            break;
          }
        } catch (pollErr: any) {
          console.log(`[Queue] Session poll attempt ${attempt + 1}: ${pollErr.message}`);
        }
      }

      if (!sessionData) {
        throw new Error(`Timed out waiting for Setu FI data session ${sessionId}`);
      }

      // 3. Process and persist into linked_accounts and holdings tables
      const { linkedAccountsCount, holdingsCount } = await processAndStoreFIData({
        user_id,
        consent_id,
        fi_data: sessionData,
      });

      // 4. Update consent status to ACTIVE
      await supabase.from('aa_consents').update({ status: 'ACTIVE' }).eq('consent_id', consent_id);

      console.log(
        `[Queue] Successfully synced Setu AA portfolio: ${linkedAccountsCount} accounts, ${holdingsCount} holdings.`
      );
    } else {
      // Fallback / Simulated processing
      await new Promise((resolve) => setTimeout(resolve, 800));

      await supabase.from('aa_consents').update({ status: 'ACTIVE' }).eq('consent_id', consent_id);

      // Get DB consent uuid
      const { data: consentRecord } = await supabase
        .from('aa_consents')
        .select('id')
        .eq('consent_id', consent_id)
        .single();

      const institutions = fip_list || ['HDFC Bank', 'Zerodha'];
      for (const inst of institutions) {
        const maskedRef = `XXXX${Math.floor(1000 + Math.random() * 9000)}`;
        const { data: acc } = await supabase
          .from('linked_accounts')
          .insert({
            user_id,
            consent_id: consentRecord?.id || null,
            fip_type: inst.toLowerCase().includes('bank') ? 'BANK' : 'DEMAT',
            provider_name: inst,
            masked_account_ref: maskedRef,
            sync_status: 'SUCCESS',
            last_synced_at: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (acc) {
          await supabase.from('holdings').insert({
            user_id,
            linked_account_id: acc.id,
            asset_class: inst.toLowerCase().includes('bank') ? 'CASH_EQUIVALENT' : 'EQUITY',
            instrument_name: `${inst} Primary Holdings`,
            isin_or_scheme_code: `MOCK_${maskedRef.slice(-4)}`,
            quantity: 10,
            avg_cost: 1500,
            current_value: 17500,
            currency: 'INR',
            data_source: 'SETU_MOCK',
            last_updated: new Date().toISOString(),
            sector: 'Diversified',
          });
        }
      }

      console.log(`[Queue] Finished simulated portfolio sync for consent ${consent_id}`);
    }
  } catch (err: any) {
    console.error(`[Queue] Portfolio sync failed for consent ${consent_id}:`, err);
    throw err;
  }
}

export async function enqueuePortfolioSync(data: {
  consent_id: string;
  user_id: string;
  fip_list?: string[];
  is_live?: boolean;
}) {
  const queue = getQueue();
  if (queue) {
    try {
      await Promise.race([
        queue.add('sync', data),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Queue connection timeout')), 1500)),
      ]);
      return;
    } catch (err: any) {
      console.warn('[Queue] Redis queue timed out, running in async background:', err.message);
    }
  }

  // Fallback direct asynchronous execution
  setImmediate(async () => {
    try {
      await executePortfolioSync(data);
    } catch (execErr: any) {
      console.error('[Queue Fallback] Direct sync execution failed:', execErr);
    }
  });
}
