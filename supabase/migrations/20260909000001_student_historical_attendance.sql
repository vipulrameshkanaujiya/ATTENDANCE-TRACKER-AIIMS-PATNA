-- ====================================================================
-- MEDICAL STUDENT HUB - HISTORICAL PRE-SEPTEMBER ATTENDANCE
-- Target Database: PostgreSQL 15+ / Supabase
-- Description: Historical attendance tracking for the 5 MBBS subjects
--              (Pathology, Pharmacology, Microbiology, FMT, CFM)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.student_historical_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject_code TEXT NOT NULL CHECK (subject_code IN ('PATH', 'PHARMA', 'MICRO', 'FMT', 'CFM')),
    theory_attended INTEGER NOT NULL DEFAULT 0 CHECK (theory_attended >= 0),
    theory_total INTEGER NOT NULL DEFAULT 0 CHECK (theory_total >= 0),
    practical_attended INTEGER NOT NULL DEFAULT 0 CHECK (practical_attended >= 0),
    practical_total INTEGER NOT NULL DEFAULT 0 CHECK (practical_total >= 0),
    is_one_time_set BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    CONSTRAINT uq_student_subject_historical UNIQUE (student_id, subject_code),
    CONSTRAINT check_theory_attended_le_total CHECK (theory_attended <= theory_total),
    CONSTRAINT check_practical_attended_le_total CHECK (practical_attended <= practical_total)
);

CREATE INDEX IF NOT EXISTS idx_historical_attendance_student ON public.student_historical_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_historical_attendance_subject ON public.student_historical_attendance(subject_code);

-- Enable Row Level Security
ALTER TABLE public.student_historical_attendance ENABLE ROW LEVEL SECURITY;

-- 1. Admin Policy: Full CRUD access on all historical attendance records
DROP POLICY IF EXISTS "Historical attendance admin all" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance admin all" ON public.student_historical_attendance
FOR ALL USING (public.is_admin());

-- 2. Student Policy: SELECT their own records
DROP POLICY IF EXISTS "Historical attendance student select own" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance student select own" ON public.student_historical_attendance
FOR SELECT USING (auth.uid() = student_id);

-- 3. Student Policy: INSERT only if is_one_time_set = FALSE (prevents multiple entries)
DROP POLICY IF EXISTS "Historical attendance student insert own" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance student insert own" ON public.student_historical_attendance
FOR INSERT WITH CHECK (
    auth.uid() = student_id AND (
        NOT EXISTS (
            SELECT 1 FROM public.student_historical_attendance existing
            WHERE existing.student_id = auth.uid() 
              AND existing.subject_code = student_historical_attendance.subject_code
              AND existing.is_one_time_set = true
        )
    )
);

-- 4. Student Policy: UPDATE is BLOCKED once is_one_time_set = TRUE
DROP POLICY IF EXISTS "Historical attendance student update own" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance student update own" ON public.student_historical_attendance
FOR UPDATE USING (
    auth.uid() = student_id AND is_one_time_set = false
) WITH CHECK (
    auth.uid() = student_id
);

-- 5. Immutability Trigger: Ensure once is_one_time_set = true, non-admins cannot mutate
CREATE OR REPLACE FUNCTION public.check_historical_attendance_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF OLD.is_one_time_set = true AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Historical attendance is locked as a one-time entry and can only be modified by an administrator.';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_historical_attendance_lock ON public.student_historical_attendance;
CREATE TRIGGER trg_historical_attendance_lock
BEFORE UPDATE ON public.student_historical_attendance
FOR EACH ROW
EXECUTE FUNCTION public.check_historical_attendance_lock();
