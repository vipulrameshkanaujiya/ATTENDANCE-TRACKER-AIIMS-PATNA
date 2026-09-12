-- ====================================================================
-- MEDICAL STUDENT HUB - Migration 20260912000008
-- Fix claim_student_roll to accept legacy roll numbers (21xxx-24xxx)
-- ====================================================================

-- Drop the old CHECK constraint on users.roll_number and recreate with new regex
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS check_roll_number_format;

ALTER TABLE public.users
  ADD CONSTRAINT check_roll_number_format
    CHECK (roll_number IS NULL OR roll_number ~ '^2[1-4][0-9]{3}$');

-- Drop the old CHECK constraint on student_roster and recreate with new regex
ALTER TABLE public.student_roster
  DROP CONSTRAINT IF EXISTS check_roster_roll_format;

ALTER TABLE public.student_roster
  ADD CONSTRAINT check_roster_roll_format
    CHECK (roll_number ~ '^2[1-4][0-9]{3}$');

-- Recreate claim_student_roll with updated regex
CREATE OR REPLACE FUNCTION public.claim_student_roll(p_roll_number VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS 
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

    -- Validate roll number format: accept 21xxx, 22xxx, 23xxx, 24xxx
    IF p_roll_number IS NULL OR p_roll_number !~ '^2[1-4][0-9]{3}$' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid roll number format. Must be 5 digits starting with 21, 22, 23, or 24.');
    END IF;

    -- Check if calling user is already onboarded
    SELECT * INTO v_user_record
    FROM public.users
    WHERE id = v_user_id;

    IF v_user_record.is_onboarded = true THEN
        RETURN jsonb_build_object('success', false, 'error', 'You have already completed onboarding.');
    END IF;

    -- Lock the roster row and check if it's claimable
    SELECT * INTO v_roster_record
    FROM public.student_roster
    WHERE roll_number = p_roll_number
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'This roll number is not in the official batch roster.');
    END IF;

    IF v_roster_record.status != 'UNCLAIMED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'This roll number has already been claimed by another student.');
    END IF;

    -- Mark roster row as CLAIMED
    UPDATE public.student_roster
    SET
        status = 'CLAIMED',
        claimed_by_user_id = v_user_id,
        claimed_at = NOW(),
        updated_at = NOW()
    WHERE roll_number = p_roll_number;

    -- Determine batch name for the response
    SELECT b.name INTO v_batch_name
    FROM public.batches b
    WHERE b.id = v_roster_record.batch_id;

    -- Update the user's profile
    UPDATE public.users
    SET
        roll_number = p_roll_number,
        batch_id = v_roster_record.batch_id,
        is_onboarded = true,
        updated_at = NOW()
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'roll_number', p_roll_number,
        'batch_name', COALESCE(v_batch_name, 'Unknown Batch'),
        'full_name', v_roster_record.full_name
    );
END;
;

REVOKE EXECUTE ON FUNCTION public.claim_student_roll(VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_student_roll(VARCHAR) TO authenticated;
