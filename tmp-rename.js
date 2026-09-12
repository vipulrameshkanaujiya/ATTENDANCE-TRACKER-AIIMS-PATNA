const fs = require('fs');
let file = 'app/(auth)/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replaceAll('Attendance Tracker by Vipul K', 'BunkBuddy');
content = content.replaceAll('AIIMS Patna · MBBS Batch 2024 (Phase-2)', 'AIIMS Patna');
content = content.replaceAll('AIIMS Patna A MBBS Batch 2024 (Phase-2)', 'AIIMS Patna');
fs.writeFileSync(file, content);

file = 'app/blocked/page.tsx';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('Attendance Tracker by Vipul K', 'BunkBuddy');
  content = content.replaceAll('AIIMS Patna · MBBS Batch 2024 (Phase-2)', 'AIIMS Patna');
  fs.writeFileSync(file, content);
}

file = 'README.md';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf8');
  content = content.replaceAll('Attendance Tracker by Vipul K', 'BunkBuddy');
  content = content.replaceAll('AIIMS Patna · MBBS Batch 2024 (Phase-2)', 'AIIMS Patna');
  fs.writeFileSync(file, content);
}
