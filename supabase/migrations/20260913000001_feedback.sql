-- ====================================================================
-- MEDICAL STUDENT HUB - Migration 20260913000001
-- Create feedback table with RLS and indices
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  roll_number TEXT,
  email TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'bug', 'feature', 'other')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'REVIEWED', 'RESOLVED', 'ARCHIVED')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Students can submit feedback'
  ) THEN
    CREATE POLICY "Students can submit feedback" ON public.feedback
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Students can view own feedback'
  ) THEN
    CREATE POLICY "Students can view own feedback" ON public.feedback
      FOR SELECT TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Admin full access to feedback'
  ) THEN
    CREATE POLICY "Admin full access to feedback" ON public.feedback
      FOR ALL USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END
$$;

GRANT ALL ON public.feedback TO postgres;
GRANT SELECT, INSERT ON public.feedback TO authenticated;
