CREATE OR REPLACE FUNCTION public.check_student_identity_immutability()
RETURNS TRIGGER AS \$\$
BEGIN
  -- Admin override flag
  IF current_setting('app.admin_override', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Existing logic
  IF OLD.is_onboarded = true AND NOT public.is_admin() THEN
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
\$\$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth, pg_temp;
