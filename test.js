const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { data: allAttendance, error } = await supabase
      .from('attendance')
      .select('student_id, status, class_id, class:classes(id, date, class_type, subject_id, subject:subjects(id, code, name, color_code))')
      .limit(1);
  console.dir(error || allAttendance, { depth: null });
})();
