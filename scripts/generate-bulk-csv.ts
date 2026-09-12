import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Workaround for pdf-parse bug when imported in ESM environments
const pdf = require('pdf-parse');

const baseDir = 'C:\\Users\\prant\\OneDrive\\Desktop\\attendence tracker';

async function generate() {
  const students: Record<string, any> = {};

  const microWb = xlsx.readFile(path.join(baseDir, 'MBBS 2024 Batch Cumulative and Monthly Attendance till August 2026.xlsx'));
  const microData = xlsx.utils.sheet_to_json<any[]>(microWb.Sheets['Cumulative Attendance'], { header: 1 });
  for (let i = 4; i < microData.length; i++) {
    const row = microData[i];
    if (!row || !row[1]) continue;
    const roll = row[1].toString().trim();
    if (!/^2[1-4]\d{3}$/.test(roll)) continue;
    
    students[roll] = {
      name: (row[2] || '').toString().trim(),
      micro: { tA: parseInt(row[4])||0, tT: parseInt(row[3])||0, pA: parseInt(row[7])||0, pT: parseInt(row[6])||0 },
      pharma: { tA: 0, tT: 0, pA: 0, pT: 0 },
      path: { tA: 0, tT: 130, pA: 0, pT: 33 } // defaults
    };
  }

  const pharmaWb = xlsx.readFile(path.join(baseDir, 'Revised-MBBS 2024 batch Attendance - August 2026 (1).xlsx'));
  const pharmaData = xlsx.utils.sheet_to_json<any[]>(pharmaWb.Sheets['Till August'], { header: 1 });
  for (let i = 5; i < pharmaData.length; i++) {
    const row = pharmaData[i];
    if (!row || !row[1]) continue;
    const roll = row[1].toString().trim();
    if (students[roll]) {
      students[roll].pharma = { tA: parseInt(row[4])||0, tT: parseInt(row[3])||0, pA: parseInt(row[7])||0, pT: parseInt(row[6])||0 };
    }
  }

  const pdfData = await pdf(fs.readFileSync(path.join(baseDir, 'Attendance MBBS 2024 August month.pdf')));
  const text = pdfData.text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, '');
  
  function findValidAttended(str: string, total: number) {
    if (str.startsWith('Absent')) return 0;
    for (let i = Math.min(3, str.length); i >= 1; i--) {
      let attended = parseInt(str.substring(0, i));
      if (attended > total) continue;
      let percentStr = str.substring(i);
      if (percentStr === '') return attended;
      
      let expectedPct = Math.round(attended / total * 100).toString();
      let expectedPctFloor = Math.floor(attended / total * 100).toString();
      let expectedPctCeil = Math.ceil(attended / total * 100).toString();
      
      if (percentStr.startsWith(expectedPct) || percentStr.startsWith(expectedPctFloor) || percentStr.startsWith(expectedPctCeil)) {
        return attended;
      }
    }
    if (str.length >= 3) return parseInt(str.substring(0, str.length - 2));
    if (str.length === 2) return parseInt(str.substring(0, 1));
    return 0;
  }

  const pathFixes: Record<string, { tA: number, pA: number, pT: number }> = {
    '24003': { tA: 105, pA: 27, pT: 33 },
    '24035': { tA: 121, pA: 32, pT: 33 },
    '24071': { tA: 74, pA: 28, pT: 31 },
    '24074': { tA: 87, pA: 31, pT: 31 },
    '24083': { tA: 65, pA: 24, pT: 34 },
    '24107': { tA: 82, pA: 28, pT: 34 }
  };

  for (const roll of Object.keys(students)) {
    if (pathFixes[roll]) {
      students[roll].path.tA = pathFixes[roll].tA;
      students[roll].path.pA = pathFixes[roll].pA;
      students[roll].path.pT = pathFixes[roll].pT;
      continue;
    }

    const idx = text.indexOf(roll);
    if (idx !== -1) {
      const chunk = text.substring(idx, idx + 80);
      const m = chunk.match(/130((?:Absent)+|\d+?)(31|32|33)((?:Absent)+|\d+)/);
      if (m) {
        const thStr = m[1];
        const pT = parseInt(m[2]);
        const pStr = m[3];
        students[roll].path.tA = findValidAttended(thStr, 130);
        students[roll].path.pA = findValidAttended(pStr, pT);
        students[roll].path.pT = pT;
        
        // Safety clamp
        if (students[roll].path.pA > students[roll].path.pT) {
          students[roll].path.pA = students[roll].path.pT;
        }
      }
    }
  }

  const rows = [];
  for (const roll of Object.keys(students).sort()) {
    const s = students[roll];
    const n = s.name;
    rows.push([roll, n, 'PATH', s.path.tA, s.path.tT, s.path.pA, s.path.pT].join(","));
    rows.push([roll, n, 'PHARMA', s.pharma.tA, s.pharma.tT, s.pharma.pA, s.pharma.pT].join(","));
    rows.push([roll, n, 'MICRO', s.micro.tA, s.micro.tT, s.micro.pA, s.micro.pT].join(","));
    rows.push([roll, n, 'FMT', 0, 0, 0, 0].join(","));
    rows.push([roll, n, 'CFM', 0, 0, 0, 0].join(","));
  }
  
  const csv = "roll_number,name,subject_code,theory_attended,theory_total,practical_attended,practical_total\n" + rows.join("\n");
  fs.writeFileSync('public/templates/bulk-attendance-batch-2024.csv', csv);
  
  console.log("Total students processed:", Object.keys(students).length);
  console.log("Total rows in CSV:", rows.length);
  console.log("\nFirst 10 rows:");
  console.log(rows.slice(0, 10).join("\n"));
  console.log("\nLast 10 rows:");
  console.log(rows.slice(-10).join("\n"));
}

generate().catch(console.error);
