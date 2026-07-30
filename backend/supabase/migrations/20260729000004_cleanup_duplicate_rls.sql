-- Clean up duplicate RLS policies

-- aa_consents
DROP POLICY IF EXISTS "Users can access their own consents" ON public.aa_consents;

-- agent_execution_logs
DROP POLICY IF EXISTS "Users can access their own agent execution logs" ON public.agent_execution_logs;

-- audit_log
DROP POLICY IF EXISTS "Users can access their own audit logs" ON public.audit_log;

-- data_privacy_requests
DROP POLICY IF EXISTS "Users can access their own data privacy requests" ON public.data_privacy_requests;

-- goals
DROP POLICY IF EXISTS "Users can access their own goals" ON public.goals;

-- grievances
DROP POLICY IF EXISTS "Users can access their own grievances" ON public.grievances;

-- holdings
DROP POLICY IF EXISTS "Users can access their own holdings" ON public.holdings;

-- kyc_records
DROP POLICY IF EXISTS "Users can access their own kyc_records" ON public.kyc_records;

-- learning_progress
DROP POLICY IF EXISTS "Users can access their own learning progress" ON public.learning_progress;

-- linked_accounts
DROP POLICY IF EXISTS "Users can access their own linked accounts" ON public.linked_accounts;

-- scam_checks
DROP POLICY IF EXISTS "Users can access their own scam checks" ON public.scam_checks;

-- transactions
DROP POLICY IF EXISTS "Users can access their own transactions" ON public.transactions;

-- trust_scores
DROP POLICY IF EXISTS "Users can access their own trust scores" ON public.trust_scores;

-- users
DROP POLICY IF EXISTS "Users can only see and edit their own profile" ON public.users;
