-- Extend users table with last-seen fields
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_page_visited TEXT;

-- Log of significant actions
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  page TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_activity_user ON public.user_activity(user_id, created_at DESC);
CREATE INDEX idx_user_activity_created ON public.user_activity(created_at DESC);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Users can read their own activity (optional)
CREATE POLICY "Users read own activity" ON public.user_activity
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Only admin can write to activity log (via server action using service role)
CREATE POLICY "Admin manages activity" ON public.user_activity
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT ALL ON public.user_activity TO postgres;
GRANT SELECT, INSERT ON public.user_activity TO authenticated;
