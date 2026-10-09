import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const csvContent = fs.readFileSync('scripts/AETCOM_Attendance_2nd_Prof_2024.csv', 'utf8');
const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0).slice(1); // skip header

const skippedHardcoded = ['23121', '22124'];

const officialData = lines.map(line => {
  const parts = line.split(',');
  return {
    roll_no: parts[1].trim(),
    held: parseInt(parts[3], 10),
    attended: parseInt(parts[4], 10)
  };
}).filter(r => !skippedHardcoded.includes(r.roll_no));

async function run() {
  console.log('1. Inserting AETCOM records into historical_records_only...');
  
  const recordsToInsert = officialData.map(row => ({
    roll_number: row.roll_no,
    subject_code: 'AETCOM',
    theory_attended: row.attended,
    theory_total: row.held,
    practical_attended: null,
    practical_total: null,
    notes: 'Records only — 2nd year AETCOM complete, not counted in Path-to-76%.'
  }));

  const { error: errIns } = await supabase.from('historical_records_only').upsert(recordsToInsert, { onConflict: 'roll_number,subject_code' });
  if (errIns) {
    if (errIns.code === '42P01') {
       console.log("Table 'historical_records_only' does not exist! Please create it first.");
       return;
    }
    throw errIns;
  }
  
  console.log('Inserted/Updated ' + recordsToInsert.length + ' official AETCOM baseline rows in historical_records_only');

  console.log('2. Verifying in DB...');
  const { data: verified, error: errVer } = await supabase.from('historical_records_only').select('theory_attended').eq('subject_code', 'AETCOM');
  if (errVer) throw errVer;
  
  if (verified.length > 0) {
    const minT = Math.min(...verified.map(v => v.theory_attended));
    const maxT = Math.max(...verified.map(v => v.theory_attended));
    
    console.log('Verification Output:');
    console.log('Students: ' + verified.length);
    console.log('Theory: min ' + minT + ', max ' + maxT);
  } else {
    console.log('Verification Output: 0 rows found in DB for AETCOM.');
  }
}

run().catch(console.error);
