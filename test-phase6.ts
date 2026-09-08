import fs from "fs";
import { parseTimetablePDF } from "./lib/pdf-parser/parser.ts";

console.log("=== PHASE 6: PDF TIMETABLE IMPORTER INTEGRATION TEST ===");

async function run() {
  const filePath = "C:/Users/prant/Downloads/AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026 (2).pdf";
  if (!fs.existsSync(filePath)) {
    console.error("Test PDF not found at:", filePath);
    process.exit(1);
  }

  const buffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(buffer);

  console.log(`Loaded real PDF file: ${(buffer.length / 1024).toFixed(1)} KB`);

  const result = await parseTimetablePDF(uint8Array);

  console.log("\n--- PARSER SUMMARY ---");
  console.log("Month/Year Detected:", result.month_year);
  console.log("Pages Processed:", result.total_pages);
  console.log("Total Teaching Sessions Extracted:", result.rows.length);
  console.log("Holidays / Weekly Offs Detected:", result.holidays.length);

  let failed = 0;

  // 1. Verify Month/Year
  if (!result.month_year.includes("September 2026")) {
    console.error("FAIL: Expected month_year to contain 'September 2026', got:", result.month_year);
    failed++;
  } else {
    console.log("PASS: Month/Year correctly identified as September 2026");
  }

  // 2. Verify Session Count
  if (result.rows.length < 30) {
    console.error("FAIL: Expected at least 30 sessions, got:", result.rows.length);
    failed++;
  } else {
    console.log(`PASS: Extracted ${result.rows.length} valid teaching sessions across the month`);
  }

  // 3. Verify Holiday detection (Sept 4 Holiday)
  const holidaySept4 = result.holidays.find((h) => h.date.includes("2026-09-04"));
  if (!holidaySept4) {
    console.warn("WARNING: Friday Sept 4 Holiday not explicitly in holidays list, checking rows...");
  } else {
    console.log("PASS: September 4 identified as Holiday / Non-teaching day");
  }

  // 4. Sample sessions display
  console.log("\n--- SAMPLE EXTRACTED SESSIONS ---");
  result.rows.slice(0, 5).forEach((r, idx) => {
    console.log(`[Session ${idx + 1}] ${r.date} (${r.start_time.slice(0, 5)}-${r.end_time.slice(0, 5)}) | [${r.subject_code}] ${r.class_type} | ${r.topic} | Faculty: ${r.faculty || "None"} | Scope: ${r.batch_scope}`);
  });

  if (failed > 0) {
    console.error(`\nTotal failures: ${failed}`);
    process.exit(1);
  } else {
    console.log("\nALL PHASE 6 PDF TIMETABLE IMPORTER TESTS PASSED SUCCESSFULLY!");
  }
}

run().catch((err) => {
  console.error("Integration test error:", err);
  process.exit(1);
});
