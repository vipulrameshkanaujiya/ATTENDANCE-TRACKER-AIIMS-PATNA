const { PDFParse } = require("pdf-parse");
const fs = require("fs");

async function check() {
  const buf = fs.readFileSync("C:/Users/prant/Downloads/AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026 (2).pdf");
  const parser = new PDFParse(new Uint8Array(buf));
  // Calling getText() directly
  const res = await parser.getText();
  console.log("Success without manual load! Pages count:", res.pages?.length);
}

check().catch(console.error);
