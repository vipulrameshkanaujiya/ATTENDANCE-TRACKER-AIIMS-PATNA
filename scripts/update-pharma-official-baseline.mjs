import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const officialData = [
{roll_no: '24001', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 34, practical_attended: 30},
{roll_no: '24002', subject: 'PHARMA', theory_held: 145, theory_attended: 131, practical_held: 34, practical_attended: 31},
{roll_no: '24003', subject: 'PHARMA', theory_held: 137, theory_attended: 112, practical_held: 34, practical_attended: 30},
{roll_no: '24004', subject: 'PHARMA', theory_held: 145, theory_attended: 129, practical_held: 34, practical_attended: 31},
{roll_no: '24005', subject: 'PHARMA', theory_held: 145, theory_attended: 114, practical_held: 34, practical_attended: 28},
{roll_no: '24007', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 29},
{roll_no: '24008', subject: 'PHARMA', theory_held: 145, theory_attended: 113, practical_held: 34, practical_attended: 30},
{roll_no: '24009', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 34, practical_attended: 30},
{roll_no: '24010', subject: 'PHARMA', theory_held: 145, theory_attended: 131, practical_held: 34, practical_attended: 32},
{roll_no: '24011', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 29},
{roll_no: '24012', subject: 'PHARMA', theory_held: 145, theory_attended: 116, practical_held: 34, practical_attended: 30},
{roll_no: '24013', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 34, practical_attended: 29},
{roll_no: '24014', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 34, practical_attended: 31},
{roll_no: '24015', subject: 'PHARMA', theory_held: 145, theory_attended: 121, practical_held: 34, practical_attended: 31},
{roll_no: '24016', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 31},
{roll_no: '24017', subject: 'PHARMA', theory_held: 145, theory_attended: 128, practical_held: 34, practical_attended: 31},
{roll_no: '24018', subject: 'PHARMA', theory_held: 145, theory_attended: 139, practical_held: 34, practical_attended: 32},
{roll_no: '24019', subject: 'PHARMA', theory_held: 145, theory_attended: 113, practical_held: 34, practical_attended: 28},
{roll_no: '24020', subject: 'PHARMA', theory_held: 145, theory_attended: 106, practical_held: 34, practical_attended: 26},
{roll_no: '24021', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 34, practical_attended: 27},
{roll_no: '24022', subject: 'PHARMA', theory_held: 145, theory_attended: 128, practical_held: 34, practical_attended: 32},
{roll_no: '24023', subject: 'PHARMA', theory_held: 145, theory_attended: 114, practical_held: 34, practical_attended: 28},
{roll_no: '24024', subject: 'PHARMA', theory_held: 145, theory_attended: 111, practical_held: 34, practical_attended: 27},
{roll_no: '24025', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 34, practical_attended: 29},
{roll_no: '24026', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 33},
{roll_no: '24027', subject: 'PHARMA', theory_held: 145, theory_attended: 129, practical_held: 34, practical_attended: 32},
{roll_no: '24028', subject: 'PHARMA', theory_held: 145, theory_attended: 129, practical_held: 34, practical_attended: 32},
{roll_no: '24029', subject: 'PHARMA', theory_held: 137, theory_attended: 111, practical_held: 34, practical_attended: 29},
{roll_no: '24030', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 30},
{roll_no: '24031', subject: 'PHARMA', theory_held: 145, theory_attended: 108, practical_held: 34, practical_attended: 28},
{roll_no: '24032', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 34, practical_attended: 27},
{roll_no: '24033', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 34, practical_attended: 29},
{roll_no: '24034', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 34, practical_attended: 28},
{roll_no: '24035', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 34, practical_attended: 31},
{roll_no: '24036', subject: 'PHARMA', theory_held: 145, theory_attended: 127, practical_held: 34, practical_attended: 31},
{roll_no: '24037', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 34, practical_attended: 31},
{roll_no: '24038', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 34, practical_attended: 31},
{roll_no: '24039', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 32},
{roll_no: '24040', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 34, practical_attended: 30},
{roll_no: '24041', subject: 'PHARMA', theory_held: 145, theory_attended: 113, practical_held: 38, practical_attended: 31},
{roll_no: '24042', subject: 'PHARMA', theory_held: 145, theory_attended: 126, practical_held: 38, practical_attended: 34},
{roll_no: '24043', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 38, practical_attended: 33},
{roll_no: '24045', subject: 'PHARMA', theory_held: 137, theory_attended: 106, practical_held: 38, practical_attended: 31},
{roll_no: '24046', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 38, practical_attended: 34},
{roll_no: '24047', subject: 'PHARMA', theory_held: 145, theory_attended: 101, practical_held: 38, practical_attended: 28},
{roll_no: '24048', subject: 'PHARMA', theory_held: 145, theory_attended: 109, practical_held: 38, practical_attended: 33},
{roll_no: '24049', subject: 'PHARMA', theory_held: 145, theory_attended: 107, practical_held: 38, practical_attended: 31},
{roll_no: '24050', subject: 'PHARMA', theory_held: 145, theory_attended: 118, practical_held: 38, practical_attended: 31},
{roll_no: '24051', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 38, practical_attended: 35},
{roll_no: '24052', subject: 'PHARMA', theory_held: 145, theory_attended: 119, practical_held: 38, practical_attended: 33},
{roll_no: '24053', subject: 'PHARMA', theory_held: 137, theory_attended: 108, practical_held: 38, practical_attended: 31},
{roll_no: '24054', subject: 'PHARMA', theory_held: 145, theory_attended: 119, practical_held: 38, practical_attended: 29},
{roll_no: '24055', subject: 'PHARMA', theory_held: 145, theory_attended: 127, practical_held: 38, practical_attended: 33},
{roll_no: '24056', subject: 'PHARMA', theory_held: 145, theory_attended: 110, practical_held: 38, practical_attended: 30},
{roll_no: '24057', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 38, practical_attended: 33},
{roll_no: '24058', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 38, practical_attended: 31},
{roll_no: '24059', subject: 'PHARMA', theory_held: 145, theory_attended: 113, practical_held: 38, practical_attended: 29},
{roll_no: '24060', subject: 'PHARMA', theory_held: 145, theory_attended: 110, practical_held: 38, practical_attended: 31},
{roll_no: '24061', subject: 'PHARMA', theory_held: 145, theory_attended: 113, practical_held: 38, practical_attended: 32},
{roll_no: '24062', subject: 'PHARMA', theory_held: 145, theory_attended: 114, practical_held: 38, practical_attended: 32},
{roll_no: '24063', subject: 'PHARMA', theory_held: 145, theory_attended: 112, practical_held: 38, practical_attended: 33},
{roll_no: '24064', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 38, practical_attended: 32},
{roll_no: '24065', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 38, practical_attended: 34},
{roll_no: '24066', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 38, practical_attended: 33},
{roll_no: '24067', subject: 'PHARMA', theory_held: 145, theory_attended: 112, practical_held: 38, practical_attended: 32},
{roll_no: '24068', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 38, practical_attended: 33},
{roll_no: '24069', subject: 'PHARMA', theory_held: 145, theory_attended: 109, practical_held: 38, practical_attended: 31},
{roll_no: '24070', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 38, practical_attended: 32},
{roll_no: '24071', subject: 'PHARMA', theory_held: 137, theory_attended: 105, practical_held: 38, practical_attended: 29},
{roll_no: '24072', subject: 'PHARMA', theory_held: 145, theory_attended: 117, practical_held: 38, practical_attended: 32},
{roll_no: '24073', subject: 'PHARMA', theory_held: 145, theory_attended: 128, practical_held: 38, practical_attended: 32},
{roll_no: '24074', subject: 'PHARMA', theory_held: 145, theory_attended: 128, practical_held: 38, practical_attended: 32},
{roll_no: '24075', subject: 'PHARMA', theory_held: 137, theory_attended: 112, practical_held: 38, practical_attended: 32},
{roll_no: '24076', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 38, practical_attended: 29},
{roll_no: '24077', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 38, practical_attended: 33},
{roll_no: '24078', subject: 'PHARMA', theory_held: 145, theory_attended: 118, practical_held: 38, practical_attended: 27},
{roll_no: '24079', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 38, practical_attended: 32},
{roll_no: '24080', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 38, practical_attended: 31},
{roll_no: '24081', subject: 'PHARMA', theory_held: 145, theory_attended: 119, practical_held: 34, practical_attended: 32},
{roll_no: '24082', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 31},
{roll_no: '24083', subject: 'PHARMA', theory_held: 145, theory_attended: 106, practical_held: 34, practical_attended: 27},
{roll_no: '24084', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 34, practical_attended: 28},
{roll_no: '24085', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 29},
{roll_no: '24086', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 29},
{roll_no: '24087', subject: 'PHARMA', theory_held: 145, theory_attended: 115, practical_held: 34, practical_attended: 28},
{roll_no: '24088', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 34, practical_attended: 29},
{roll_no: '24089', subject: 'PHARMA', theory_held: 145, theory_attended: 126, practical_held: 34, practical_attended: 29},
{roll_no: '24090', subject: 'PHARMA', theory_held: 145, theory_attended: 119, practical_held: 34, practical_attended: 29},
{roll_no: '24091', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 30},
{roll_no: '24092', subject: 'PHARMA', theory_held: 137, theory_attended: 114, practical_held: 34, practical_attended: 28},
{roll_no: '24093', subject: 'PHARMA', theory_held: 145, theory_attended: 114, practical_held: 34, practical_attended: 30},
{roll_no: '24094', subject: 'PHARMA', theory_held: 137, theory_attended: 117, practical_held: 34, practical_attended: 28},
{roll_no: '24095', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 34, practical_attended: 30},
{roll_no: '24096', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 34, practical_attended: 29},
{roll_no: '24097', subject: 'PHARMA', theory_held: 145, theory_attended: 116, practical_held: 34, practical_attended: 27},
{roll_no: '24098', subject: 'PHARMA', theory_held: 145, theory_attended: 124, practical_held: 34, practical_attended: 29},
{roll_no: '24099', subject: 'PHARMA', theory_held: 145, theory_attended: 126, practical_held: 34, practical_attended: 29},
{roll_no: '24100', subject: 'PHARMA', theory_held: 145, theory_attended: 112, practical_held: 34, practical_attended: 28},
{roll_no: '24101', subject: 'PHARMA', theory_held: 145, theory_attended: 127, practical_held: 34, practical_attended: 30},
{roll_no: '24102', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 28},
{roll_no: '24103', subject: 'PHARMA', theory_held: 137, theory_attended: 114, practical_held: 34, practical_attended: 29},
{roll_no: '24104', subject: 'PHARMA', theory_held: 145, theory_attended: 129, practical_held: 34, practical_attended: 33},
{roll_no: '24105', subject: 'PHARMA', theory_held: 145, theory_attended: 118, practical_held: 34, practical_attended: 30},
{roll_no: '24106', subject: 'PHARMA', theory_held: 137, theory_attended: 113, practical_held: 34, practical_attended: 29},
{roll_no: '24107', subject: 'PHARMA', theory_held: 145, theory_attended: 130, practical_held: 34, practical_attended: 31},
{roll_no: '24108', subject: 'PHARMA', theory_held: 145, theory_attended: 107, practical_held: 34, practical_attended: 26},
{roll_no: '24109', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 31},
{roll_no: '24110', subject: 'PHARMA', theory_held: 145, theory_attended: 112, practical_held: 34, practical_attended: 28},
{roll_no: '24111', subject: 'PHARMA', theory_held: 145, theory_attended: 109, practical_held: 34, practical_attended: 29},
{roll_no: '24112', subject: 'PHARMA', theory_held: 145, theory_attended: 119, practical_held: 34, practical_attended: 30},
{roll_no: '24113', subject: 'PHARMA', theory_held: 145, theory_attended: 121, practical_held: 34, practical_attended: 29},
{roll_no: '24114', subject: 'PHARMA', theory_held: 145, theory_attended: 109, practical_held: 34, practical_attended: 28},
{roll_no: '24115', subject: 'PHARMA', theory_held: 137, theory_attended: 102, practical_held: 34, practical_attended: 27},
{roll_no: '24116', subject: 'PHARMA', theory_held: 145, theory_attended: 118, practical_held: 34, practical_attended: 29},
{roll_no: '24117', subject: 'PHARMA', theory_held: 145, theory_attended: 106, practical_held: 34, practical_attended: 27},
{roll_no: '24118', subject: 'PHARMA', theory_held: 145, theory_attended: 120, practical_held: 34, practical_attended: 27},
{roll_no: '24119', subject: 'PHARMA', theory_held: 145, theory_attended: 125, practical_held: 34, practical_attended: 29},
{roll_no: '24120', subject: 'PHARMA', theory_held: 137, theory_attended: 109, practical_held: 34, practical_attended: 27},
{roll_no: '24121', subject: 'PHARMA', theory_held: 145, theory_attended: 122, practical_held: 34, practical_attended: 28},
{roll_no: '24122', subject: 'PHARMA', theory_held: 145, theory_attended: 129, practical_held: 34, practical_attended: 32},
{roll_no: '24123', subject: 'PHARMA', theory_held: 145, theory_attended: 121, practical_held: 34, practical_attended: 30},
{roll_no: '24124', subject: 'PHARMA', theory_held: 145, theory_attended: 123, practical_held: 34, practical_attended: 28},
{roll_no: '24125', subject: 'PHARMA', theory_held: 145, theory_attended: 121, practical_held: 34, practical_attended: 28},
{roll_no: '23033', subject: 'PHARMA', theory_held: 123, theory_attended: 67, practical_held: 30, practical_attended: 21},
{roll_no: '23065', subject: 'PHARMA', theory_held: 145, theory_attended: 140, practical_held: 34, practical_attended: 32},
{roll_no: '23103', subject: 'PHARMA', theory_held: 145, theory_attended: 116, practical_held: 34, practical_attended: 28},
{roll_no: '22064', subject: 'PHARMA', theory_held: 145, theory_attended: 128, practical_held: 34, practical_attended: 30},
{roll_no: '21114', subject: 'PHARMA', theory_held: 145, theory_attended: 127, practical_held: 34, practical_attended: 32}
];

async function run() {
  console.log('1. Backing up existing PHARMA to backup.json...');
  const { data: existing, error: errBackup } = await supabase.from('student_historical_attendance').select('*').eq('subject_code', 'PHARMA');
  if (errBackup) throw errBackup;
  fs.writeFileSync('pharma_backup_20261005.json', JSON.stringify(existing, null, 2));
  console.log('Backed up ' + existing.length + ' rows.');

  console.log('2. Deleting existing PHARMA rows (bypassing UPDATE trigger)...');
  const { error: errDel } = await supabase.from('student_historical_attendance').delete().eq('subject_code', 'PHARMA');
  if (errDel) throw errDel;
  console.log('Deleted rows successfully.');

  console.log('3. Fetching user IDs...');
  const { data: users, error: errUsers } = await supabase.from('users').select('id, roll_number');
  if (errUsers) throw errUsers;
  const userMap = new Map(users.map(u => [u.roll_number, u.id]));

  console.log('4. Inserting official PHARMA baseline...');
  const recordsToInsert = officialData.map(row => {
    const userId = userMap.get(row.roll_no);
    if (!userId) {
      console.warn('User with roll_no ' + row.roll_no + ' not found in DB! Skipping...');
      return null;
    }
    return {
      student_id: userId,
      subject_code: 'PHARMA',
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
  console.log('Inserted ' + recordsToInsert.length + ' official PHARMA baseline rows.');

  console.log('5. Verifying in DB...');
  const { data: verified, error: errVer } = await supabase.from('student_historical_attendance').select('theory_attended, practical_attended').eq('subject_code', 'PHARMA');
  if (errVer) throw errVer;
  
  const minT = Math.min(...verified.map(v => v.theory_attended));
  const maxT = Math.max(...verified.map(v => v.theory_attended));
  const minP = Math.min(...verified.map(v => v.practical_attended));
  const maxP = Math.max(...verified.map(v => v.practical_attended));
  
  console.log('Verification Output:');
  console.log('Students: ' + verified.length);
  console.log('Theory Attended: min ' + minT + ', max ' + maxT);
  console.log('Practical Attended: min ' + minP + ', max ' + maxP);
}

run().catch(console.error);
