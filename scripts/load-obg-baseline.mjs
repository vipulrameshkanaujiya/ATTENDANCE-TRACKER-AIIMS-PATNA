import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const csvContent = fs.readFileSync('scripts/OBG_Attendance_2nd_Prof_2024.csv', 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0).slice(1); // skip header

const skippedHardcoded = ['23048', '22070', '22079'];

const officialData = lines.map(line => {
  const parts = line.split(',');
  return {
    roll_no: parts[1].trim(),
    theory_held: parseInt(parts[3], 10),
    theory_attended: parseInt(parts[4], 10),
    practical_held: parseInt(parts[5], 10),
    practical_attended: parseInt(parts[6], 10)
  };
}).filter(r => !skippedHardcoded.includes(r.roll_no));

async function run() {
  console.log('1. Backing up existing OBG to obg_backup_20261009.json...');
  const { data: existing, error: errBackup } = await supabase.from('student_historical_attendance').select('*').eq('subject_code', 'OBG');
  if (errBackup) throw errBackup;
  fs.writeFileSync('obg_backup_20261009.json', JSON.stringify(existing, null, 2));
  console.log('Backed up ' + existing.length + ' rows to obg_backup_20261009.json');

  console.log('2. Deleting existing OBG rows (bypassing UPDATE trigger)...');
  const { error: errDel } = await supabase.from('student_historical_attendance').delete().eq('subject_code', 'OBG');
  if (errDel) throw errDel;
  console.log('Deleted ' + existing.length + ' existing OBG rows.');

  console.log('3. Fetching user IDs...');
  const { data: users, error: errUsers } = await supabase.from('users').select('id, roll_number');
  if (errUsers) throw errUsers;
  const userMap = new Map(users.map(u => [u.roll_number, u.id]));

  console.log('4. Inserting official OBG baseline...');
  let skipped = [];
  const recordsToInsert = [];
  const pendingRecords = [];

  for (const row of officialData) {
    const userId = userMap.get(row.roll_no);
    if (!userId) {
      skipped.push(row.roll_no);
      pendingRecords.push({
        roll_number: row.roll_no,
        subject_code: 'OBG',
        theory_attended: row.theory_attended,
        theory_total: row.theory_held,
        practical_attended: row.practical_attended,
        practical_total: row.practical_held
      });
    } else {
      recordsToInsert.push({
        student_id: userId,
        subject_code: 'OBG',
        theory_attended: row.theory_attended,
        theory_total: row.theory_held,
        practical_attended: row.practical_attended,
        practical_total: row.practical_held,
        is_one_time_set: true,
        source: 'BULK_CSV',
        verified_by_user: true
      });
    }
  }

  const { error: errIns } = await supabase.from('student_historical_attendance').insert(recordsToInsert);
  if (errIns) {
    if (errIns.message.includes('student_historical_attendance_subject_code_check')) {
      console.log('ERROR: Database constraint violation. OBG is not yet allowed in student_historical_attendance.');
      console.log('Please run the migration supabase/migrations/20261009000000_add_obg_constraint.sql in your Supabase SQL Editor.');
      return;
    }
    throw errIns;
  }
  console.log('Inserted ' + recordsToInsert.length + ' official OBG baseline rows');

  if (pendingRecords.length > 0) {
    const { error: errPend } = await supabase.from('pending_baselines').upsert(pendingRecords, { onConflict: 'roll_number,subject_code' });
    if (errPend) throw errPend;
    console.log('Inserted ' + pendingRecords.length + ' pending baselines for un-onboarded rolls: ' + skipped.join(', '));
  } else {
    console.log('No pending baselines to insert.');
  }

  console.log('5. Verifying in DB...');
  const { data: verified, error: errVer } = await supabase.from('student_historical_attendance').select('theory_attended, practical_attended').eq('subject_code', 'OBG');
  if (errVer) throw errVer;
  
  if (verified.length > 0) {
    const minT = Math.min(...verified.map(v => v.theory_attended));
    const maxT = Math.max(...verified.map(v => v.theory_attended));
    const minP = Math.min(...verified.map(v => v.practical_attended));
    const maxP = Math.max(...verified.map(v => v.practical_attended));
    
    console.log('Verification Output:');
    console.log('Students: ' + verified.length);
    console.log('Theory: min ' + minT + ', max ' + maxT);
    console.log('Practical: min ' + minP + ', max ' + maxP);
  } else {
    console.log('Verification Output: 0 rows found in DB for OBG.');
  }
}

run().catch(console.error);
