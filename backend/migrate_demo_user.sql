DO $$
DECLARE
    old_id UUID := '00000000-0000-0000-0000-000000000000';
    new_id UUID := '716691b9-939e-4118-aafb-9246a3923250';
    tbl text;
    tbls text[] := ARRAY['kyc_records', 'aa_consents', 'linked_accounts', 'holdings', 'transactions', 'goals', 'trust_scores', 'agent_execution_logs', 'scam_checks', 'audit_log', 'grievances', 'learning_progress', 'data_privacy_requests'];
BEGIN
    -- 1. Insert new user into public.users (copying old data if old exists)
    INSERT INTO users (id, mobile_number_encrypted, mobile_hash, pan_encrypted, ckyc_id, preferred_language, risk_profile, risk_profile_updated_at, account_status, created_at, updated_at)
    SELECT new_id, mobile_number_encrypted, 'demo_hash_' || new_id, pan_encrypted, ckyc_id, preferred_language, risk_profile, risk_profile_updated_at, account_status, created_at, updated_at
    FROM users WHERE id = old_id
    ON CONFLICT (id) DO NOTHING;
    
    -- If old user didn't exist for some reason, just insert a dummy so child tables can reference it
    INSERT INTO users (id, mobile_number_encrypted, mobile_hash)
    VALUES (new_id, '\x00', 'demo_hash_' || new_id)
    ON CONFLICT DO NOTHING;

    -- 2. Update child tables
    FOREACH tbl IN ARRAY tbls
    LOOP
        EXECUTE format('UPDATE %I SET user_id = $1 WHERE user_id = $2', tbl) USING new_id, old_id;
    END LOOP;

    -- 3. Delete old user from public.users
    DELETE FROM users WHERE id = old_id;
END $$;
