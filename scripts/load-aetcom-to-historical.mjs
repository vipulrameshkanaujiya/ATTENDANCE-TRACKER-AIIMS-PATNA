import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('1. Fetching AETCOM records from historical_records_only...');
  const { data: records, error: errRecords } = await supabase
    .from('historical_records_only')
    .select('*')
    .eq('subject_code', 'AETCOM');
  if (errRecords) throw errRecords;
  console.log(`Fetched ${records.length} AETCOM records.`);

  console.log('2. Fetching users map...');
  const { data: users, error: errUsers } = await supabase.from('users').select('id, roll_number');
  if (errUsers) throw errUsers;
  const userMap = new Map(users.map(u => [u.roll_number, u.id]));

  console.log('3. Fetching existing AETCOM baselines to skip them...');
  const { data: existingBaselines, error: errExist } = await supabase
    .from('student_historical_attendance')
    .select('student_id')
    .eq('subject_code', 'AETCOM');
  if (errExist) {
    if (errExist.message && errExist.message.includes('student_historical_attendance_subject_code_check')) {
       // Ignore here, will throw on insert
    } else {
       throw errExist;
    }
  }
  const existingSet = new Set((existingBaselines || []).map(b => b.student_id));

  const recordsToInsert = [];
  const pendingRecords = [];
  const skipped = [];

  for (const row of records) {
    const userId = userMap.get(row.roll_number);
    if (!userId) {
      skipped.push(row.roll_number);
      pendingRecords.push({
        roll_number: row.roll_number,
        subject_code: 'AETCOM',
        theory_attended: row.theory_attended,
        theory_total: row.theory_total,
        practical_attended: 0,
        practical_total: 0
      });
    } else {
      if (existingSet.has(userId)) continue;
      recordsToInsert.push({
        student_id: userId,
        subject_code: 'AETCOM',
        theory_attended: row.theory_attended,
        theory_total: row.theory_total,
        practical_attended: 0,
        practical_total: 0,
        is_one_time_set: true,
        source: 'BULK_CSV',
        verified_by_user: true
      });
    }
  }

  console.log('4. Inserting into student_historical_attendance...');
  if (recordsToInsert.length > 0) {
    const { error: errIns } = await supabase.from('student_historical_attendance').insert(recordsToInsert);
    if (errIns) {
      if (errIns.message.includes('student_historical_attendance_subject_code_check')) {
        console.log('ERROR: Database constraint violation. AETCOM is not yet allowed in student_historical_attendance.');
        console.log('Please run the migration supabase/migrations/20261009000001_add_aetcom_constraint.sql in your Supabase SQL Editor.');
        return;
      }
      throw errIns;
    }
    console.log(`Inserted ${recordsToInsert.length} AETCOM baselines.`);
  } else {
    console.log('No new onboarded records to insert.');
  }

  console.log('5. Inserting pending baselines...');
  if (pendingRecords.length > 0) {
    const { error: errPend } = await supabase.from('pending_baselines').upsert(pendingRecords, { onConflict: 'roll_number,subject_code' });
    if (errPend) throw errPend;
    console.log(`Inserted ${pendingRecords.length} pending baselines for un-onboarded rolls: ${skipped.join(', ')}`);
  } else {
    console.log('No pending baselines to insert.');
  }

  console.log('6. Verifying in DB...');
  const { data: verified, error: errVer } = await supabase
    .from('student_historical_attendance')
    .select('id')
    .eq('subject_code', 'AETCOM');
  if (errVer) {
      if (errVer.message.includes('student_historical_attendance_subject_code_check')) {
        return;
      }
      throw errVer;
  }
  console.log(`Verification Output: ${verified.length} rows found in DB for AETCOM.`);
}

run().catch(console.error);
