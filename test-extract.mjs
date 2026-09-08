import { extractText, getDocumentProxy } from "unpdf";
import fs from "fs";

async function run() {
  const filePath = "C:/Users/prant/Downloads/AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026 (2).pdf";
  const buffer = fs.readFileSync(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  console.log("PDF Pages count:", pdf.numPages);
  
  const { text } = await extractText(new Uint8Array(buffer));
  console.log("Extracted text length:", text?.length);
  console.log("Extracted sample:\n", Array.isArray(text) ? text.join("\n").slice(0, 800) : text.slice(0, 800));
}

run().catch(console.error);
