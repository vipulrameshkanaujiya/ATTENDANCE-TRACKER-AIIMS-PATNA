CREATE TABLE IF NOT EXISTS public.access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email TEXT,
  roll_number TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT TRUE,
  reason TEXT,
  blocked_by UUID REFERENCES public.users(id),
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unblocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (email IS NOT NULL OR roll_number IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_access_control_email ON public.access_control(lower(email));
CREATE INDEX IF NOT EXISTS idx_access_control_roll ON public.access_control(roll_number);
CREATE INDEX IF NOT EXISTS idx_access_control_user_id ON public.access_control(user_id);
CREATE INDEX IF NOT EXISTS idx_access_control_is_blocked ON public.access_control(is_blocked);

ALTER TABLE public.access_control ENABLE ROW LEVEL SECURITY;

-- Only admin can read/write
CREATE POLICY "Admin full access to access_control" ON public.access_control
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Any authenticated user can check their OWN block status (needed for middleware)
CREATE POLICY "Users can check own block status" ON public.access_control
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(email) = lower((auth.jwt() ->> 'email'))
  );

GRANT ALL ON public.access_control TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_control TO authenticated;
