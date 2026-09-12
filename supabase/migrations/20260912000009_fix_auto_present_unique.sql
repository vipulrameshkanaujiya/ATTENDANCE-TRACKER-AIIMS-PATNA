-- ====================================================================
-- MEDICAL STUDENT HUB - Migration 20260912000009
-- Add missing UNIQUE constraint on student_auto_present_preferences.student_id
-- This is required for upsert(..., { onConflict: 'student_id' }) to work.
-- ====================================================================

ALTER TABLE public.student_auto_present_preferences
  ADD CONSTRAINT IF NOT EXISTS student_auto_present_student_unique UNIQUE (student_id);
