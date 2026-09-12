import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoster() {
  const { data, error } = await supabase
    .from('student_roster')
    .select('roll_number, status, claimed_by_user_id')
    .in('roll_number', ['24052', '24644', '24053']);

  console.log(data, error);
}

checkRoster();
