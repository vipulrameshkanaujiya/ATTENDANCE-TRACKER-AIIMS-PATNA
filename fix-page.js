const fs = require('fs');
const filepath = 'app/(student)/attendance/page.tsx';
let code = fs.readFileSync(filepath, 'utf8');

// Update import to include PATH_TO_76_SUBJECT_CODES
code = code.replace(/import { buildSubjectAttendanceBreakdown } from "@\/lib\/utils\/attendance";/,
'import { buildSubjectAttendanceBreakdown, PATH_TO_76_SUBJECT_CODES } from "@/lib/utils/attendance";');

// Update the map to filter
code = code.replace(/\{Object\.entries\(dashboardData\.pathTo76\)\.map\(\(\[subCode, stat\]: \[string, any\]\) => \{/,
`{Object.entries(dashboardData.pathTo76).filter(([subCode]) => (PATH_TO_76_SUBJECT_CODES as readonly string[]).includes(subCode)).map(([subCode, stat]: [string, any]) => {`);

fs.writeFileSync(filepath, code);
