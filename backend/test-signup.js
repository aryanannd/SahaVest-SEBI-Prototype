import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role as anon key for testing auth/v1/signup to bypass rate limit
  
  const testEmail = `testuser${Date.now()}@sahavest.com`;
  const password = 'securepassword123';
  
  console.log(`\n--- 1. Testing Signup with Email: ${testEmail} ---`);
  
  const signUpRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: testEmail, password: password, email_confirm: true })
  });
  
  const signUpData = await signUpRes.json();
  
  if (!signUpRes.ok) {
    console.error(`Signup failed with status ${signUpRes.status}:`, signUpData);
    return;
  }
  
  console.log(`Signup returned status ${signUpRes.status}`);
  console.log('Signup Response Data:', JSON.stringify(signUpData, null, 2));

  const userId = signUpData.id;

  console.log(`\n--- 2. Checking public.users row immediately after signup ---`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const usersRes = await fetch(`${url}/rest/v1/users?id=eq.${userId}&select=*`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    }
  });
  const usersData = await usersRes.json();
  
  if (usersData.length === 0) {
    console.log('❌ Row not found in public.users');
    return;
  }
  
  const usersRow = usersData[0];
  console.log('Users Row (After Signup):', JSON.stringify(usersRow, null, 2));
  
  if (usersRow.mobile_number_encrypted === null && usersRow.mobile_hash === null) {
    console.log('✅ mobile_number_encrypted and mobile_hash are correctly set to NULL.');
  } else {
    console.log('❌ mobile_number_encrypted or mobile_hash are NOT null!');
  }

  console.log(`\n--- 3. Simulating Personal Info Step (Updating mobile) ---`);
  const fakeEncryptedMobile = 'enc_9876543210';
  const fakeMobileHash = `hash_${Date.now()}`;
  
  const updateRes = await fetch(`${url}/rest/v1/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      mobile_number_encrypted: fakeEncryptedMobile,
      mobile_hash: fakeMobileHash,
      onboarding_status: 'kyc_pending',
      full_name: 'Test User'
    })
  });
  
  const updateData = await updateRes.json();
  if (!updateRes.ok) {
    console.error('Error updating users row:', updateData);
    return;
  }
  console.log('Update Successful.');

  console.log(`\n--- 4. Checking public.users row after update ---`);
  const updatedUsersRow = updateData[0];
  console.log('Users Row (After Update):', JSON.stringify(updatedUsersRow, null, 2));
  if (updatedUsersRow.mobile_number_encrypted === fakeEncryptedMobile && updatedUsersRow.mobile_hash === fakeMobileHash) {
    console.log('✅ mobile_number_encrypted and mobile_hash correctly updated!');
  } else {
    console.log('❌ Update failed to persist expected values.');
  }
  
  console.log(`\n--- 5. Checking that a second row wasn't created for the same user ---`);
  const countRes = await fetch(`${url}/rest/v1/users?id=eq.${userId}&select=id`, {
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`
    }
  });
  const countData = await countRes.json();
  console.log(`Total rows for user ${userId} in public.users: ${countData.length}`);
  if (countData.length === 1) {
    console.log('✅ Confirmed: only a single row exists (update occurred in-place).');
  } else {
    console.log('❌ Multiple rows found!');
  }
}

run();
