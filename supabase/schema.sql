-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 3: DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ / Supabase
-- Description: Core relational schema for AIIMS Patna MBBS Batch 2024
-- ====================================================================

-- 1. BATCHES (Configurable roll ranges)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,          -- 'Batch A', 'Batch B', 'Batch C'
    roll_min INTEGER NOT NULL,                  -- e.g. 1
    roll_max INTEGER NOT NULL,                  -- e.g. 40
    is_default_fallback BOOLEAN DEFAULT FALSE,  -- Batch C handles 81+ and overflow/old students
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USERS (Extends auth.users with student roll number & batch)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    roll_number VARCHAR(5) UNIQUE,              -- Format: strictly '24___' (5 digits)
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    full_name VARCHAR(120),
    avatar_url TEXT,
    is_onboarded BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_roll_number_format CHECK (roll_number IS NULL OR roll_number ~ '^24[0-9]{3}$')
);
CREATE INDEX IF NOT EXISTS idx_users_roll ON public.users(roll_number);
CREATE INDEX IF NOT EXISTS idx_users_batch ON public.users(batch_id);

-- 3. SUBJECTS
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,          -- 'PATH', 'PHARMA', 'MICRO', 'FMT', 'CFM', 'OBG', 'MED', 'SURG', 'AETCOM'
    name VARCHAR(100) NOT NULL,                -- e.g. 'Pathology', 'Pharmacology'
    color_code VARCHAR(10) DEFAULT '#2563EB',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. UNITS
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    unit_number INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,               -- e.g. 'Hematology', 'General Pathology'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (subject_id, unit_number)
);
CREATE INDEX IF NOT EXISTS idx_units_subject ON public.units(subject_id);

-- 5. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    topic_code VARCHAR(50),
    title VARCHAR(255) NOT NULL,               -- e.g. 'Iron Deficiency Anemia'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_topics_unit ON public.topics(unit_id);

-- 6. STUDENT TOPIC PROGRESS (Independent per student; decoupled from attendance)
CREATE TABLE IF NOT EXISTS public.student_topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'LEARNING', 'COMPLETED')),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_topic_progress_student ON public.student_topic_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_topic_progress_topic ON public.student_topic_progress(topic_id);

-- 7. CLASSES (Central scheduling object)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic VARCHAR(255),
    faculty VARCHAR(150),
    venue VARCHAR(100) DEFAULT 'Lecture Hall 2',
    class_type VARCHAR(30) NOT NULL CHECK (
        class_type IN ('Lecture', 'SDL', 'Tutorial', 'Practical', 'Clinical Posting', 'Seminar', 'Integration', 'Exam', 'Other')
    ),
    batch_scope VARCHAR(20) NOT NULL DEFAULT 'ALL' CHECK (
        batch_scope IN ('ALL', 'Batch A', 'Batch B', 'Batch C')
    ),
    notes TEXT,
    timetable_import_id UUID,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_classes_date_batch ON public.classes(date, batch_scope);
CREATE INDEX IF NOT EXISTS idx_classes_subject ON public.classes(subject_id);

-- 8. ATTENDANCE (1-tap records per student per class)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    status VARCHAR(10) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT')),
    marked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (student_id, class_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_student_class ON public.attendance(student_id, class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON public.attendance(class_id);

-- 9. EXAMS (Countdown records)
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,               -- e.g. 'PRE-PROF'
    exam_date DATE NOT NULL,                   -- e.g. '2026-11-04'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. TIMETABLE IMPORTS
CREATE TABLE IF NOT EXISTS public.timetable_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name VARCHAR(255) NOT NULL,
    month_year VARCHAR(30) NOT NULL,          -- e.g. 'September 2026'
    status VARCHAR(20) DEFAULT 'STAGED' CHECK (status IN ('STAGED', 'VALIDATED', 'PUBLISHED', 'FAILED')),
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    published_at TIMESTAMPTZ
);

-- 11. TIMETABLE IMPORT ROWS (Staged parsed data before publishing)
CREATE TABLE IF NOT EXISTS public.timetable_import_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL REFERENCES public.timetable_imports(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_raw VARCHAR(100),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    topic VARCHAR(255),
    faculty VARCHAR(150),
    venue VARCHAR(100),
    class_type VARCHAR(30) NOT NULL,
    batch_scope VARCHAR(20) NOT NULL,
    parse_status VARCHAR(20) DEFAULT 'VALID' CHECK (parse_status IN ('VALID', 'NEEDS_REVIEW', 'UNKNOWN')),
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 3: ROW LEVEL SECURITY POLICIES
-- Target: PostgreSQL / Supabase
-- ====================================================================

-- Enable RLS across all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_import_rows ENABLE ROW LEVEL SECURITY;

-- Helper function: Returns true if caller is admin (verifies role AND email)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_admin_email TEXT;
BEGIN
    v_admin_email := 'vipulrameshkanaujiya@gmail.com';
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() 
          AND role = 'admin' 
          AND lower(trim(email)) = lower(v_admin_email)
    );
END;
$$;


-- --------------------------------------------------------------------
-- 1. USERS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own record or admin views all" ON public.users;
CREATE POLICY "Users view own record or admin views all" ON public.users
FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users insert own profile" ON public.users;
CREATE POLICY "Users insert own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own onboarding profile" ON public.users;
CREATE POLICY "Users update own onboarding profile" ON public.users
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (public.is_admin() OR role = 'student') -- Student cannot elevate themselves to admin
);

-- --------------------------------------------------------------------
-- 2. ATTENDANCE POLICIES (Bulletproof Cross-Student Isolation)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Attendance read own or admin" ON public.attendance;
CREATE POLICY "Attendance read own or admin" ON public.attendance
FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Attendance insert own or admin" ON public.attendance;
CREATE POLICY "Attendance insert own or admin" ON public.attendance
FOR INSERT WITH CHECK (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Attendance update own or admin" ON public.attendance;
CREATE POLICY "Attendance update own or admin" ON public.attendance
FOR UPDATE USING (auth.uid() = student_id OR public.is_admin())
WITH CHECK (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Attendance delete admin only" ON public.attendance;
CREATE POLICY "Attendance delete admin only" ON public.attendance
FOR DELETE USING (public.is_admin());

-- --------------------------------------------------------------------
-- 3. STUDENT TOPIC PROGRESS POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Topic progress read own or admin" ON public.student_topic_progress;
CREATE POLICY "Topic progress read own or admin" ON public.student_topic_progress
FOR SELECT USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Topic progress mutate own" ON public.student_topic_progress;
CREATE POLICY "Topic progress mutate own" ON public.student_topic_progress
FOR ALL USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- --------------------------------------------------------------------
-- 4. BATCHES, CURRICULUM & SCHEDULE POLICIES (Public read, admin write)
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Batches read authenticated" ON public.batches;
CREATE POLICY "Batches read authenticated" ON public.batches FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Batches admin write" ON public.batches;
CREATE POLICY "Batches admin write" ON public.batches FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Subjects read authenticated" ON public.subjects;
CREATE POLICY "Subjects read authenticated" ON public.subjects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Subjects admin write" ON public.subjects;
CREATE POLICY "Subjects admin write" ON public.subjects FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Units read authenticated" ON public.units;
CREATE POLICY "Units read authenticated" ON public.units FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Units admin write" ON public.units;
CREATE POLICY "Units admin write" ON public.units FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Topics read authenticated" ON public.topics;
CREATE POLICY "Topics read authenticated" ON public.topics FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Topics admin write" ON public.topics;
CREATE POLICY "Topics admin write" ON public.topics FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Classes read authenticated" ON public.classes;
CREATE POLICY "Classes read authenticated" ON public.classes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Classes admin write" ON public.classes;
CREATE POLICY "Classes admin write" ON public.classes FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Exams read authenticated" ON public.exams;
CREATE POLICY "Exams read authenticated" ON public.exams FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Exams admin write" ON public.exams;
CREATE POLICY "Exams admin write" ON public.exams FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Imports admin only" ON public.timetable_imports;
CREATE POLICY "Imports admin only" ON public.timetable_imports FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Import rows admin only" ON public.timetable_import_rows;
CREATE POLICY "Import rows admin only" ON public.timetable_import_rows FOR ALL USING (public.is_admin());
-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 3: SEED DATA
-- Description: Baseline academic configuration for AIIMS Patna Phase-2
-- ====================================================================

-- 1. SEED BATCHES
INSERT INTO public.batches (name, roll_min, roll_max, is_default_fallback, notes)
VALUES 
  ('Batch A', 1, 40, false, 'Roll No. 01 to 40'),
  ('Batch B', 41, 80, false, 'Roll No. 41 to 80'),
  ('Batch C', 81, 999, true, 'Roll No. 81 onwards + Old Students')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED CORE MBBS SUBJECTS
INSERT INTO public.subjects (code, name, color_code, display_order)
VALUES
  ('PATH', 'Pathology', '#2563EB', 1),
  ('PHARMA', 'Pharmacology', '#059669', 2),
  ('MICRO', 'Microbiology', '#D97706', 3),
  ('FMT', 'Forensic Medicine & Toxicology', '#DC2626', 4),
  ('CFM', 'Community & Family Medicine', '#7C3AED', 5),
  ('MED', 'Medicine', '#0891B2', 6),
  ('SURG', 'Surgery', '#EA580C', 7),
  ('OBG', 'Obstetrics & Gynecology', '#DB2777', 8),
  ('AETCOM', 'AETCOM', '#4B5563', 9)
ON CONFLICT (code) DO NOTHING;

-- 3. SEED INITIAL EXAM RECORD (Configurable countdown, not hardcoded!)
INSERT INTO public.exams (title, exam_date, description, is_active)
VALUES
  ('PRE-PROF', '2026-11-04', '2nd Professional MBBS Pre-Professional Examination', true)
ON CONFLICT DO NOTHING;

-- 4. SEED SAMPLE PATHOLOGY UNITS & TOPICS
DO $$
DECLARE
    path_id UUID;
    hematology_unit_id UUID;
BEGIN
    SELECT id INTO path_id FROM public.subjects WHERE code = 'PATH' LIMIT 1;

    IF path_id IS NOT NULL THEN
        -- Insert Unit: Hematology
        INSERT INTO public.units (subject_id, unit_number, title)
        VALUES (path_id, 1, 'Hematology')
        ON CONFLICT (subject_id, unit_number) DO UPDATE SET title = EXCLUDED.title
        RETURNING id INTO hematology_unit_id;

        -- Insert Topics for Hematology
        INSERT INTO public.topics (unit_id, topic_code, title, display_order)
        VALUES
            (hematology_unit_id, 'PA-HEM-01', 'Anemia (Overview & Classification)', 1),
            (hematology_unit_id, 'PA-HEM-02', 'Iron Deficiency Anemia', 2),
            (hematology_unit_id, 'PA-HEM-03', 'Megaloblastic Anemia', 3),
            (hematology_unit_id, 'PA-HEM-04', 'Hemolytic Anemia', 4),
            (hematology_unit_id, 'PA-HEM-05', 'Leukemia (Acute & Chronic)', 5),
            (hematology_unit_id, 'PA-HEM-06', 'Lymphoma (Hodgkin & Non-Hodgkin)', 6)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 3: AGGREGATE STATS RPC FUNCTION
-- Description: Anonymous batch-wide statistics without exposing private data
-- ====================================================================

CREATE OR REPLACE FUNCTION public.get_batch_aggregate_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_students_30d', (
            SELECT COUNT(DISTINCT student_id) 
            FROM public.attendance 
            WHERE marked_at > NOW() - INTERVAL '30 days'
        ),
        'batch_average_attendance_pct', (
            SELECT COALESCE(ROUND(
                (COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1
            ), 0)
            FROM public.attendance
        ),
        'subject_averages', (
            SELECT COALESCE(json_agg(s_avg), '[]'::json) FROM (
                SELECT 
                    s.name as subject_name,
                    s.code as subject_code,
                    s.color_code,
                    COALESCE(ROUND((COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1), 0) as avg_pct
                FROM public.subjects s
                JOIN public.classes c ON c.subject_id = s.id
                JOIN public.attendance a ON a.class_id = c.id
                GROUP BY s.id, s.name, s.code, s.color_code
                ORDER BY s.display_order ASC
            ) s_avg
        )
    ) INTO result;
    RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_batch_aggregate_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_batch_aggregate_stats() TO authenticated;

-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 8: STUDENT ROSTER & SECURE ONBOARDING
-- ====================================================================

-- 1. STUDENT ROSTER TABLE (Official Pre-Registration Roster)
CREATE TABLE IF NOT EXISTS public.student_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(5) NOT NULL UNIQUE,
    full_name VARCHAR(120),
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'UNCLAIMED' CHECK (status IN ('UNCLAIMED', 'CLAIMED', 'DISABLED')),
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_roster_roll_format CHECK (roll_number ~ '^24[0-9]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_roster_roll ON public.student_roster(roll_number);
CREATE INDEX IF NOT EXISTS idx_roster_claimed_user ON public.student_roster(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_roster_batch ON public.student_roster(batch_id);

ALTER TABLE public.student_roster ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Roster admin all" ON public.student_roster;
CREATE POLICY "Roster admin all" ON public.student_roster FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Roster student view own claim" ON public.student_roster;
CREATE POLICY "Roster student view own claim" ON public.student_roster
FOR SELECT USING (auth.uid() = claimed_by_user_id);

-- Pre-seed AIIMS Patna MBBS Batch 2024 Baseline Roster (Roll 24001 to 24150)
DO $$
DECLARE
    batch_a_id UUID;
    batch_b_id UUID;
    batch_c_id UUID;
    i INTEGER;
    roll_str VARCHAR(5);
    target_batch_id UUID;
BEGIN
    SELECT id INTO batch_a_id FROM public.batches WHERE name = 'Batch A' LIMIT 1;
    SELECT id INTO batch_b_id FROM public.batches WHERE name = 'Batch B' LIMIT 1;
    SELECT id INTO batch_c_id FROM public.batches WHERE name = 'Batch C' LIMIT 1;

    FOR i IN 1..150 LOOP
        roll_str := '24' || LPAD(i::text, 3, '0');
        IF i <= 40 THEN
            target_batch_id := batch_a_id;
        ELSIF i <= 80 THEN
            target_batch_id := batch_b_id;
        ELSE
            target_batch_id := batch_c_id;
        END IF;

        INSERT INTO public.student_roster (roll_number, batch_id, status)
        VALUES (roll_str, target_batch_id, 'UNCLAIMED')
        ON CONFLICT (roll_number) DO NOTHING;
    END LOOP;
END $$;

-- Atomic Roster Claim Function
CREATE OR REPLACE FUNCTION public.claim_student_roll(p_roll_number VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    v_user_id UUID;
    v_roster_record RECORD;
    v_user_record RECORD;
    v_batch_name VARCHAR(50);
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
    END IF;

    IF p_roll_number IS NULL OR p_roll_number !~ '^24[0-9]{3}$' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid roll number format. Must be 5 digits starting with 24.');
    END IF;

    SELECT * INTO v_user_record FROM public.users WHERE id = v_user_id;
    IF v_user_record IS NOT NULL AND v_user_record.is_onboarded AND v_user_record.roll_number IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Your account has already claimed roll number ' || v_user_record.roll_number || '. Identity cannot be changed.');
    END IF;

    IF EXISTS (SELECT 1 FROM public.student_roster WHERE claimed_by_user_id = v_user_id AND roll_number <> p_roll_number) THEN
        RETURN jsonb_build_object('success', false, 'error', 'This Google account is already linked to another student roll number.');
    END IF;

    SELECT * INTO v_roster_record
    FROM public.student_roster
    WHERE roll_number = p_roll_number
    FOR UPDATE;

    IF v_roster_record IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Roll number ' || p_roll_number || ' is not found on the official batch roster. Please contact the administrator.');
    END IF;

    IF v_roster_record.status = 'DISABLED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This roll number has been disabled by the administrator.');
    END IF;

    IF v_roster_record.status = 'CLAIMED' OR v_roster_record.claimed_by_user_id IS NOT NULL THEN
        IF v_roster_record.claimed_by_user_id = v_user_id THEN
            INSERT INTO public.users (id, email, role, roll_number, batch_id, is_onboarded, full_name, updated_at)
            VALUES (
                v_user_id,
                COALESCE((SELECT email FROM auth.users WHERE id = v_user_id), ''),
                'student',
                v_roster_record.roll_number,
                v_roster_record.batch_id,
                true,
                v_roster_record.full_name,
                now()
            )
            ON CONFLICT (id) DO UPDATE
            SET roll_number = EXCLUDED.roll_number,
                batch_id = EXCLUDED.batch_id,
                is_onboarded = true,
                full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
                updated_at = now();

            RETURN jsonb_build_object('success', true, 'message', 'Already claimed by this account.');
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'Roll number ' || p_roll_number || ' is already claimed by another student account.');
        END IF;
    END IF;

    UPDATE public.student_roster
    SET claimed_by_user_id = v_user_id,
        status = 'CLAIMED',
        claimed_at = now(),
        updated_at = now()
    WHERE id = v_roster_record.id;

    INSERT INTO public.users (id, email, role, roll_number, batch_id, is_onboarded, full_name, updated_at)
    VALUES (
        v_user_id,
        COALESCE((SELECT email FROM auth.users WHERE id = v_user_id), ''),
        'student',
        v_roster_record.roll_number,
        v_roster_record.batch_id,
        true,
        v_roster_record.full_name,
        now()
    )
    ON CONFLICT (id) DO UPDATE
    SET roll_number = EXCLUDED.roll_number,
        batch_id = EXCLUDED.batch_id,
        is_onboarded = true,
        full_name = COALESCE(public.users.full_name, EXCLUDED.full_name),
        updated_at = now();

    SELECT name INTO v_batch_name FROM public.batches WHERE id = v_roster_record.batch_id;

    RETURN jsonb_build_object(
        'success', true,
        'roll_number', v_roster_record.roll_number,
        'batch_id', v_roster_record.batch_id,
        'batch_name', COALESCE(v_batch_name, 'Batch A')
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_student_roll(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_student_roll(VARCHAR) TO authenticated;

-- Identity Immutability Trigger
CREATE OR REPLACE FUNCTION public.check_student_identity_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    IF OLD.is_onboarded = true AND NOT public.is_admin() THEN
        IF NEW.roll_number IS DISTINCT FROM OLD.roll_number THEN
            RAISE EXCEPTION 'Student roll number cannot be modified after onboarding.';
        END IF;
        IF NEW.batch_id IS DISTINCT FROM OLD.batch_id THEN
            RAISE EXCEPTION 'Student batch allocation cannot be modified by student.';
        END IF;
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'User role cannot be self-modified.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_student_identity_tampering ON public.users;
CREATE TRIGGER trigger_prevent_student_identity_tampering
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.check_student_identity_immutability();

-- 13. STUDENT HISTORICAL ATTENDANCE (Pre-September 2026 data for PATH, PHARMA, MICRO, FMT, CFM)
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

ALTER TABLE public.student_historical_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Historical attendance admin all" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance admin all" ON public.student_historical_attendance
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Historical attendance student select own" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance student select own" ON public.student_historical_attendance
FOR SELECT USING (auth.uid() = student_id);

-- 3. Student Policy: INSERT own records
DROP POLICY IF EXISTS "Historical attendance student insert own" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance student insert own" ON public.student_historical_attendance
FOR INSERT WITH CHECK (
    auth.uid() = student_id
);

-- 4. Student Policy: UPDATE own records (locked records blocked via trigger)
DROP POLICY IF EXISTS "Historical attendance student update own" ON public.student_historical_attendance;
CREATE POLICY "Historical attendance student update own" ON public.student_historical_attendance
FOR UPDATE USING (
    auth.uid() = student_id
) WITH CHECK (
    auth.uid() = student_id
);

-- ====================================================================
-- SCHEMA & TABLE PERMISSIONS (Guarantees Supabase Roles Can Access Public Objects)
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;


