// Seed a test consent record for the demo user
// Run: npx tsx scripts/seed_consent.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws as any }
  }
);

const DEMO_USER_ID = '716691b9-939e-4118-aafb-9246a3923250';

async function seedConsent() {
  console.log('Clearing existing consent records for demo user...');
  await supabase.from('aa_consents').delete().eq('user_id', DEMO_USER_ID);

  console.log('Inserting consent 1 (HDFC+Zerodha via Setu_Mock)...');
  const consentId1 = `cst_demo_${Date.now()}_1`;
  const { data: c1, error: e1 } = await supabase.from('aa_consents').insert({
    user_id: DEMO_USER_ID,
    aa_provider: 'Setu_Mock',
    consent_id: consentId1,
    status: 'ACTIVE',
    fip_list: ['HDFC Bank', 'Zerodha', 'CDSL'],
    data_types: ['holdings', 'transactions'],
    purpose: 'portfolio_consolidation',
    valid_from: new Date().toISOString(),
    valid_till: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
  }).select().single();

  if (e1) { console.error('Error creating consent 1:', e1.message); process.exit(1); }
  console.log('✅ Created consent 1:', c1?.id, '| consent_id:', consentId1);

  console.log('\nInserting consent 2 (Axis+Groww via Finvu_Mock)...');
  const consentId2 = `cst_demo_${Date.now()}_2`;
  const { data: c2, error: e2 } = await supabase.from('aa_consents').insert({
    user_id: DEMO_USER_ID,
    aa_provider: 'Finvu_Mock',
    consent_id: consentId2,
    status: 'ACTIVE',
    fip_list: ['Axis Bank', 'Groww'],
    data_types: ['transactions'],
    purpose: 'expense_tracking',
    valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    valid_till: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString()
  }).select().single();

  if (e2) { console.error('Error creating consent 2:', e2.message); process.exit(1); }
  console.log('✅ Created consent 2:', c2?.id, '| consent_id:', consentId2);

  console.log('\n=== Verifying GET /api/compliance/consents/me ===');
  const res = await fetch('http://localhost:3000/api/compliance/consents/me');
  const result = await res.json();
  console.log(JSON.stringify(result, null, 2));

  // Test revocation of consent 1
  console.log(`\n=== Testing PATCH /api/compliance/consents/${consentId1}/revoke ===`);
  const revokeRes = await fetch(`http://localhost:3000/api/compliance/consents/${consentId1}/revoke`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  const revokeResult = await revokeRes.json();
  console.log('Revoke response:', JSON.stringify(revokeResult, null, 2));

  // Verify DB shows revoked
  const { data: verifyData } = await supabase
    .from('aa_consents')
    .select('consent_id, status, revoked_at')
    .eq('consent_id', consentId1)
    .single();
  console.log('\nDB row after revoke:', JSON.stringify(verifyData, null, 2));

  process.exit(0);
}

seedConsent().catch(e => { console.error(e); process.exit(1); });
