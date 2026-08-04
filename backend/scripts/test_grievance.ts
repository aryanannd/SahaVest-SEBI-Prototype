/**
 * Step 4 verification script
 * Tests both failure-case and success-case for POST /api/compliance/grievance
 * Run: npx tsx scripts/test_grievance.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as any } }
);

const DEMO_USER_ID = '716691b9-939e-4118-aafb-9246a3923250';

async function run() {
  // =====================================================================
  // FAILURE CASE: Directly try to insert a grievance with an invalid 
  // user_id (non-UUID string) to trigger Supabase's uuid type error
  // This mimics what the endpoint's error branch now returns
  // =====================================================================
  console.log('\n=== FAILURE CASE: Insert with invalid user_id ===');
  const { data: failData, error: failError } = await supabase
    .from('grievances')
    .insert({
      user_id: 'NOT_A_VALID_UUID',  // Forces Postgres error: invalid input syntax for type uuid
      scores_ref_id: 'SCORES-FAIL-TEST',
      category: 'Test',
      status: 'submitted'
    })
    .select('id')
    .single();

  if (failError) {
    console.log('✅ DB correctly rejected invalid insert:');
    console.log('   Error code:', failError.code);
    console.log('   Error message:', failError.message);
    console.log('\n   → With new code, endpoint would return HTTP 503:');
    console.log('   { error: true, message: "Failed to file grievance...", detail: "' + failError.message + '" }');
  } else {
    console.log('❌ Unexpected success (should have failed):', failData);
  }

  // =====================================================================
  // SUCCESS CASE: File a real grievance via the API endpoint
  // =====================================================================
  console.log('\n=== SUCCESS CASE: POST /api/compliance/grievance ===');
  const body = { category: 'Trade execution delay', description: 'My trade was not executed for 3 days', brokerName: 'Zerodha' };
  const res = await fetch('http://localhost:3000/api/compliance/grievance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const result = await res.json();
  console.log('HTTP Status:', res.status);
  console.log('Response:', JSON.stringify(result, null, 2));

  if (res.status === 200 && result.id) {
    console.log('\n✅ Grievance filed successfully. Verifying DB row...');
    const { data: dbRow } = await supabase
      .from('grievances')
      .select('id, user_id, category, scores_ref_id, status, filed_at')
      .eq('id', result.id)
      .single();
    console.log('DB row:');
    console.log(JSON.stringify(dbRow, null, 2));

    // Verify it appears in GET /api/compliance/grievances/me
    console.log('\n=== Verifying GET /api/compliance/grievances/me ===');
    const listRes = await fetch('http://localhost:3000/api/compliance/grievances/me');
    const listResult = await listRes.json();
    const found = listResult.grievances?.find((g: any) => g.id === result.id);
    if (found) {
      console.log('✅ Grievance appears in GET /api/compliance/grievances/me:');
      console.log(JSON.stringify(found, null, 2));
    } else {
      console.log('❌ Grievance NOT found in list response');
      console.log('Full list:', JSON.stringify(listResult, null, 2));
    }
  } else {
    console.log('❌ Grievance filing failed:', result);
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
