CREATE TABLE IF NOT EXISTS public.admin_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_messages_to_user ON public.admin_messages(to_user_id, is_read);
CREATE INDEX idx_admin_messages_created ON public.admin_messages(created_at DESC);

ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Users can read their own messages
CREATE POLICY "Users read own messages" ON public.admin_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = to_user_id);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users update own messages" ON public.admin_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

-- Admin full access
CREATE POLICY "Admin full access to messages" ON public.admin_messages
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT ALL ON public.admin_messages TO postgres;
GRANT SELECT, UPDATE ON public.admin_messages TO authenticated;
