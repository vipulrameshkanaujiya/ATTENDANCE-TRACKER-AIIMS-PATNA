-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 8: STUDENT ROSTER & SECURE ONBOARDING
-- Target Database: PostgreSQL 15+ / Supabase
-- Description: Admin-managed student roster, atomic claim locking, 
--              and student identity tampering prevention.
-- ====================================================================

-- 1. STUDENT ROSTER TABLE (Official Pre-Registration Roster)
CREATE TABLE IF NOT EXISTS public.student_roster (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roll_number VARCHAR(5) NOT NULL UNIQUE,     -- Strictly format: '24___' (5 digits)
    full_name VARCHAR(120),                     -- Official name (if pre-populated from college records)
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE, -- 1:1 binding with Google account
    status VARCHAR(20) NOT NULL DEFAULT 'UNCLAIMED' CHECK (status IN ('UNCLAIMED', 'CLAIMED', 'DISABLED')),
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_roster_roll_format CHECK (roll_number ~ '^24[0-9]{3}$')
);

CREATE INDEX IF NOT EXISTS idx_roster_roll ON public.student_roster(roll_number);
CREATE INDEX IF NOT EXISTS idx_roster_claimed_user ON public.student_roster(claimed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_roster_batch ON public.student_roster(batch_id);

-- 2. PRE-SEED AIIMS PATNA MBBS BATCH 2024 BASELINE ROSTER (Roll 24001 to 24150)
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

    -- Loop through 24001 to 24150
    FOR i IN 1..150 LOOP
        roll_str := '24' || LPAD(i::text, 3, '0');
        
        -- Allocate based on official batch rules:
        -- Roll 01-40 -> Batch A, 41-80 -> Batch B, 81+ -> Batch C
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

-- 3. ENABLE RLS ON STUDENT ROSTER
ALTER TABLE public.student_roster ENABLE ROW LEVEL SECURITY;

-- Admin has full access to the roster
DROP POLICY IF EXISTS "Roster admin all" ON public.student_roster;
CREATE POLICY "Roster admin all" ON public.student_roster
FOR ALL USING (public.is_admin());

-- Authenticated users can view their own claimed roster record
DROP POLICY IF EXISTS "Roster student view own claim" ON public.student_roster;
CREATE POLICY "Roster student view own claim" ON public.student_roster
FOR SELECT USING (auth.uid() = claimed_by_user_id);

-- 4. ATOMIC ROSTER CLAIM FUNCTION (Guarantees zero race conditions & collision immunity)
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

    -- Validate roll number format
    IF p_roll_number IS NULL OR p_roll_number !~ '^24[0-9]{3}$' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid roll number format. Must be 5 digits starting with 24.');
    END IF;

    -- Check if calling user is already onboarded or already claimed a roll
    SELECT * INTO v_user_record FROM public.users WHERE id = v_user_id;
    IF v_user_record IS NOT NULL AND v_user_record.is_onboarded AND v_user_record.roll_number IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Your account has already claimed roll number ' || v_user_record.roll_number || '. Identity cannot be changed.');
    END IF;

    -- Check if calling user has claimed another record in student_roster
    IF EXISTS (SELECT 1 FROM public.student_roster WHERE claimed_by_user_id = v_user_id AND roll_number <> p_roll_number) THEN
        RETURN jsonb_build_object('success', false, 'error', 'This Google account is already linked to another student roll number.');
    END IF;

    -- Query target roster entry with row lock
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
            -- Already claimed by this same user; ensure users table is synchronized
            UPDATE public.users
            SET roll_number = v_roster_record.roll_number,
                batch_id = v_roster_record.batch_id,
                is_onboarded = true,
                updated_at = now()
            WHERE id = v_user_id;

            RETURN jsonb_build_object('success', true, 'message', 'Already claimed by this account.');
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'Roll number ' || p_roll_number || ' is already claimed by another student account.');
        END IF;
    END IF;

    -- Atomically claim in student_roster
    UPDATE public.student_roster
    SET claimed_by_user_id = v_user_id,
        status = 'CLAIMED',
        claimed_at = now(),
        updated_at = now()
    WHERE id = v_roster_record.id;

    -- Synchronize public.users record
    UPDATE public.users
    SET roll_number = v_roster_record.roll_number,
        batch_id = v_roster_record.batch_id,
        is_onboarded = true,
        full_name = COALESCE(public.users.full_name, v_roster_record.full_name),
        updated_at = now()
    WHERE id = v_user_id;

    -- Fetch batch name for feedback
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

-- 5. IDENTITY IMMUTABILITY TRIGGER ON USERS TABLE
-- Prevents non-admin students from modifying their roll_number, batch_id, or role once onboarded
CREATE OR REPLACE FUNCTION public.check_student_identity_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    -- If user is already onboarded and caller is not admin
    IF OLD.is_onboarded = true AND NOT public.is_admin() THEN
        -- Prevent changing roll number
        IF NEW.roll_number IS DISTINCT FROM OLD.roll_number THEN
            RAISE EXCEPTION 'Student roll number cannot be modified after onboarding.';
        END IF;
        -- Prevent changing batch allocation
        IF NEW.batch_id IS DISTINCT FROM OLD.batch_id THEN
            RAISE EXCEPTION 'Student batch allocation cannot be modified by student.';
        END IF;
        -- Prevent privilege escalation
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
