const fs = require('fs');
let file = 'app/actions/student.ts';
let content = fs.readFileSync(file, 'utf8');

// 1. Fetch batch_photo
const batchPhotoQuery = 
    const { data: photoRow } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "batch_photo")
      .maybeSingle();
    const batchPhoto = photoRow?.value || { url: "/batch-photo.jpg", caption: "MBBS Batch 2024 — AIIMS Patna" };
;

// Find where to insert the query inside getStudentDashboardData
// I will insert it right before returning.
const returnStr = eturn {
    scheduleClasses: scheduleClasses || [],
    units: units || [],
    progressRecords: progressRecords || [],
    stats: rawStats || {
      active_students_30d: 0,
      batch_average_attendance_pct: 0,
      subject_averages: [],
    };
const insertQueryIdx = content.indexOf(returnStr);
if (insertQueryIdx > -1) {
  content = content.substring(0, insertQueryIdx) + batchPhotoQuery + '\n  ' + returnStr + ',\n    batchPhoto\n  ' + content.substring(insertQueryIdx + returnStr.length);
  fs.writeFileSync(file, content);
  console.log('Appended batchPhoto to getStudentDashboardData');
} else {
  console.log('Could not find return statement in getStudentDashboardData');
}
