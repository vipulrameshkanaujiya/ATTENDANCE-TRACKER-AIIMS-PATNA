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
