CREATE OR REPLACE FUNCTION public.is_user_blocked(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN AS $body
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.access_control
    WHERE is_blocked = TRUE
      AND (
        user_id = p_user_id
        OR (email IS NOT NULL AND lower(email) = lower(p_email))
      )
  );
END;
$body LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, auth, pg_temp;

GRANT EXECUTE ON FUNCTION public.is_user_blocked(UUID, TEXT) TO authenticated;
