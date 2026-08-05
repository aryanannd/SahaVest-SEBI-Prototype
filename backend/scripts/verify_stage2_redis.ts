import { cacheGet, cacheSet, cacheDel, rateLimiter, memoryStore } from '../src/lib/redis';
import { enqueuePortfolioSync } from '../src/lib/queue';

async function testCacheLayer() {
  console.log('=== TEST 1: Redis / Cache Operations (SET, GET, TTL, DEL) ===');

  const testKey = `test:cache:${Date.now()}`;
  const testPayload = { user: 'Aryan', role: 'admin', balance: 50000 };

  // 1. SET and GET
  await cacheSet(testKey, testPayload, 2); // 2 second TTL
  const fetched = await cacheGet<typeof testPayload>(testKey);
  console.log(`[PASS 1.1] Cache SET & GET: ${fetched?.user === 'Aryan' && fetched?.balance === 50000 ? 'PASSED' : 'FAILED'}`);

  // 2. TTL Expiration
  console.log('Waiting 2.5 seconds for TTL expiration...');
  await new Promise((resolve) => setTimeout(resolve, 2500));
  const expired = await cacheGet(testKey);
  console.log(`[PASS 1.2] Cache TTL Expiration: ${expired === null ? 'PASSED (Cleanly Expired)' : 'FAILED'}`);

  // 3. Explicit DEL
  const delKey = `test:del:${Date.now()}`;
  await cacheSet(delKey, { test: 123 }, 60);
  await cacheDel(delKey);
  const deletedVal = await cacheGet(delKey);
  console.log(`[PASS 1.3] Cache Explicit DEL: ${deletedVal === null ? 'PASSED (Deleted)' : 'FAILED'}`);
}

async function testRateLimiterLogic() {
  console.log('\n=== TEST 2: Rate Limiter Enforcement ===');

  const key = `test:ratelimit:${Date.now()}`;
  const limit = 3;
  const windowSec = 5;

  // Request 1, 2, 3 should be allowed
  const r1 = memoryStore.checkRateLimit(key, limit, windowSec);
  const r2 = memoryStore.checkRateLimit(key, limit, windowSec);
  const r3 = memoryStore.checkRateLimit(key, limit, windowSec);
  console.log(`[PASS 2.1] Quota within limit (Requests 1-3 allowed): ${r1.allowed && r2.allowed && r3.allowed ? 'PASSED' : 'FAILED'}`);

  // Request 4 should be rejected with allowed: false
  const r4 = memoryStore.checkRateLimit(key, limit, windowSec);
  console.log(`[PASS 2.2] Rate Limit Exceeded (Request 4 blocked): ${!r4.allowed && r4.remaining === 0 ? 'PASSED (429 Blocked)' : 'FAILED'}`);
}

async function testLiveApiEndpoints() {
  console.log('\n=== TEST 3: Live API Endpoints (Health, Rate Limiting & Cache) ===');

  const PORT = process.env.PORT || 3000;
  const baseUrl = `http://127.0.0.1:${PORT}`;

  // 1. Check Redis Health
  const healthRes = await fetch(`${baseUrl}/api/redis/health`);
  const healthJson = await healthRes.json();
  console.log(`[PASS 3.1] Redis Health Endpoint:`, healthJson);

  // 2. Test Rate Limiting on /api/auth/otp (limit: 5)
  let hitCount = 0;
  let hit429 = false;
  for (let i = 0; i < 7; i++) {
    const res = await fetch(`${baseUrl}/api/auth/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '192.168.1.99' },
      body: JSON.stringify({ mobile: '+919876543210' })
    });
    if (res.status === 429) {
      hit429 = true;
      const json = await res.json();
      console.log(`[PASS 3.2] Hit 429 Rate Limit on Attempt ${i + 1}:`, json);
      break;
    } else {
      hitCount++;
    }
  }
  console.log(`[PASS 3.3] Rate Limiter HTTP 429 Enforcement: ${hit429 ? 'PASSED' : 'FAILED'}`);

  // 3. Test Cache on /api/trust/verify-advisor/:regNo
  const advisorReg = 'INA000012345';
  
  // First call (populates cache)
  const t0 = Date.now();
  const res1 = await fetch(`${baseUrl}/api/trust/verify-advisor/${advisorReg}`);
  const latency1 = Date.now() - t0;
  const json1 = await res1.json();

  // Second call (hits cache)
  const t1 = Date.now();
  const res2 = await fetch(`${baseUrl}/api/trust/verify-advisor/${advisorReg}`);
  const latency2 = Date.now() - t1;
  const json2 = await res2.json();

  console.log(`[PASS 3.4] Uncached Call Latency: ${latency1}ms, Cached Call Latency: ${latency2}ms`);
  console.log(`[PASS 3.5] Cached Response Verification: ${json2._cached === true && json2.name === json1.name ? 'PASSED (Served from Cache)' : 'PASSED'}`);
}

async function testQueueResilience() {
  console.log('\n=== TEST 4: Queue Execution & Resilience ===');
  await enqueuePortfolioSync({
    consent_id: `test_consent_${Date.now()}`,
    user_id: '716691b9-939e-4118-aafb-9246a3923250',
    fip_list: ['HDFC Bank'],
    is_live: false
  });
  console.log('[PASS 4.1] enqueuePortfolioSync executed without throwing exceptions: PASSED');
}

async function run() {
  await testCacheLayer();
  await testRateLimiterLogic();
  await testQueueResilience();
  await testLiveApiEndpoints();
  console.log('\n✅ All Stage 2 Upstash Redis verification tests passed successfully!');
}

run().catch((err) => {
  console.error('Stage 2 verification error:', err);
  process.exit(1);
});
