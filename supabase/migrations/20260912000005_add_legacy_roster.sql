-- Allow legacy roll numbers in the roster
ALTER TABLE public.student_roster
  DROP CONSTRAINT IF EXISTS student_roster_roll_number_check;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_roll_number_check;

ALTER TABLE public.student_roster
  ADD CONSTRAINT student_roster_roll_number_check
    CHECK (roll_number ~ '^2[1-4]\d{3}$');

ALTER TABLE public.users
  ADD CONSTRAINT users_roll_number_check
    CHECK (roll_number IS NULL OR roll_number ~ '^2[1-4]\d{3}$');

-- Add the 5 legacy students to the roster (Batch C)
INSERT INTO public.student_roster (roll_number, status, batch_id)
SELECT '22064', 'UNCLAIMED', (SELECT id FROM public.batches WHERE name = 'Batch C')
WHERE NOT EXISTS (SELECT 1 FROM public.student_roster WHERE roll_number = '22064');

INSERT INTO public.student_roster (roll_number, status, batch_id)
SELECT '23033', 'UNCLAIMED', (SELECT id FROM public.batches WHERE name = 'Batch C')
WHERE NOT EXISTS (SELECT 1 FROM public.student_roster WHERE roll_number = '23033');

INSERT INTO public.student_roster (roll_number, status, batch_id)
SELECT '23065', 'UNCLAIMED', (SELECT id FROM public.batches WHERE name = 'Batch C')
WHERE NOT EXISTS (SELECT 1 FROM public.student_roster WHERE roll_number = '23065');

INSERT INTO public.student_roster (roll_number, status, batch_id)
SELECT '23103', 'UNCLAIMED', (SELECT id FROM public.batches WHERE name = 'Batch C')
WHERE NOT EXISTS (SELECT 1 FROM public.student_roster WHERE roll_number = '23103');

INSERT INTO public.student_roster (roll_number, status, batch_id)
SELECT '21114', 'UNCLAIMED', (SELECT id FROM public.batches WHERE name = 'Batch C')
WHERE NOT EXISTS (SELECT 1 FROM public.student_roster WHERE roll_number = '21114');

ALTER TABLE public.bulk_historical_attendance
  ADD COLUMN IF NOT EXISTS name TEXT;
