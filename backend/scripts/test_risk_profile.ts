/**
 * Step 7 verification script — Risk Profile scoring and DB save
 * Run: npx tsx scripts/test_risk_profile.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: ws as any } }
);

const DEMO_USER_ID = '716691b9-939e-4118-aafb-9246a3923250';

// Mirror the scoring function from RiskProfiling.tsx
function computeRiskCategory(scores: number[]): 'Conservative' | 'Moderate' | 'Aggressive' {
  if (scores.length === 0) return 'Moderate';
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  if (avg <= 2.4) return 'Conservative';
  if (avg <= 3.4) return 'Moderate';
  return 'Aggressive';
}

async function saveRiskProfile(category: string) {
  const { error } = await sb
    .from('users')
    .update({ risk_profile: category, risk_profile_updated_at: new Date().toISOString() })
    .eq('id', DEMO_USER_ID);
  if (error) throw new Error(`DB update failed: ${error.message}`);
}

async function getRiskProfile() {
  const { data, error } = await sb
    .from('users')
    .select('risk_profile, risk_profile_updated_at')
    .eq('id', DEMO_USER_ID)
    .single();
  if (error) throw new Error(`DB read failed: ${error.message}`);
  return data;
}

async function run() {
  console.log('\n=== STEP 7: Risk Profile Scoring Verification ===\n');

  // ---------------------------------------------------------------
  // RUN 1: Conservative answers (all score 1–2)
  // Simulate: Emergency Fund, <1yr horizon, Sell everything, 
  //           Unstable income, No experience, <5% savings, 
  //           No emergency fund, FD preference
  // ---------------------------------------------------------------
  const conservativeScores = [1, 1, 1, 2, 1, 1, 1, 1];
  const conservativeAvg = conservativeScores.reduce((a, b) => a + b) / conservativeScores.length;
  const conservativeResult = computeRiskCategory(conservativeScores);
  console.log('Run 1 (Conservative answers):');
  console.log('  Scores:', conservativeScores);
  console.log('  Average:', conservativeAvg.toFixed(2));
  console.log('  Computed category:', conservativeResult);

  await saveRiskProfile(conservativeResult);
  const dbAfterRun1 = await getRiskProfile();
  console.log('  DB risk_profile:', dbAfterRun1.risk_profile, '| updated_at:', dbAfterRun1.risk_profile_updated_at?.substring(0, 19));
  console.log('  ✅ DB confirms:', dbAfterRun1.risk_profile === 'Conservative' ? 'PASS' : 'FAIL');

  console.log('');

  // ---------------------------------------------------------------
  // RUN 2: Aggressive answers (all score 4–5)
  // Simulate: Wealth Creation, 7+yr horizon, Buy more on dip, 
  //           Very stable+extra income, Expert, >30% savings, 
  //           6+ months emergency fund, Crypto/alts
  // ---------------------------------------------------------------
  const aggressiveScores = [5, 5, 5, 5, 5, 5, 5, 5];
  const aggressiveAvg = aggressiveScores.reduce((a, b) => a + b) / aggressiveScores.length;
  const aggressiveResult = computeRiskCategory(aggressiveScores);
  console.log('Run 2 (Aggressive answers):');
  console.log('  Scores:', aggressiveScores);
  console.log('  Average:', aggressiveAvg.toFixed(2));
  console.log('  Computed category:', aggressiveResult);

  await saveRiskProfile(aggressiveResult);
  const dbAfterRun2 = await getRiskProfile();
  console.log('  DB risk_profile:', dbAfterRun2.risk_profile, '| updated_at:', dbAfterRun2.risk_profile_updated_at?.substring(0, 19));
  console.log('  ✅ DB confirms:', dbAfterRun2.risk_profile === 'Aggressive' ? 'PASS' : 'FAIL');

  console.log('');
  console.log('=== PROOF: Run 1 =>', conservativeResult, '| Run 2 =>', aggressiveResult, '===');
  console.log('Different outcomes confirmed:', conservativeResult !== aggressiveResult ? '✅ YES' : '❌ NO');

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
