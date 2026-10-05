-- supabase/migrations/20261005000001_admin_override_trigger.sql
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Ensure only service_role and postgres can execute this
REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO postgres;

-- Add the admin_override bypass to the trigger as requested
CREATE OR REPLACE FUNCTION public.check_historical_attendance_lock()
RETURNS TRIGGER AS $$
BEGIN
  -- Service role bypass (no auth.uid but has admin_override flag)
  IF current_setting('app.admin_override', true) = 'true' THEN
    RETURN NEW;
  END IF;
  
  IF OLD.is_one_time_set = TRUE AND NEW.is_one_time_set = TRUE AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Historical attendance is locked as a one-time entry and can only be modified by an administrator.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
