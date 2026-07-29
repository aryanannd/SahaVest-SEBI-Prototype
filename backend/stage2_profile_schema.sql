-- stage2_profile_schema.sql

DO $$
BEGIN
    -- Add profile columns to users
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob DATE;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marital_status TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS annual_income TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS app_pin TEXT;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending';
END $$;

-- Create nominees table
CREATE TABLE IF NOT EXISTS public.nominees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    dob DATE,
    allocation INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS and add policy for nominees
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nominees_user_policy ON public.nominees;
CREATE POLICY nominees_user_policy ON public.nominees FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_nominees_user_id ON public.nominees (user_id);
