DO $$
DECLARE
    tbl text;
    tbls text[] := ARRAY['users', 'kyc_records', 'aa_consents', 'linked_accounts', 'holdings', 'transactions', 'goals', 'trust_scores', 'agent_execution_logs', 'scam_checks', 'audit_log', 'grievances', 'learning_progress', 'data_privacy_requests'];
BEGIN
    -- Add missing created_at columns
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
    ALTER TABLE learning_progress ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
    ALTER TABLE data_privacy_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
    ALTER TABLE grievances ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

    FOREACH tbl IN ARRAY tbls
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        
        -- Drop existing policies to ensure clean state
        EXECUTE format('DROP POLICY IF EXISTS %I_user_policy ON %I;', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own records" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON %I;', tbl);
        
        -- Create the proper policy
        IF tbl = 'users' THEN
            EXECUTE format('CREATE POLICY %I_user_policy ON %I FOR ALL USING (auth.uid() = id);', tbl, tbl);
        ELSE
            EXECUTE format('CREATE POLICY %I_user_policy ON %I FOR ALL USING (auth.uid() = user_id);', tbl, tbl);
        END IF;

        -- Create index on user_id (for tables other than users)
        IF tbl != 'users' THEN
            EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_user_id ON %I (user_id);', tbl, tbl);
        END IF;

        -- Create index on created_at
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_created_at ON %I (created_at);', tbl, tbl);
    END LOOP;
END $$;

DO $$
DECLARE
    tbl text;
    tbls text[] := ARRAY['kyc_records', 'aa_consents', 'linked_accounts', 'holdings', 'transactions', 'goals', 'trust_scores', 'agent_execution_logs', 'scam_checks', 'audit_log', 'grievances', 'learning_progress', 'data_privacy_requests'];
    fk_name text;
    fk_exists boolean;
BEGIN
    FOREACH tbl IN ARRAY tbls
    LOOP
        fk_name := format('fk_%s_user_id', tbl);
        
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_name = fk_name AND table_name = tbl
        ) INTO fk_exists;

        IF NOT fk_exists THEN
            BEGIN
                EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES users(id);', tbl, fk_name);
            EXCEPTION WHEN others THEN
                -- ignore if constraint already exists under another name
            END;
        END IF;
    END LOOP;
END $$;

COMMENT ON TABLE users IS 'Core user identity and profile data.';
COMMENT ON TABLE kyc_records IS 'KYC verification status and references.';
COMMENT ON TABLE aa_consents IS 'Account Aggregator consents granted by the user.';
COMMENT ON TABLE linked_accounts IS 'FIP accounts linked via AA or other methods.';
COMMENT ON TABLE holdings IS 'Portfolio holdings at an instrument level.';
COMMENT ON TABLE transactions IS 'Transaction history for holdings.';
COMMENT ON TABLE goals IS 'User defined financial goals.';
COMMENT ON TABLE trust_scores IS 'Trust scores calculated by AI for entities/tips.';
COMMENT ON TABLE agent_execution_logs IS 'Execution traces and latency for AI agents.';
COMMENT ON TABLE scam_checks IS 'User requests for scam verification on texts or images.';
COMMENT ON TABLE audit_log IS 'Immutable audit trail of compliance and agent actions.';
COMMENT ON TABLE grievances IS 'Grievances filed to SCORES or internal support.';
COMMENT ON TABLE learning_progress IS 'User progress through financial literacy modules.';
COMMENT ON TABLE data_privacy_requests IS 'User DPDP data privacy (download/delete) requests.';
