const fs = require('fs');
let file = 'app/(student)/home/page.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  '<p className="text-xs font-semibold uppercase tracking-wider text-blue-600">\n            MBBS Phase-2 Utility\n          </p>\n',
  ''
);
fs.writeFileSync(file, content);
