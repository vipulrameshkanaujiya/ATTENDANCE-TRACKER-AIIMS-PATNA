const fs = require('fs');
const filepath = 'scripts/load-obg-baseline.mjs';
let code = fs.readFileSync(filepath, 'utf8');

code = code.replace(/  const \{ error: errIns \} = await supabase\.from\('student_historical_attendance'\)\.insert\(recordsToInsert\);\r?\n  if \(errIns\) throw errIns;/,
`  const { error: errIns } = await supabase.from('student_historical_attendance').insert(recordsToInsert);
  if (errIns) {
    if (errIns.message.includes('student_historical_attendance_subject_code_check')) {
      console.log('ERROR: Database constraint violation. OBG is not yet allowed in student_historical_attendance.');
      console.log('Please run the migration supabase/migrations/20261009000000_add_obg_constraint.sql in your Supabase SQL Editor.');
      return;
    }
    throw errIns;
  }`);

fs.writeFileSync(filepath, code);
