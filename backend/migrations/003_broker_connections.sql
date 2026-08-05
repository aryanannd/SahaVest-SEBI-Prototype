-- Migration: 003_broker_connections.sql
-- Description: Multi-broker OAuth connections table supporting Zerodha Kite Connect & Upstox

CREATE TABLE IF NOT EXISTS public.broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  broker TEXT NOT NULL,
  broker_user_id TEXT,
  access_token TEXT NOT NULL, -- AES-256-GCM encrypted string
  public_token TEXT,
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT now(),
  last_synced_at TIMESTAMPTZ,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'DISCONNECTED')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_broker UNIQUE (user_id, broker)
);

CREATE INDEX IF NOT EXISTS idx_broker_connections_user_broker ON public.broker_connections(user_id, broker);
