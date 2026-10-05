import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const officialMicroData = [
{roll_no: '24001', theory_held: 107, theory_attended: 95, practical_held: 38, practical_attended: 35},
{roll_no: '24002', theory_held: 107, theory_attended: 97, practical_held: 38, practical_attended: 33},
{roll_no: '24003', theory_held: 107, theory_attended: 87, practical_held: 38, practical_attended: 32},
{roll_no: '24004', theory_held: 107, theory_attended: 93, practical_held: 38, practical_attended: 35},
{roll_no: '24005', theory_held: 107, theory_attended: 88, practical_held: 38, practical_attended: 33},
{roll_no: '24007', theory_held: 107, theory_attended: 95, practical_held: 38, practical_attended: 34},
{roll_no: '24008', theory_held: 106, theory_attended: 85, practical_held: 37, practical_attended: 32},
{roll_no: '24009', theory_held: 107, theory_attended: 90, practical_held: 38, practical_attended: 32},
{roll_no: '24010', theory_held: 107, theory_attended: 93, practical_held: 38, practical_attended: 35},
{roll_no: '24011', theory_held: 107, theory_attended: 91, practical_held: 38, practical_attended: 34},
{roll_no: '24012', theory_held: 106, theory_attended: 87, practical_held: 37, practical_attended: 31},
{roll_no: '24013', theory_held: 107, theory_attended: 88, practical_held: 38, practical_attended: 32},
{roll_no: '24014', theory_held: 106, theory_attended: 90, practical_held: 37, practical_attended: 33},
{roll_no: '24015', theory_held: 106, theory_attended: 89, practical_held: 37, practical_attended: 32},
{roll_no: '24016', theory_held: 106, theory_attended: 91, practical_held: 37, practical_attended: 34},
{roll_no: '24017', theory_held: 107, theory_attended: 98, practical_held: 38, practical_attended: 33},
{roll_no: '24018', theory_held: 107, theory_attended: 100, practical_held: 38, practical_attended: 34},
{roll_no: '24019', theory_held: 107, theory_attended: 87, practical_held: 38, practical_attended: 32},
{roll_no: '24020', theory_held: 107, theory_attended: 81, practical_held: 38, practical_attended: 30},
{roll_no: '24021', theory_held: 107, theory_attended: 90, practical_held: 38, practical_attended: 30},
{roll_no: '24022', theory_held: 107, theory_attended: 96, practical_held: 38, practical_attended: 36},
{roll_no: '24023', theory_held: 107, theory_attended: 82, practical_held: 38, practical_attended: 31},
{roll_no: '24024', theory_held: 104, theory_attended: 84, practical_held: 36, practical_attended: 31},
{roll_no: '24025', theory_held: 107, theory_attended: 89, practical_held: 38, practical_attended: 35},
{roll_no: '24026', theory_held: 106, theory_attended: 93, practical_held: 37, practical_attended: 34},
{roll_no: '24027', theory_held: 106, theory_attended: 95, practical_held: 37, practical_attended: 34},
{roll_no: '24028', theory_held: 107, theory_attended: 94, practical_held: 38, practical_attended: 34},
{roll_no: '24029', theory_held: 107, theory_attended: 80, practical_held: 38, practical_attended: 29},
{roll_no: '24030', theory_held: 107, theory_attended: 89, practical_held: 38, practical_attended: 32},
{roll_no: '24031', theory_held: 107, theory_attended: 80, practical_held: 38, practical_attended: 31},
{roll_no: '24032', theory_held: 107, theory_attended: 83, practical_held: 38, practical_attended: 30},
{roll_no: '24033', theory_held: 107, theory_attended: 84, practical_held: 38, practical_attended: 32},
{roll_no: '24034', theory_held: 107, theory_attended: 84, practical_held: 38, practical_attended: 32},
{roll_no: '24035', theory_held: 107, theory_attended: 90, practical_held: 38, practical_attended: 36},
{roll_no: '24036', theory_held: 107, theory_attended: 91, practical_held: 38, practical_attended: 34},
{roll_no: '24037', theory_held: 107, theory_attended: 95, practical_held: 38, practical_attended: 34},
{roll_no: '24038', theory_held: 106, theory_attended: 91, practical_held: 37, practical_attended: 33},
{roll_no: '24039', theory_held: 107, theory_attended: 88, practical_held: 38, practical_attended: 36},
{roll_no: '24040', theory_held: 107, theory_attended: 91, practical_held: 38, practical_attended: 33},
{roll_no: '24041', theory_held: 107, theory_attended: 84, practical_held: 36, practical_attended: 31},
{roll_no: '24042', theory_held: 107, theory_attended: 92, practical_held: 36, practical_attended: 34},
{roll_no: '24043', theory_held: 107, theory_attended: 100, practical_held: 36, practical_attended: 34},
{roll_no: '24045', theory_held: 107, theory_attended: 91, practical_held: 36, practical_attended: 30},
{roll_no: '24046', theory_held: 107, theory_attended: 95, practical_held: 36, practical_attended: 33},
{roll_no: '24047', theory_held: 107, theory_attended: 78, practical_held: 36, practical_attended: 26},
{roll_no: '24048', theory_held: 107, theory_attended: 74, practical_held: 36, practical_attended: 30},
{roll_no: '24049', theory_held: 107, theory_attended: 79, practical_held: 36, practical_attended: 34},
{roll_no: '24050', theory_held: 106, theory_attended: 78, practical_held: 35, practical_attended: 31},
{roll_no: '24051', theory_held: 106, theory_attended: 92, practical_held: 35, practical_attended: 31},
{roll_no: '24052', theory_held: 107, theory_attended: 91, practical_held: 36, practical_attended: 31},
{roll_no: '24053', theory_held: 107, theory_attended: 84, practical_held: 36, practical_attended: 30},
{roll_no: '24054', theory_held: 106, theory_attended: 87, practical_held: 35, practical_attended: 31},
{roll_no: '24055', theory_held: 107, theory_attended: 95, practical_held: 36, practical_attended: 33},
{roll_no: '24056', theory_held: 107, theory_attended: 83, practical_held: 36, practical_attended: 32},
{roll_no: '24057', theory_held: 107, theory_attended: 93, practical_held: 36, practical_attended: 31},
{roll_no: '24058', theory_held: 106, theory_attended: 93, practical_held: 35, practical_attended: 35},
{roll_no: '24059', theory_held: 107, theory_attended: 64, practical_held: 36, practical_attended: 19},
{roll_no: '24060', theory_held: 107, theory_attended: 86, practical_held: 36, practical_attended: 31},
{roll_no: '24061', theory_held: 107, theory_attended: 85, practical_held: 36, practical_attended: 31},
{roll_no: '24062', theory_held: 107, theory_attended: 84, practical_held: 36, practical_attended: 32},
{roll_no: '24063', theory_held: 107, theory_attended: 85, practical_held: 36, practical_attended: 29},
{roll_no: '24064', theory_held: 106, theory_attended: 90, practical_held: 35, practical_attended: 33},
{roll_no: '24065', theory_held: 107, theory_attended: 92, practical_held: 36, practical_attended: 32},
{roll_no: '24066', theory_held: 107, theory_attended: 90, practical_held: 36, practical_attended: 32},
{roll_no: '24067', theory_held: 107, theory_attended: 87, practical_held: 36, practical_attended: 33},
{roll_no: '24068', theory_held: 107, theory_attended: 92, practical_held: 36, practical_attended: 31},
{roll_no: '24069', theory_held: 106, theory_attended: 85, practical_held: 35, practical_attended: 27},
{roll_no: '24070', theory_held: 107, theory_attended: 86, practical_held: 36, practical_attended: 33},
{roll_no: '24071', theory_held: 107, theory_attended: 86, practical_held: 36, practical_attended: 30},
{roll_no: '24072', theory_held: 106, theory_attended: 85, practical_held: 35, practical_attended: 31},
{roll_no: '24073', theory_held: 107, theory_attended: 93, practical_held: 36, practical_attended: 35},
{roll_no: '24074', theory_held: 107, theory_attended: 95, practical_held: 36, practical_attended: 35},
{roll_no: '24075', theory_held: 106, theory_attended: 91, practical_held: 35, practical_attended: 32},
{roll_no: '24076', theory_held: 107, theory_attended: 86, practical_held: 36, practical_attended: 30},
{roll_no: '24077', theory_held: 107, theory_attended: 96, practical_held: 36, practical_attended: 32},
{roll_no: '24078', theory_held: 106, theory_attended: 83, practical_held: 35, practical_attended: 29},
{roll_no: '24079', theory_held: 107, theory_attended: 87, practical_held: 36, practical_attended: 32},
{roll_no: '24080', theory_held: 107, theory_attended: 87, practical_held: 36, practical_attended: 32},
{roll_no: '24081', theory_held: 107, theory_attended: 93, practical_held: 39, practical_attended: 34},
{roll_no: '24082', theory_held: 107, theory_attended: 93, practical_held: 39, practical_attended: 34},
{roll_no: '24083', theory_held: 107, theory_attended: 78, practical_held: 39, practical_attended: 29},
{roll_no: '24084', theory_held: 107, theory_attended: 92, practical_held: 39, practical_attended: 32},
{roll_no: '24085', theory_held: 107, theory_attended: 85, practical_held: 39, practical_attended: 32},
{roll_no: '24086', theory_held: 107, theory_attended: 89, practical_held: 39, practical_attended: 34},
{roll_no: '24087', theory_held: 107, theory_attended: 84, practical_held: 39, practical_attended: 32},
{roll_no: '24088', theory_held: 107, theory_attended: 97, practical_held: 39, practical_attended: 36},
{roll_no: '24089', theory_held: 106, theory_attended: 94, practical_held: 38, practical_attended: 34},
{roll_no: '24090', theory_held: 106, theory_attended: 84, practical_held: 38, practical_attended: 32},
{roll_no: '24091', theory_held: 106, theory_attended: 94, practical_held: 38, practical_attended: 31},
{roll_no: '24092', theory_held: 107, theory_attended: 93, practical_held: 39, practical_attended: 33},
{roll_no: '24093', theory_held: 106, theory_attended: 87, practical_held: 38, practical_attended: 34},
{roll_no: '24094', theory_held: 107, theory_attended: 91, practical_held: 39, practical_attended: 33},
{roll_no: '24095', theory_held: 107, theory_attended: 84, practical_held: 39, practical_attended: 36},
{roll_no: '24096', theory_held: 107, theory_attended: 93, practical_held: 39, practical_attended: 36},
{roll_no: '24097', theory_held: 107, theory_attended: 87, practical_held: 39, practical_attended: 32},
{roll_no: '24098', theory_held: 107, theory_attended: 91, practical_held: 39, practical_attended: 33},
{roll_no: '24099', theory_held: 107, theory_attended: 97, practical_held: 39, practical_attended: 36},
{roll_no: '24100', theory_held: 107, theory_attended: 82, practical_held: 39, practical_attended: 32},
{roll_no: '24101', theory_held: 107, theory_attended: 95, practical_held: 39, practical_attended: 38},
{roll_no: '24102', theory_held: 107, theory_attended: 90, practical_held: 39, practical_attended: 34},
{roll_no: '24103', theory_held: 107, theory_attended: 79, practical_held: 39, practical_attended: 31},
{roll_no: '24104', theory_held: 107, theory_attended: 96, practical_held: 39, practical_attended: 38},
{roll_no: '24105', theory_held: 106, theory_attended: 93, practical_held: 38, practical_attended: 33},
{roll_no: '24106', theory_held: 107, theory_attended: 86, practical_held: 39, practical_attended: 33},
{roll_no: '24107', theory_held: 107, theory_attended: 95, practical_held: 39, practical_attended: 32},
{roll_no: '24108', theory_held: 107, theory_attended: 92, practical_held: 39, practical_attended: 30},
{roll_no: '24109', theory_held: 107, theory_attended: 96, practical_held: 39, practical_attended: 36},
{roll_no: '24110', theory_held: 107, theory_attended: 80, practical_held: 39, practical_attended: 33},
{roll_no: '24111', theory_held: 107, theory_attended: 85, practical_held: 39, practical_attended: 31},
{roll_no: '24112', theory_held: 107, theory_attended: 89, practical_held: 39, practical_attended: 34},
{roll_no: '24113', theory_held: 107, theory_attended: 95, practical_held: 39, practical_attended: 33},
{roll_no: '24114', theory_held: 107, theory_attended: 84, practical_held: 39, practical_attended: 30},
{roll_no: '24115', theory_held: 107, theory_attended: 78, practical_held: 39, practical_attended: 30},
{roll_no: '24116', theory_held: 107, theory_attended: 89, practical_held: 39, practical_attended: 35},
{roll_no: '24117', theory_held: 107, theory_attended: 79, practical_held: 39, practical_attended: 35},
{roll_no: '24118', theory_held: 106, theory_attended: 89, practical_held: 38, practical_attended: 33},
{roll_no: '24119', theory_held: 107, theory_attended: 89, practical_held: 39, practical_attended: 37},
{roll_no: '24120', theory_held: 106, theory_attended: 89, practical_held: 38, practical_attended: 33},
{roll_no: '24121', theory_held: 107, theory_attended: 92, practical_held: 39, practical_attended: 32},
{roll_no: '24122', theory_held: 107, theory_attended: 98, practical_held: 39, practical_attended: 39},
{roll_no: '24123', theory_held: 106, theory_attended: 87, practical_held: 38, practical_attended: 31},
{roll_no: '24124', theory_held: 107, theory_attended: 90, practical_held: 39, practical_attended: 34},
{roll_no: '24125', theory_held: 107, theory_attended: 86, practical_held: 39, practical_attended: 34},
{roll_no: '23103', theory_held: 107, theory_attended: 81, practical_held: 39, practical_attended: 31},
{roll_no: '21114', theory_held: 107, theory_attended: 94, practical_held: 39, practical_attended: 36},
{roll_no: '22064', theory_held: 107, theory_attended: 91, practical_held: 39, practical_attended: 35},
{roll_no: '23033', theory_held: 107, theory_attended: 60, practical_held: 39, practical_attended: 20},
{roll_no: '23065', theory_held: 107, theory_attended: 104, practical_held: 39, practical_attended: 38},
];

async function run() {
  console.log('1. Backing up existing MICRO to micro_backup_20261005.json...');
  const { data: existing, error: errBackup } = await supabase.from('student_historical_attendance').select('*').eq('subject_code', 'MICRO');
  if (errBackup) throw errBackup;
  fs.writeFileSync('micro_backup_20261005.json', JSON.stringify(existing, null, 2));
  console.log('Backed up ' + existing.length + ' rows to micro_backup_20261005.json');

  console.log('2. Deleting existing MICRO rows (bypassing UPDATE trigger)...');
  const { error: errDel } = await supabase.from('student_historical_attendance').delete().eq('subject_code', 'MICRO');
  if (errDel) throw errDel;
  console.log('Deleted ' + existing.length + ' existing MICRO rows.');

  console.log('3. Fetching user IDs...');
  const { data: users, error: errUsers } = await supabase.from('users').select('id, roll_number');
  if (errUsers) throw errUsers;
  const userMap = new Map(users.map(u => [u.roll_number, u.id]));

  console.log('4. Inserting official MICRO baseline...');
  let skipped = [];
  const recordsToInsert = officialMicroData.map(row => {
    const userId = userMap.get(row.roll_no);
    if (!userId) {
      skipped.push(row.roll_no);
      return null;
    }
    return {
      student_id: userId,
      subject_code: 'MICRO',
      theory_attended: row.theory_attended,
      theory_total: row.theory_held,
      practical_attended: row.practical_attended,
      practical_total: row.practical_held,
      is_one_time_set: true,
      source: 'BULK_CSV',
      verified_by_user: true
    };
  }).filter(Boolean);

  const { error: errIns } = await supabase.from('student_historical_attendance').insert(recordsToInsert);
  if (errIns) throw errIns;
  console.log('Inserted ' + recordsToInsert.length + ' official MICRO baseline rows');
  if (skipped.length > 0) {
    console.log('Skipped rolls (not onboarded): ' + skipped.join(', ') + ' (' + skipped.length + ' total)');
  }

  console.log('5. Verifying in DB...');
  const { data: verified, error: errVer } = await supabase.from('student_historical_attendance').select('theory_attended, practical_attended').eq('subject_code', 'MICRO');
  if (errVer) throw errVer;
  
  const minT = Math.min(...verified.map(v => v.theory_attended));
  const maxT = Math.max(...verified.map(v => v.theory_attended));
  const minP = Math.min(...verified.map(v => v.practical_attended));
  const maxP = Math.max(...verified.map(v => v.practical_attended));
  
  console.log('Verification Output:');
  console.log('Students: ' + verified.length);
  console.log('Theory: min ' + minT + ', max ' + maxT);
  console.log('Practical: min ' + minP + ', max ' + maxP);
}

run().catch(console.error);
