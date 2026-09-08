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
