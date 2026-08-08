const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcWRremRzbm9ubG5kZ3JmeWZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDkwOTUyMSwiZXhwIjoyMTAwNDg1NTIxfQ.WDsZH3jxQYJKfh7OMaE0WDYGEYdXGTeUC5T6ojyCqoo';
const headers = {
  'apikey': key,
  'Authorization': 'Bearer ' + key,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function seed() {
  const userId = '716691b9-939e-4118-aafb-9246a3923250';
  const url = 'https://pqqdkzdsnonlndgrfyfj.supabase.co/rest/v1';
  
  // 1. Delete old
  await fetch(`${url}/holdings?user_id=eq.${userId}`, { method: 'DELETE', headers: { ...headers, Prefer: 'return=minimal' }});
  await fetch(`${url}/linked_accounts?user_id=eq.${userId}`, { method: 'DELETE', headers: { ...headers, Prefer: 'return=minimal' }});
  
  // 2. Insert Accounts
  const accRes = await fetch(`${url}/linked_accounts`, {
    method: 'POST', headers,
    body: JSON.stringify([
      { user_id: userId, fip_type: 'BANK', provider_name: 'HDFC Bank', masked_account_ref: 'XXXX1234', sync_status: 'SUCCESS' },
      { user_id: userId, fip_type: 'DEMAT', provider_name: 'Zerodha', masked_account_ref: 'XXXX5678', sync_status: 'SUCCESS' },
      { user_id: userId, fip_type: 'MUTUAL_FUND', provider_name: 'SBI Mutual Fund', masked_account_ref: 'XXXX9012', sync_status: 'SUCCESS' }
    ])
  });
  const accounts = await accRes.json();
  const hdfc = accounts.find(a => a.provider_name === 'HDFC Bank').id;
  const zerodha = accounts.find(a => a.provider_name === 'Zerodha').id;
  const sbi = accounts.find(a => a.provider_name === 'SBI Mutual Fund').id;

  // 3. Insert Holdings
  const holdings = [
    { user_id: userId, linked_account_id: hdfc, asset_class: 'CASH_EQUIVALENT', instrument_name: `HDFC Savings A/C`, isin_or_scheme_code: `SAV_1234`, quantity: 1, avg_cost: 125000, current_value: 125000, currency: 'INR', sector: 'Cash' },
    { user_id: userId, linked_account_id: hdfc, asset_class: 'FIXED_INCOME', instrument_name: `HDFC 5-Yr Fixed Deposit`, isin_or_scheme_code: `FD_1234`, quantity: 1, avg_cost: 300000, current_value: 345000, currency: 'INR', sector: 'Debt' },
    { user_id: userId, linked_account_id: zerodha, asset_class: 'EQUITY', instrument_name: `Reliance Industries Ltd.`, isin_or_scheme_code: `INE002A01018`, quantity: 50, avg_cost: 120000, current_value: 148500, currency: 'INR', sector: 'Energy' },
    { user_id: userId, linked_account_id: zerodha, asset_class: 'EQUITY', instrument_name: `Tata Consultancy Services`, isin_or_scheme_code: `INE467B01029`, quantity: 30, avg_cost: 105000, current_value: 121000, currency: 'INR', sector: 'Technology' },
    { user_id: userId, linked_account_id: sbi, asset_class: 'MUTUAL_FUND', instrument_name: `Parag Parikh Flexi Cap Fund`, isin_or_scheme_code: `INF846K01243`, quantity: 2500, avg_cost: 95000, current_value: 142000, currency: 'INR', sector: 'Diversified' },
    { user_id: userId, linked_account_id: sbi, asset_class: 'MUTUAL_FUND', instrument_name: `SBI Small Cap Fund`, isin_or_scheme_code: `INF200K01T28`, quantity: 1200, avg_cost: 60000, current_value: 98000, currency: 'INR', sector: 'Small Cap' }
  ];

  const res = await fetch(`${url}/holdings`, {
    method: 'POST', headers, body: JSON.stringify(holdings)
  });
  console.log(await res.json());
}
seed();
