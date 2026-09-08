-- ====================================================================
-- MEDICAL STUDENT HUB - PHASE 3: AGGREGATE STATS RPC FUNCTION
-- Description: Anonymous batch-wide statistics without exposing private data
-- ====================================================================

CREATE OR REPLACE FUNCTION public.get_batch_aggregate_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'active_students_30d', (
            SELECT COUNT(DISTINCT student_id) 
            FROM public.attendance 
            WHERE marked_at > NOW() - INTERVAL '30 days'
        ),
        'batch_average_attendance_pct', (
            SELECT COALESCE(ROUND(
                (COUNT(CASE WHEN status = 'PRESENT' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1
            ), 0)
            FROM public.attendance
        ),
        'subject_averages', (
            SELECT COALESCE(json_agg(s_avg), '[]'::json) FROM (
                SELECT 
                    s.name as subject_name,
                    s.code as subject_code,
                    s.color_code,
                    COALESCE(ROUND((COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 1), 0) as avg_pct
                FROM public.subjects s
                JOIN public.classes c ON c.subject_id = s.id
                JOIN public.attendance a ON a.class_id = c.id
                GROUP BY s.id, s.name, s.code, s.color_code
                ORDER BY s.display_order ASC
            ) s_avg
        )
    ) INTO result;
    RETURN result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_batch_aggregate_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_batch_aggregate_stats() TO authenticated;
