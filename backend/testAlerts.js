import fetch from 'node-fetch';

async function test() {
  await new Promise(r => setTimeout(r, 3000));
  try {
    const r = await fetch('http://localhost:3000/api/compliance/audit/me');
    const d = await r.json();
    console.log('Audit events count:', d.events?.length);
    d.events?.forEach(e => console.log(`  [${e.ref_type}] ${e.title}: ${e.summary?.slice(0, 80)} | hash: ${e.hash?.slice(0,16)}...`));
  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();
