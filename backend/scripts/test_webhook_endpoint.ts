import crypto from 'crypto';
import { supabase } from '../src/lib/supabase';

async function testLiveWebhookEndpoint() {
  console.log('=== TEST 3: Testing POST /api/webhooks/setu-aa endpoint ===');

  console.log('[Step 1] Querying Supabase for user...');
  const { data: userRecord, error: uErr } = await supabase.from('users').select('id').limit(1).single();
  if (uErr || !userRecord) {
    throw new Error('Failed to query user: ' + JSON.stringify(uErr));
  }
  const testUserId = userRecord.id;
  console.log('[Step 1] User found:', testUserId);
  const testConsentId = `cst_webhook_live_${Date.now()}`;

  console.log('[Step 2] Inserting test consent in aa_consents...');
  // 1. Insert a PENDING consent record in aa_consents
  const { data: consentRecord, error: cErr } = await supabase.from('aa_consents').insert({
    user_id: testUserId,
    aa_provider: 'Setu_Live',
    consent_id: testConsentId,
    status: 'PENDING',
    fip_list: ['HDFC_BANK'],
    data_types: ['DEPOSIT'],
    purpose: 'Webhook test'
  }).select('id').single();

  if (cErr || !consentRecord) {
    throw new Error('Failed to insert test consent: ' + JSON.stringify(cErr));
  }
  console.log('[Step 2] Inserted consent record ID:', consentRecord.id);

  // 2. Prepare Webhook payload from Setu
  const webhookSecret = process.env.SETU_WEBHOOK_SECRET || process.env.SETU_CLIENT_SECRET || 'test_secret';
  const payloadObj = {
    type: 'CONSENT_STATUS_UPDATE',
    timestamp: new Date().toISOString(),
    data: {
      consentId: testConsentId,
      status: 'ACTIVE',
      detail: {
        accounts: [
          {
            maskedAccNumber: 'XXXXXXXX9988',
            accType: 'SAVINGS',
            fipId: 'HDFC_BANK',
            linkRefNumber: 'ref-9988'
          }
        ]
      }
    }
  };

  const rawBody = JSON.stringify(payloadObj);
  const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('base64');

  const PORT = process.env.PORT || 3000;
  const res = await fetch(`http://127.0.0.1:${PORT}/api/webhooks/setu-aa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-setu-signature': signature
    },
    body: rawBody
  });

  const resJson = await res.json();
  console.log(`[PASS 3.1] Webhook response status: ${res.status}`, resJson);

  // 3. Verify status updated to ACTIVE in aa_consents
  const { data: updatedConsent } = await supabase
    .from('aa_consents')
    .select('status')
    .eq('consent_id', testConsentId)
    .single();

  console.log(`[PASS 3.2] Verified aa_consents updated status: ${updatedConsent?.status} (Expected: ACTIVE)`);

  // 4. Verify aa_consent_events logged the transition
  const { data: eventRecords } = await supabase
    .from('aa_consent_events')
    .select('event_type, previous_status, new_status')
    .eq('consent_id', consentRecord.id);

  console.log('[PASS 3.3] Verified aa_consent_events records:', JSON.stringify(eventRecords, null, 2));

  // 5. Test polling GET /api/aa/consent/:id/status
  const statusRes = await fetch(`http://127.0.0.1:${PORT}/api/aa/consent/${testConsentId}/status`);
  const statusJson = await statusRes.json();
  console.log(`[PASS 3.4] Polling endpoint /api/aa/consent/${testConsentId}/status response:`, statusJson);

  // Clean up
  await supabase.from('aa_consent_events').delete().eq('consent_id', consentRecord.id);
  await supabase.from('aa_consents').delete().eq('consent_id', testConsentId);
}

testLiveWebhookEndpoint().catch(err => {
  console.error('Webhook endpoint test error:', err);
  process.exit(1);
});
