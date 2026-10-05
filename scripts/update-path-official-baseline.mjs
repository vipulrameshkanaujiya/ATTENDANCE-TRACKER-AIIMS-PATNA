import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const csvData = [
  "24045,148,111,37,29",
  "24046,148,127,37,33",
  "24047,148,96,37,30",
  "24048,148,118,37,30",
  "24049,148,115,37,30",
  "24050,146,114,35,29",
  "24051,146,123,35,31",
  "24052,148,118,37,28",
  "24053,148,117,37,30",
  "24054,146,114,35,29",
  "24055,148,129,37,31",
  "24056,148,118,37,30",
  "24057,148,127,37,29",
  "24058,146,126,35,32",
  "24059,148,105,37,23",
  "24060,148,119,37,31",
  "24061,148,114,37,31",
  "24062,148,116,37,30",
  "24063,148,114,37,30",
  "24064,146,122,35,32",
  "24065,148,128,37,31",
  "24066,148,125,37,31",
  "24067,148,114,37,28",
  "24068,148,126,37,32",
  "24069,146,116,35,30",
  "24070,148,125,37,32",
  "24071,148,111,37,30",
  "24072,146,114,35,30",
  "24073,148,129,37,31",
  "24074,148,129,37,35",
  "24075,146,123,35,30",
  "24076,148,125,37,30",
  "24077,148,128,37,32",
  "24078,146,121,35,29",
  "24079,148,126,37,32",
  "24080,148,113,37,31",
  "24081,148,125,35,31",
  "24082,148,129,35,31",
  "24083,148,116,35,26",
  "24084,148,124,35,32",
  "24085,148,117,35,29",
  "24086,148,120,35,32",
  "24087,148,118,35,31",
  "24088,148,117,35,33",
  "24089,146,123,33,30",
  "24090,146,120,33,29",
  "24091,146,123,33,30",
  "24092,148,122,35,30",
  "24093,146,116,33,29",
  "24094,148,123,35,28",
  "24095,148,117,35,33",
  "24096,148,126,35,30",
  "24097,148,117,35,31",
  "24098,148,125,35,31",
  "24099,148,131,35,33",
  "24100,148,120,35,30",
  "24101,148,128,35,33",
  "24102,148,126,35,30",
  "24103,148,117,35,28",
  "24104,148,129,35,33",
  "24105,146,122,33,30",
  "24106,148,122,35,28",
  "24107,148,136,35,33",
  "24108,148,113,35,25",
  "24109,148,129,35,32",
  "24110,148,111,35,31",
  "24111,148,116,35,32",
  "24112,148,121,35,31",
  "24113,148,123,35,32",
  "24114,148,130,35,30",
  "24115,148,106,35,26",
  "24116,148,113,35,28",
  "24117,148,107,35,29",
  "24118,146,128,33,31",
  "24119,148,125,35,30",
  "24120,146,124,33,27",
  "24121,148,124,35,28",
  "24122,148,133,35,33",
  "24123,146,123,33,31",
  "24124,148,131,35,31",
  "24125,148,120,35,30",
  "23103,148,112,35,29",
  "21114,148,128,35,31",
  "22064,148,129,35,33",
  "23033,148,68,35,30",
  "23065,148,138,35,34",
  "24001,148,123,38,34",
  "24002,148,129,38,34",
  "24003,148,120,38,32",
  "24004,148,131,38,34",
  "24005,148,131,38,31",
  "24007,148,127,38,34",
  "24008,146,123,36,30",
  "24009,148,126,38,32",
  "24010,148,132,38,35",
  "24011,148,123,38,31",
  "24012,146,119,36,31",
  "24013,148,124,38,32",
  "24014,146,129,36,33",
  "24015,146,123,36,30",
  "24016,146,122,36,31",
  "24017,148,132,38,31",
  "24018,148,137,38,35",
  "24019,148,122,38,32",
  "24020,148,115,38,30",
  "24021,148,117,38,33",
  "24022,148,130,38,33",
  "24023,148,122,38,34",
  "24024,148,120,38,30",
  "24025,148,119,38,33",
  "24026,146,128,36,32",
  "24027,146,130,36,33",
  "24028,148,136,38,34",
  "24029,148,112,38,31",
  "24030,148,125,38,33",
  "24031,148,118,38,29",
  "24032,148,110,38,30",
  "24033,148,128,38,30",
  "24034,148,116,38,31",
  "24035,148,135,38,36",
  "24036,148,124,38,35",
  "24037,148,126,38,36",
  "24038,146,128,36,32",
  "24039,148,128,38,35",
  "24040,148,124,38,34",
  "24041,148,116,37,31",
  "24042,148,130,37,34",
  "24043,148,126,37,32"
];

const officialData = csvData.map(line => {
  const [roll_no, theory_held, theory_attended, practical_held, practical_attended] = line.split(',');
  return {
    roll_no: roll_no.trim(),
    theory_held: parseInt(theory_held, 10),
    theory_attended: parseInt(theory_attended, 10),
    practical_held: parseInt(practical_held, 10),
    practical_attended: parseInt(practical_attended, 10)
  };
}).filter(r => r.roll_no !== '24006'); // Exclude 24006 if present

async function run() {
  console.log('1. Backing up existing PATH to path_backup_20261005.json...');
  const { data: existing, error: errBackup } = await supabase.from('student_historical_attendance').select('*').eq('subject_code', 'PATH');
  if (errBackup) throw errBackup;
  fs.writeFileSync('path_backup_20261005.json', JSON.stringify(existing, null, 2));
  console.log('Backed up ' + existing.length + ' rows to path_backup_20261005.json');

  console.log('2. Deleting existing PATH rows (bypassing UPDATE trigger)...');
  const { error: errDel } = await supabase.from('student_historical_attendance').delete().eq('subject_code', 'PATH');
  if (errDel) throw errDel;
  console.log('Deleted ' + existing.length + ' existing PATH rows.');

  console.log('3. Fetching user IDs...');
  const { data: users, error: errUsers } = await supabase.from('users').select('id, roll_number');
  if (errUsers) throw errUsers;
  const userMap = new Map(users.map(u => [u.roll_number, u.id]));

  console.log('4. Inserting official PATH baseline...');
  let skipped = [];
  const recordsToInsert = officialData.map(row => {
    const userId = userMap.get(row.roll_no);
    if (!userId) {
      skipped.push(row.roll_no);
      return null;
    }
    return {
      student_id: userId,
      subject_code: 'PATH',
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
  console.log('Inserted ' + recordsToInsert.length + ' official PATH baseline rows');
  if (skipped.length > 0) {
    console.log('Skipped rolls (not onboarded): ' + skipped.join(', ') + ' (' + skipped.length + ' total)');
  }

  console.log('5. Verifying in DB...');
  const { data: verified, error: errVer } = await supabase.from('student_historical_attendance').select('theory_attended, practical_attended').eq('subject_code', 'PATH');
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
