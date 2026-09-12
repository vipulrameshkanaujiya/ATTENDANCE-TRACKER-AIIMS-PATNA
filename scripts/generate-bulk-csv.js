"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var xlsx = require("xlsx");
var fs = require("fs");
var path = require("path");
// Workaround for pdf-parse bug when imported in ESM environments
var pdf = require('pdf-parse');
var baseDir = 'C:\\Users\\prant\\OneDrive\\Desktop\\attendence tracker';
function generate() {
    return __awaiter(this, void 0, void 0, function () {
        function findValidAttended(str, total) {
            if (str.startsWith('Absent'))
                return 0;
            for (var i = Math.min(3, str.length); i >= 1; i--) {
                var attended = parseInt(str.substring(0, i));
                if (attended > total)
                    continue;
                var percentStr = str.substring(i);
                if (percentStr === '')
                    return attended;
                var expectedPct = Math.round(attended / total * 100).toString();
                var expectedPctFloor = Math.floor(attended / total * 100).toString();
                var expectedPctCeil = Math.ceil(attended / total * 100).toString();
                if (percentStr.startsWith(expectedPct) || percentStr.startsWith(expectedPctFloor) || percentStr.startsWith(expectedPctCeil)) {
                    return attended;
                }
            }
            if (str.length >= 3)
                return parseInt(str.substring(0, str.length - 2));
            if (str.length === 2)
                return parseInt(str.substring(0, 1));
            return 0;
        }
        var students, microWb, microData, i, row, roll, pharmaWb, pharmaData, i, row, roll, pdfData, text, pathFixes, _i, _a, roll, idx, chunk, m, thStr, pT, pStr, rows, _b, _c, roll, s, n, csv;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    students = {};
                    microWb = xlsx.readFile(path.join(baseDir, 'MBBS 2024 Batch Cumulative and Monthly Attendance till August 2026.xlsx'));
                    microData = xlsx.utils.sheet_to_json(microWb.Sheets['Cumulative Attendance'], { header: 1 });
                    for (i = 4; i < microData.length; i++) {
                        row = microData[i];
                        if (!row || !row[1])
                            continue;
                        roll = row[1].toString().trim();
                        if (!/^2[1-4]\d{3}$/.test(roll))
                            continue;
                        students[roll] = {
                            name: (row[2] || '').toString().trim(),
                            micro: { tA: parseInt(row[4]) || 0, tT: parseInt(row[3]) || 0, pA: parseInt(row[7]) || 0, pT: parseInt(row[6]) || 0 },
                            pharma: { tA: 0, tT: 0, pA: 0, pT: 0 },
                            path: { tA: 0, tT: 130, pA: 0, pT: 33 } // defaults
                        };
                    }
                    pharmaWb = xlsx.readFile(path.join(baseDir, 'Revised-MBBS 2024 batch Attendance - August 2026 (1).xlsx'));
                    pharmaData = xlsx.utils.sheet_to_json(pharmaWb.Sheets['Till August'], { header: 1 });
                    for (i = 5; i < pharmaData.length; i++) {
                        row = pharmaData[i];
                        if (!row || !row[1])
                            continue;
                        roll = row[1].toString().trim();
                        if (students[roll]) {
                            students[roll].pharma = { tA: parseInt(row[4]) || 0, tT: parseInt(row[3]) || 0, pA: parseInt(row[7]) || 0, pT: parseInt(row[6]) || 0 };
                        }
                    }
                    return [4 /*yield*/, pdf(fs.readFileSync(path.join(baseDir, 'Attendance MBBS 2024 August month.pdf')))];
                case 1:
                    pdfData = _d.sent();
                    text = pdfData.text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, '');
                    pathFixes = {
                        '24003': { tA: 105, pA: 27, pT: 33 },
                        '24035': { tA: 121, pA: 32, pT: 33 },
                        '24071': { tA: 74, pA: 28, pT: 31 },
                        '24074': { tA: 87, pA: 31, pT: 31 },
                        '24083': { tA: 65, pA: 24, pT: 34 },
                        '24107': { tA: 82, pA: 28, pT: 34 }
                    };
                    for (_i = 0, _a = Object.keys(students); _i < _a.length; _i++) {
                        roll = _a[_i];
                        if (pathFixes[roll]) {
                            students[roll].path.tA = pathFixes[roll].tA;
                            students[roll].path.pA = pathFixes[roll].pA;
                            students[roll].path.pT = pathFixes[roll].pT;
                            continue;
                        }
                        idx = text.indexOf(roll);
                        if (idx !== -1) {
                            chunk = text.substring(idx, idx + 80);
                            m = chunk.match(/130((?:Absent)+|\d+?)(31|32|33)((?:Absent)+|\d+)/);
                            if (m) {
                                thStr = m[1];
                                pT = parseInt(m[2]);
                                pStr = m[3];
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
                    rows = [];
                    for (_b = 0, _c = Object.keys(students).sort(); _b < _c.length; _b++) {
                        roll = _c[_b];
                        s = students[roll];
                        n = s.name;
                        rows.push([roll, n, 'PATH', s.path.tA, s.path.tT, s.path.pA, s.path.pT].join(","));
                        rows.push([roll, n, 'PHARMA', s.pharma.tA, s.pharma.tT, s.pharma.pA, s.pharma.pT].join(","));
                        rows.push([roll, n, 'MICRO', s.micro.tA, s.micro.tT, s.micro.pA, s.micro.pT].join(","));
                        rows.push([roll, n, 'FMT', 0, 0, 0, 0].join(","));
                        rows.push([roll, n, 'CFM', 0, 0, 0, 0].join(","));
                    }
                    csv = "roll_number,name,subject_code,theory_attended,theory_total,practical_attended,practical_total\n" + rows.join("\n");
                    fs.writeFileSync('public/templates/bulk-attendance-batch-2024.csv', csv);
                    console.log("Total students processed:", Object.keys(students).length);
                    console.log("Total rows in CSV:", rows.length);
                    console.log("\nFirst 10 rows:");
                    console.log(rows.slice(0, 10).join("\n"));
                    console.log("\nLast 10 rows:");
                    console.log(rows.slice(-10).join("\n"));
                    return [2 /*return*/];
            }
        });
    });
}
generate().catch(console.error);
