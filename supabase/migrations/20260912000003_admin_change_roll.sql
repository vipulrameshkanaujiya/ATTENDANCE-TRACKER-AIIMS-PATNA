CREATE OR REPLACE FUNCTION public.admin_change_roll_number(
  p_user_id UUID,
  p_new_roll TEXT,
  p_new_batch_id UUID
)
RETURNS VOID AS 
DECLARE
  v_admin_id UUID;
  v_old_roll TEXT;
BEGIN
  -- Verify caller is admin
  v_admin_id := auth.uid();
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = v_admin_id AND role = 'admin' 
      AND lower(email) = 'vipulrameshkanaujiya@gmail.com'
  ) THEN
    RAISE EXCEPTION 'Only admin can change roll numbers.';
  END IF;

  -- Get old roll
  SELECT roll_number INTO v_old_roll FROM public.users WHERE id = p_user_id;

  -- Temporarily set a flag that the trigger will respect
  PERFORM set_config('app.admin_override', 'true', true);

  -- Update users table
  UPDATE public.users
  SET roll_number = p_new_roll,
      batch_id = p_new_batch_id,
      updated_at = now()
  WHERE id = p_user_id;

  -- Reset flag
  PERFORM set_config('app.admin_override', 'false', true);

  -- Release old roll in roster
  IF v_old_roll IS NOT NULL THEN
    UPDATE public.student_roster
    SET status = 'UNCLAIMED',
        claimed_by_user_id = NULL,
        claimed_at = NULL
    WHERE roll_number = v_old_roll;
  END IF;

  -- Claim new roll
  UPDATE public.student_roster
  SET status = 'CLAIMED',
      claimed_by_user_id = p_user_id,
      claimed_at = now()
  WHERE roll_number = p_new_roll;
END;
 LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp;

GRANT EXECUTE ON FUNCTION public.admin_change_roll_number(UUID, TEXT, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.check_student_identity_immutability()
RETURNS TRIGGER AS 
BEGIN
  -- Admin override flag
  IF current_setting('app.admin_override', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Existing logic
  IF NOT public.is_admin() THEN
    IF NEW.roll_number IS DISTINCT FROM OLD.roll_number THEN
      RAISE EXCEPTION 'Roll number cannot be changed.';
    END IF;
    IF NEW.batch_id IS DISTINCT FROM OLD.batch_id THEN
      RAISE EXCEPTION 'Batch cannot be changed.';
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Role cannot be changed.';
    END IF;
  END IF;

  RETURN NEW;
END;
 LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp;
