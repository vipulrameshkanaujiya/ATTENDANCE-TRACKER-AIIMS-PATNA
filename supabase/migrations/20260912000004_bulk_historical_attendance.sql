CREATE TABLE IF NOT EXISTS public.bulk_historical_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_number TEXT NOT NULL,
  subject_code TEXT NOT NULL CHECK (subject_code IN ('PATH', 'PHARMA', 'MICRO', 'FMT', 'CFM')),
  theory_attended INTEGER NOT NULL DEFAULT 0 CHECK (theory_attended >= 0),
  theory_total INTEGER NOT NULL DEFAULT 0 CHECK (theory_total >= 0),
  practical_attended INTEGER NOT NULL DEFAULT 0 CHECK (practical_attended >= 0),
  practical_total INTEGER NOT NULL DEFAULT 0 CHECK (practical_total >= 0),
  uploaded_by UUID REFERENCES public.users(id),
  upload_batch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(roll_number, subject_code),
  CHECK (theory_attended <= theory_total),
  CHECK (practical_attended <= practical_total)
);

CREATE INDEX IF NOT EXISTS idx_bulk_hist_roll ON public.bulk_historical_attendance(roll_number);
CREATE INDEX IF NOT EXISTS idx_bulk_hist_batch ON public.bulk_historical_attendance(upload_batch_id);

ALTER TABLE public.bulk_historical_attendance ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access bulk_historical" ON public.bulk_historical_attendance
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Students can read their OWN row (by roll number)
CREATE POLICY "Students read own bulk attendance" ON public.bulk_historical_attendance
  FOR SELECT TO authenticated
  USING (
    roll_number = (
      SELECT roll_number FROM public.users WHERE id = auth.uid()
    )
  );

GRANT ALL ON public.bulk_historical_attendance TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bulk_historical_attendance TO authenticated;

ALTER TABLE public.student_historical_attendance
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'MANUAL' CHECK (source IN ('MANUAL', 'BULK_CSV'));

ALTER TABLE public.student_historical_attendance
  ADD COLUMN IF NOT EXISTS verified_by_user BOOLEAN DEFAULT FALSE;
