-- Migration: 20260729000002_create_sync_attempts.sql
-- Purpose: Append-only log of every AA data sync attempt (success or failure).
-- Replaces the silent UPDATE on linked_accounts.last_synced_at / sync_status
-- which overwrote every previous sync result and lost full history.

CREATE TABLE IF NOT EXISTS sync_attempts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  linked_account_id   UUID NOT NULL REFERENCES linked_accounts(id) ON DELETE CASCADE,
  sync_status         VARCHAR(20) NOT NULL,       -- 'pending' | 'success' | 'failed' | 'partial'
  records_fetched     INTEGER,                    -- number of holdings/transactions fetched
  records_inserted    INTEGER,                    -- number of new rows written
  records_updated     INTEGER,                    -- number of rows updated
  error_code          VARCHAR(50),                -- machine-readable error code if failed
  error_message       TEXT,                       -- human-readable error details
  latency_ms          INTEGER,                    -- how long the sync took
  data_as_of          TIMESTAMPTZ,               -- timestamp of the data from the FIP
  initiated_by        VARCHAR(20) DEFAULT 'system',  -- 'user' | 'system' | 'cron'
  metadata            JSONB,                      -- raw response metadata for debugging
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE sync_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_attempts_owner_policy"
  ON sync_attempts
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX idx_sync_attempts_user_id           ON sync_attempts (user_id);
CREATE INDEX idx_sync_attempts_linked_account_id  ON sync_attempts (linked_account_id);
CREATE INDEX idx_sync_attempts_created_at         ON sync_attempts (created_at);
CREATE INDEX idx_sync_attempts_sync_status        ON sync_attempts (sync_status);

COMMENT ON TABLE sync_attempts IS 
  'Append-only log of every Account Aggregator data sync attempt. '
  'Each sync attempt — success or failure — creates a new row. Never UPDATE.';
