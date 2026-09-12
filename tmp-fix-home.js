const fs = require('fs');
let file = 'app/(student)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replaceAll('dashboardData?.batchPhoto', 'data?.batchPhoto');
content = content.replaceAll('dashboardData.batchPhoto', 'data.batchPhoto');
fs.writeFileSync(file, content);
