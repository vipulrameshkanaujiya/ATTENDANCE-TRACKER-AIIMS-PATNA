const fs = require('fs');
let file = 'lib/pdf-parser/parser.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace('import pdfParse from "pdf-parse";', '// @ts-ignore\nimport { PDFParse } from "pdf-parse";');
fs.writeFileSync(file, content);
