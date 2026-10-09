const fs = require('fs');
let filepath = 'app/actions/student.ts';
let code = fs.readFileSync(filepath, 'utf8');
code = code.replace(/const validCodes: HistoricalSubjectCode\[\] = \["PATH", "PHARMA", "MICRO", "FMT", "CFM"\];/,
'const validCodes: HistoricalSubjectCode[] = ["PATH", "PHARMA", "MICRO", "FMT", "CFM", "OBG"];');
fs.writeFileSync(filepath, code);

filepath = 'app/actions/admin.ts';
code = fs.readFileSync(filepath, 'utf8');
code = code.replace(/const validCodes: HistoricalSubjectCode\[\] = \["PATH", "PHARMA", "MICRO", "FMT", "CFM"\];/,
'const validCodes: HistoricalSubjectCode[] = ["PATH", "PHARMA", "MICRO", "FMT", "CFM", "OBG"];');
fs.writeFileSync(filepath, code);
