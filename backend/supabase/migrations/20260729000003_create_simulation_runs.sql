-- Migration: 20260729000003_create_simulation_runs.sql
-- Purpose: Persist every Investor Twin simulation run so users can view history
-- and so we can audit what projections were shown.
-- Previously, simulation results were computed and returned to the client but NEVER saved.

CREATE TABLE IF NOT EXISTS simulation_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Input parameters (what the user configured)
  sip_amount          NUMERIC(20, 4) NOT NULL,    -- monthly SIP in INR
  duration_years      INTEGER NOT NULL,            -- investment horizon in years
  return_rate         NUMERIC(6, 3) NOT NULL,      -- expected annual return rate (%)

  -- Output results (what was computed and shown)
  total_invested      NUMERIC(20, 4),              -- total capital invested
  expected_value      NUMERIC(20, 4),              -- expected portfolio value at end
  optimistic_value    NUMERIC(20, 4),              -- optimistic scenario (+2% rate)
  conservative_value  NUMERIC(20, 4),              -- conservative scenario (-2% rate)
  wealth_gained       NUMERIC(20, 4),              -- gain = expected - invested
  base_portfolio_fv   NUMERIC(20, 4),              -- future value of existing portfolio
  sip_fv              NUMERIC(20, 4),              -- future value of SIP contributions only

  -- Yearly projection data (for the chart)
  yearly_projections  JSONB,                       -- [{year, expected, optimistic, conservative}]

  -- Metadata
  model_version       VARCHAR(20) DEFAULT 'v1.0',  -- calculator formula version
  notes               TEXT,                        -- any user notes or tags

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "simulation_runs_owner_policy"
  ON simulation_runs
  FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Indexes
CREATE INDEX idx_simulation_runs_user_id    ON simulation_runs (user_id);
CREATE INDEX idx_simulation_runs_created_at ON simulation_runs (created_at);

-- View: latest simulation per user (convenience for dashboard)
CREATE OR REPLACE VIEW user_latest_simulation AS
  SELECT DISTINCT ON (user_id) *
  FROM simulation_runs
  ORDER BY user_id, created_at DESC;

COMMENT ON TABLE simulation_runs IS 
  'Append-only record of every Investor Twin simulation run. '
  'Each run creates a new row — inputs and outputs are both persisted for audit and history.';
