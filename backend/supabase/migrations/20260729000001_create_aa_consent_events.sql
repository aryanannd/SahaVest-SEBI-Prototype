-- Migration: 20260729000001_create_aa_consent_events.sql
-- Purpose: Append-only history of every consent state change (grant, revoke, expire).
-- Replaces the silent UPDATE pattern on aa_consents which lost transition history.

CREATE TABLE IF NOT EXISTS aa_consent_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_id      UUID NOT NULL REFERENCES aa_consents(id) ON DELETE CASCADE,
  event_type      VARCHAR(20) NOT NULL,         -- 'created' | 'revoked' | 'expired' | 'refreshed'
  previous_status VARCHAR(20),                  -- status before this event
  new_status      VARCHAR(20) NOT NULL,          -- status after this event
  aa_provider     VARCHAR(50),                  -- which AA provider (Finvu/Setu/etc)
  reason          TEXT,                         -- optional reason (e.g. "User initiated revocation")
  metadata        JSONB,                        -- extra context (e.g. IP, device)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE aa_consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aa_consent_events_owner_policy"
  ON aa_consent_events
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX idx_aa_consent_events_user_id    ON aa_consent_events (user_id);
CREATE INDEX idx_aa_consent_events_consent_id  ON aa_consent_events (consent_id);
CREATE INDEX idx_aa_consent_events_created_at  ON aa_consent_events (created_at);
CREATE INDEX idx_aa_consent_events_event_type  ON aa_consent_events (event_type);

COMMENT ON TABLE aa_consent_events IS 
  'Append-only audit trail of all Account Aggregator consent state changes. '
  'Never UPDATE or DELETE rows — every transition creates a new row.';
