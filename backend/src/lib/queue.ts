import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { supabase } from './supabase';
import {
  createSetuDataSession,
  fetchSetuDataSession,
  processAndStoreFIData,
} from './setuAA';

let portfolioSyncQueue: Queue | null = null;
let portfolioSyncWorker: Worker | null = null;
let queueConnection: Redis | null = null;
let workerConnection: Redis | null = null;

function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (!url || url.includes('your-upstash-url') || url.includes('placeholder')) {
    return null;
  }
  return url;
}

function createRedisConnection(name: string): Redis {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    throw new Error('REDIS_URL is not configured in environment');
  }

  const isTls = redisUrl.startsWith('rediss://');
  const conn = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Mandatory for BullMQ
    enableReadyCheck: false,
    tls: isTls ? {} : undefined,
    connectTimeout: 5000,
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    },
  });

  conn.on('connect', () => {
    console.log(`[Upstash Redis Queue (${name})] Connection established`);
  });

  conn.on('ready', () => {
    console.log(`[Upstash Redis Queue (${name})] Ready to accept commands`);
  });

  conn.on('error', (err) => {
    console.warn(`[Upstash Redis Queue (${name})] Connection notice: ${err.message}`);
  });

  return conn;
}

export function getQueue(): Queue | null {
  const redisUrl = getRedisUrl();
  if (!redisUrl) return null;

  if (!portfolioSyncQueue) {
    try {
      queueConnection = createRedisConnection('queue');
      portfolioSyncQueue = new Queue('portfolioSync', {
        connection: queueConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      });

      // Initialize Worker with its dedicated connection instance
      if (!portfolioSyncWorker) {
        workerConnection = createRedisConnection('worker');
        portfolioSyncWorker = new Worker(
          'portfolioSync',
          async (job: Job) => {
            console.log(`[Queue Worker] Starting job ${job.id} for consent ${job.data.consent_id}...`);
            await executePortfolioSync(job.data);
            return { consent_id: job.data.consent_id, status: 'PROCESSED' };
          },
          {
            connection: workerConnection,
            concurrency: 5,
          }
        );

        portfolioSyncWorker.on('completed', (job) => {
          console.log(`[Queue Worker] Job ${job.id} for consent ${job.data.consent_id} completed successfully`);
        });

        portfolioSyncWorker.on('failed', (job, err) => {
          console.error(
            `[Queue Worker] Job ${job?.id} for consent ${job?.data?.consent_id} failed on attempt ${job?.attemptsMade}: ${err.message}`
          );
        });

        portfolioSyncWorker.on('error', (err) => {
          console.warn(`[Queue Worker] Worker error notice: ${err.message}`);
        });
      }
    } catch (err: any) {
      console.warn('[Queue] Failed to initialize BullMQ with Upstash Redis:', err.message);
    }
  }

  return portfolioSyncQueue;
}

export function getWorker(): Worker | null {
  getQueue(); // ensures initialization
  return portfolioSyncWorker;
}

export async function executePortfolioSync(data: {
  consent_id: string;
  user_id: string;
  fip_list?: string[];
  is_live?: boolean;
  force_error?: boolean;
}) {
  const { consent_id, user_id, fip_list, is_live, force_error } = data;
  console.log(`[Queue] Starting portfolio sync for consent ${consent_id} (is_live: ${!!is_live})...`);

  if (force_error) {
    throw new Error(`Synthetic job failure forced for consent ${consent_id}`);
  }

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
  force_error?: boolean;
}): Promise<{ queued: boolean; jobId?: string; mode: string }> {
  const queue = getQueue();
  if (queue) {
    try {
      const job = await Promise.race<Job>([
        queue.add('portfolio-sync', data, {
          jobId: `sync-${data.consent_id}`,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Queue connection timeout')), 2500)) as any,
      ]);
      console.log(`[Queue] Enqueued job ${job.id} in BullMQ`);
      return { queued: true, jobId: job.id, mode: 'UPSTASH_BULLMQ' };
    } catch (err: any) {
      console.warn('[Queue] Redis queue timed out or failed, falling back to background worker:', err.message);
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

  return { queued: false, mode: 'IN_MEMORY_ASYNC_FALLBACK' };
}

export async function getQueueHealth(): Promise<{
  status: string;
  redis_url_configured: boolean;
  active_jobs?: number;
  waiting_jobs?: number;
  completed_jobs?: number;
  failed_jobs?: number;
}> {
  const redisUrl = getRedisUrl();
  if (!redisUrl) {
    return {
      status: 'FALLBACK_MODE',
      redis_url_configured: false,
    };
  }

  const queue = getQueue();
  if (!queue) {
    return {
      status: 'UNAVAILABLE',
      redis_url_configured: true,
    };
  }

  try {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);

    return {
      status: 'HEALTHY',
      redis_url_configured: true,
      waiting_jobs: waiting,
      active_jobs: active,
      completed_jobs: completed,
      failed_jobs: failed,
    };
  } catch (err: any) {
    return {
      status: 'ERROR',
      redis_url_configured: true,
    };
  }
}

export async function closeQueueConnections(): Promise<void> {
  if (portfolioSyncWorker) {
    await portfolioSyncWorker.close();
    portfolioSyncWorker = null;
  }
  if (portfolioSyncQueue) {
    await portfolioSyncQueue.close();
    portfolioSyncQueue = null;
  }
  if (workerConnection) {
    workerConnection.disconnect();
    workerConnection = null;
  }
  if (queueConnection) {
    queueConnection.disconnect();
    queueConnection = null;
  }
}
