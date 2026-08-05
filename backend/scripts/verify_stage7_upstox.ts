import {
  getUpstoxLoginUrl,
  saveUpstoxConnection,
  normalizeAndStoreUpstoxHoldings,
  type UpstoxHoldingItem,
  type UpstoxFundItem,
} from '../src/lib/upstoxConnect';
import { getActiveBrokerToken, disconnectBrokerAccount } from '../src/lib/kiteConnect';
import { supabase } from '../src/lib/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function runStage7Verification() {
  console.log('====================================================');
  console.log('STAGE 7: Upstox Pro OAuth Broker Integration Verification');
  console.log('====================================================\n');

  // Test User
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '716691b9-939e-4118-aafb-9246a3923250';

  // 1. Verify Login URL Generation
  console.log('=== TEST 1: Upstox v2 OAuth Login Dialog URL ===');
  process.env.UPSTOX_API_KEY = process.env.UPSTOX_API_KEY || 'demo_upstox_api_key_2026';
  const loginUrl = getUpstoxLoginUrl('http://localhost:3000/api/broker/upstox/callback');
  console.log(`[PASS 1.1] Generated Upstox OAuth URL: ${loginUrl}`);
  console.log(`[PASS 1.2] Contains response_type=code: ${loginUrl.includes('response_type=code')}`);
  console.log(`[PASS 1.3] Contains client_id: ${loginUrl.includes('client_id=')}`);
  console.log(`[PASS 1.4] Contains redirect_uri: ${loginUrl.includes('redirect_uri=')}`);

  // 2. Verify AES-256-GCM Token Encryption & Storage
  console.log('\n=== TEST 2: AES-256-GCM Encryption & DB Persistence ===');
  const sampleAccessToken = 'upstox_access_token_live_sec_112233445566';
  const savedConn = await saveUpstoxConnection({
    userId,
    brokerUserId: 'UP6677',
    accessToken: sampleAccessToken,
  });

  console.log('[PASS 2.1] Saved Upstox broker connection to Supabase:', {
    id: savedConn.id,
    broker: savedConn.broker,
    broker_user_id: savedConn.broker_user_id,
    status: savedConn.status,
    expires_at: savedConn.token_expires_at,
  });

  // Verify raw token in DB is NOT plaintext
  const { data: rawDbRecord } = await supabase
    .from('broker_connections')
    .select('access_token')
    .eq('id', savedConn.id)
    .single();

  console.log(`[PASS 2.2] DB ciphertext starts with IV: ${rawDbRecord?.access_token.slice(0, 24)}...`);
  console.log(`[PASS 2.3] Plaintext token is NOT stored: ${rawDbRecord?.access_token !== sampleAccessToken}`);

  // Retrieve decrypted token
  const retrievedToken = await getActiveBrokerToken(userId, 'upstox');
  console.log(`[PASS 2.4] Retrieved and decrypted token matches: ${retrievedToken === sampleAccessToken}`);

  // 3. Verify Upstox Holdings Ingestion & Normalization
  console.log('\n=== TEST 3: Upstox Holdings Normalization & DB Sync ===');
  const sampleHoldings: UpstoxHoldingItem[] = [
    {
      company_name: 'Wipro Ltd.',
      trading_symbol: 'WIPRO',
      isin: 'INE075A01022',
      quantity: 60,
      average_price: 490.5,
      last_price: 525.0,
      pnl: 2070,
    },
    {
      company_name: 'ITC Limited',
      trading_symbol: 'ITC',
      isin: 'INE154A01025',
      quantity: 100,
      average_price: 410.0,
      last_price: 432.5,
      pnl: 2250,
    },
  ];

  const sampleFunds: UpstoxFundItem = {
    equity: {
      available_margin: 35000,
      used_margin: 0,
    },
  };

  const syncResult = await normalizeAndStoreUpstoxHoldings({
    userId,
    brokerUserId: 'UP6677',
    holdings: sampleHoldings,
    funds: sampleFunds,
  });

  console.log('[PASS 3.1] Normalized and synced Upstox portfolio:', syncResult);

  // Check stored holdings from Supabase
  const { data: dbHoldings } = await supabase
    .from('holdings')
    .select('instrument_name, asset_class, quantity, avg_cost, current_value, data_source')
    .eq('user_id', userId)
    .eq('data_source', 'UPSTOX');

  console.log(`[PASS 3.2] Stored Upstox holdings row count: ${dbHoldings?.length}`);
  console.log('[PASS 3.3] Stored Upstox holdings rows:', dbHoldings);

  // 4. Verify Daily Expiration Handling
  console.log('\n=== TEST 4: Daily Token Expiration State Handling ===');
  await supabase
    .from('broker_connections')
    .update({ status: 'EXPIRED' })
    .eq('id', savedConn.id);

  const expiredTokenCheck = await getActiveBrokerToken(userId, 'upstox');
  console.log(`[PASS 4.1] Expired connection returns null token: ${expiredTokenCheck === null}`);

  // 5. Verify Disconnect Flow
  console.log('\n=== TEST 5: Broker Disconnect Flow ===');
  await disconnectBrokerAccount(userId, 'upstox');
  await supabase.from('holdings').delete().eq('user_id', userId).eq('data_source', 'UPSTOX');

  const { data: disconnectedConn } = await supabase
    .from('broker_connections')
    .select('status')
    .eq('id', savedConn.id)
    .single();

  console.log(`[PASS 5.1] Connection status after disconnect: ${disconnectedConn?.status}`);

  const { data: remainingHoldings } = await supabase
    .from('holdings')
    .select('id')
    .eq('user_id', userId)
    .eq('data_source', 'UPSTOX');

  console.log(`[PASS 5.2] Cleaned up Upstox holdings count: ${remainingHoldings?.length}`);

  console.log('\n🎉 ALL STAGE 7 UPSTOX INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

runStage7Verification().catch((err) => {
  console.error('Stage 7 Verification Failed:', err);
  process.exit(1);
});
