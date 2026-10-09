const fs = require('fs');
const filepath = 'types/database.ts';
let code = fs.readFileSync(filepath, 'utf8');
code = code.replace(/export type HistoricalSubjectCode = "PATH" \| "PHARMA" \| "MICRO" \| "FMT" \| "CFM";/,
'export type HistoricalSubjectCode = "PATH" | "PHARMA" | "MICRO" | "FMT" | "CFM" | "OBG";');
fs.writeFileSync(filepath, code);
