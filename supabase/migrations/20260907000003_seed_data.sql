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
