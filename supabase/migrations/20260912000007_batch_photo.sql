CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES public.users(id)
);

INSERT INTO public.app_settings (key, value)
VALUES ('batch_photo', '{"url": "/batch-photo.jpg", "caption": "MBBS Batch 2024 — AIIMS Patna"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read app_settings" ON public.app_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin can write app_settings" ON public.app_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

GRANT ALL ON public.app_settings TO postgres;
GRANT SELECT ON public.app_settings TO authenticated;
