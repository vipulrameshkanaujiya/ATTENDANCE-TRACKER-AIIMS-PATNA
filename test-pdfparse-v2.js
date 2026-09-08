const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function test() {
  const dataBuffer = fs.readFileSync("C:/Users/prant/Downloads/AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026 (2).pdf");
  const parser = new PDFParse(new Uint8Array(dataBuffer));
  await parser.load();
  const res = await parser.getText();
  console.log("Keys on res:", Object.keys(res));
  console.log("Pages extracted:", res.pages?.length);
  if (res.pages && res.pages.length > 0) {
    console.log("--- PAGE 1 TEXT SAMPLE ---");
    console.log(res.pages[0].text?.slice(0, 1000));
  }
}

test().catch(console.error);
