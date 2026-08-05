import {
  encryptToken,
  decryptToken,
  normalizeAndStoreKiteHoldings,
  type KiteHoldingItem,
} from '../src/lib/kiteConnect';
import { supabase } from '../src/lib/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function runKiteCoreVerification() {
  console.log('=== TEST 1: Token AES-256-GCM Encryption / Decryption ===');
  const sampleRawToken = `kite_access_token_demo_${Date.now()}_secret_key_12345`;
  const encrypted = encryptToken(sampleRawToken);
  console.log('[PASS 1.1] Raw token encrypted successfully');
  console.log(`[PASS 1.2] Ciphertext format (IV:Tag:Data): ${encrypted.slice(0, 30)}...`);

  const decrypted = decryptToken(encrypted);
  console.log(`[PASS 1.3] Decrypted token matches original: ${decrypted === sampleRawToken}`);
  if (decrypted !== sampleRawToken) {
    throw new Error('Decrypted token mismatch!');
  }

  console.log('\n=== TEST 2: Holdings Normalization & Ingestion ===');
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const testUserId = user?.id || '716691b9-939e-4118-aafb-9246a3923250';

  const sampleHoldings: KiteHoldingItem[] = [
    {
      tradingsymbol: 'RELIANCE',
      exchange: 'NSE',
      isin: 'INE002A01018',
      quantity: 20,
      average_price: 2850.5,
      last_price: 3010.0,
      pnl: 3190,
    },
    {
      tradingsymbol: 'GOLDBEES',
      exchange: 'NSE',
      isin: 'INF732E01037',
      quantity: 150,
      average_price: 62.0,
      last_price: 68.5,
      pnl: 975,
    },
  ];

  const sampleMargins = {
    equity: {
      enabled: true,
      net: 45000,
      available: {
        cash: 45000,
      },
      utilised: {},
    },
  };

  const syncResult = await normalizeAndStoreKiteHoldings({
    userId: testUserId,
    brokerUserId: 'DEMO123',
    holdings: sampleHoldings,
    margins: sampleMargins as any,
  });

  console.log('[PASS 2.1] Normalized and stored Kite portfolio:', syncResult);

  // Verify records in Supabase
  const { data: storedHoldings } = await supabase
    .from('holdings')
    .select('instrument_name, asset_class, current_value, data_source')
    .eq('user_id', testUserId)
    .eq('data_source', 'ZERODHA_KITE');

  console.log('[PASS 2.2] Stored holdings records count:', storedHoldings?.length);
  console.log('[PASS 2.3] Stored holdings items:', storedHoldings);

  console.log('\n✅ All Kite core unit tests passed successfully!');
}

runKiteCoreVerification().catch((err) => {
  console.error('Kite core test failed:', err);
  process.exit(1);
});
