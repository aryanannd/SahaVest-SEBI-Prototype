import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

  const backendUrl = 'http://localhost:3000';
  
  // First, we need to create a test user or use the fallback 'me' which maps to '716691b9-939e-4118-aafb-9246a3923250'
  
  const ranges = ['1M', '3M', '6M', '1Y', 'ALL'];
  
  for (const range of ranges.slice(0,2)) {
      console.log(`\n--- Fetching /api/portfolio/performance/me?range=${range} ---`);
      const res = await fetch(`${backendUrl}/api/portfolio/performance/me?range=${range}`);
      const data = await res.json();
      console.log(JSON.stringify(data).substring(0, 500) + '... (truncated for length)');
  }
}

run();
