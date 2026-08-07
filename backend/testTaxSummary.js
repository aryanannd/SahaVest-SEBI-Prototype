import fetch from 'node-fetch';

async function test() {
  await new Promise(r => setTimeout(r, 1000));
  try {
    const r = await fetch('http://localhost:3000/api/portfolio/tax-summary/me');
    const d = await r.json();
    console.log('Tax Summary Data:');
    console.log(JSON.stringify(d, null, 2));
  } catch(e) {
    console.error('Error:', e.message);
  }
}
test();
