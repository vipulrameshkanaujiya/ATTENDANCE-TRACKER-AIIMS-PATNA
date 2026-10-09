-- Drop the existing constraint
ALTER TABLE public.student_historical_attendance DROP CONSTRAINT IF EXISTS student_historical_attendance_subject_code_check;

-- Add the new constraint allowing OBG
ALTER TABLE public.student_historical_attendance ADD CONSTRAINT student_historical_attendance_subject_code_check CHECK (subject_code IN ('PATH', 'PHARMA', 'MICRO', 'FMT', 'CFM', 'OBG'));
