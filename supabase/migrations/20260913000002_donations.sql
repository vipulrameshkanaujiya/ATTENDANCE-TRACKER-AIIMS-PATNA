-- ====================================================================
-- MEDICAL STUDENT HUB - Migration 20260913000002
-- Create donations table with RLS and indices
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  amount NUMERIC(10, 2),
  currency TEXT DEFAULT 'INR',
  message TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_donations_created ON public.donations(created_at DESC);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'donations' AND policyname = 'Anyone can view public donations'
  ) THEN
    CREATE POLICY "Anyone can view public donations" ON public.donations
      FOR SELECT TO authenticated
      USING (is_public = TRUE);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'donations' AND policyname = 'Admin full access to donations'
  ) THEN
    CREATE POLICY "Admin full access to donations" ON public.donations
      FOR ALL USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

GRANT ALL ON public.donations TO postgres;
GRANT SELECT ON public.donations TO authenticated;
