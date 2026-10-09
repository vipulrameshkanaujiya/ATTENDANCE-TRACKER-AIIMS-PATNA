const fs = require('fs');
const filepath = 'lib/utils/attendance.ts';
let code = fs.readFileSync(filepath, 'utf8');

code = code.replace(/  if \(n\.includes\("community"\) \|\| n\.includes\("cfm"\)\) return "CFM";\r?\n\s*return null;\r?\n}/,
`  if (n.includes("community") || n.includes("cfm")) return "CFM";
  if (c === "OBG" || c === "OBSTETRICS") return "OBG";
  if (n.includes("obstetric") || n.includes("obg")) return "OBG";
  return null;
}`);
fs.writeFileSync(filepath, code);
