import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { parseTimetablePDF } from "../lib/pdf-parser/parser.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("[FATAL] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("================================================================================");
  console.log(" MEDICAL STUDENT HUB — SEPTEMBER 2026 TIMETABLE STAGING IMPORTER");
  console.log("================================================================================\n");

  const pdfPath = path.resolve(
    process.cwd(),
    "AIIMS_Patna_MBBS_2024_Teaching_Schedule_Sept_2026.pdf"
  );

  if (!fs.existsSync(pdfPath)) {
    console.error(`[FATAL] PDF file not found at: ${pdfPath}`);
    process.exit(1);
  }

  console.log(`[1/4] Reading PDF file: ${path.basename(pdfPath)}`);
  const fileBuffer = fs.readFileSync(pdfPath);
  const uint8Array = new Uint8Array(fileBuffer);

  console.log("[2/4] Parsing timetable schedule with deterministic PDF parser...");
  const parseResult = await parseTimetablePDF(uint8Array);
  console.log(`      ✓ Month / Year Detected: ${parseResult.month_year}`);
  console.log(`      ✓ Total Pages: ${parseResult.total_pages}`);
  console.log(`      ✓ Total Sessions Extracted: ${parseResult.rows.length}`);
  console.log(`      ✓ Holidays / Offs Identified: ${parseResult.holidays.length}`);
  parseResult.holidays.forEach((h) => {
    console.log(`         - ${h.date}: ${h.title}`);
  });

  // Fetch subject catalog to map codes to UUIDs
  console.log("\n[3/4] Mapping extracted subjects to database curriculum...");
  const { data: subjects, error: subErr } = await supabaseAdmin
    .from("subjects")
    .select("id, code, name");

  if (subErr) {
    console.error("[ERROR] Failed to fetch subjects catalog:", subErr.message);
    process.exit(1);
  }

  const subjectMap = new Map<string, string>();
  subjects.forEach((s) => {
    subjectMap.set(s.code.toUpperCase(), s.id);
  });
  console.log(`      ✓ Found ${subjects.length} official subjects in database: ${subjects.map((s) => s.code).join(", ")}`);

  // Identify admin user for audit trail
  const adminEmail = (process.env.ADMIN_EMAIL || "vipulrameshkanaujiya@gmail.com").trim().toLowerCase();
  const { data: adminUser } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("role", "admin")
    .maybeSingle();

  // Create STAGED record in timetable_imports
  console.log("\n[4/4] Staging timetable data into Supabase (status = 'STAGED')...");
  const { data: importRecord, error: impErr } = await supabaseAdmin
    .from("timetable_imports")
    .insert({
      file_name: path.basename(pdfPath),
      month_year: parseResult.month_year,
      status: "STAGED",
      uploaded_by: adminUser?.id || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (impErr || !importRecord) {
    console.error("[ERROR] Failed to create timetable_imports record:", impErr?.message);
    process.exit(1);
  }

  console.log(`      ✓ Created timetable_imports record: ID = ${importRecord.id} (status: STAGED)`);

  // Transform and categorize rows for staging
  let needsReviewCount = 0;
  let validCount = 0;
  const ambiguousDetails: { date: string; time: string; subject: string; topic: string; reason: string }[] = [];

  const stagedRowsToInsert = parseResult.rows.map((row) => {
    const subCode = row.subject_code.toUpperCase();
    const mappedSubjectId = subjectMap.get(subCode) || null;

    let rowStatus: "VALID" | "NEEDS_REVIEW" = "VALID";
    const issues: string[] = [];

    // Check for ambiguity
    if (row.parse_status === "NEEDS_REVIEW" || row.parse_status === "UNKNOWN") {
      rowStatus = "NEEDS_REVIEW";
      issues.push(`Parser flag: ${row.parse_status}`);
    }

    if (!mappedSubjectId && row.class_type !== "Clinical Posting" && row.class_type !== "Integration" && subCode !== "CLINICAL") {
      rowStatus = "NEEDS_REVIEW";
      issues.push(`Unrecognized subject code: "${row.subject_code}"`);
    }

    if (!row.faculty && row.class_type !== "Clinical Posting") {
      rowStatus = "NEEDS_REVIEW";
      issues.push("Faculty not explicitly named in schedule");
    }

    if (!row.venue) {
      rowStatus = "NEEDS_REVIEW";
      issues.push("Missing venue");
    }

    if (rowStatus === "NEEDS_REVIEW") {
      needsReviewCount++;
      ambiguousDetails.push({
        date: row.date,
        time: `${row.start_time.slice(0, 5)}-${row.end_time.slice(0, 5)}`,
        subject: row.subject_code,
        topic: row.topic,
        reason: issues.join("; "),
      });
    } else {
      validCount++;
    }

    return {
      import_id: importRecord.id,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      subject_raw: row.subject_code,
      subject_id: mappedSubjectId,
      topic: row.topic,
      faculty: row.faculty,
      venue: row.venue,
      class_type: row.class_type,
      batch_scope: row.batch_scope,
      parse_status: rowStatus,
      notes: issues.length > 0 ? issues.join("; ") : null,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
  });

  // Batch insert staged rows
  const { error: insertRowsErr } = await supabaseAdmin
    .from("timetable_import_rows")
    .insert(stagedRowsToInsert);

  if (insertRowsErr) {
    console.error("[ERROR] Failed to insert timetable_import_rows:", insertRowsErr.message);
    process.exit(1);
  }

  console.log(`      ✓ Successfully staged ${stagedRowsToInsert.length} rows into timetable_import_rows.`);
  console.log(`         - VALID (Ready for publication): ${validCount}`);
  console.log(`         - NEEDS_REVIEW (Ambiguous / Requires admin check): ${needsReviewCount}`);

  if (ambiguousDetails.length > 0) {
    console.log("\n--- AMBIGUOUS ROWS REQUIRING REVIEW ---");
    ambiguousDetails.forEach((a, i) => {
      console.log(`   [${i + 1}] ${a.date} (${a.time}) [${a.subject}] "${a.topic}" -> ${a.reason}`);
    });
  }

  // Verify zero classes published to public.classes
  const { count: classesCount } = await supabaseAdmin
    .from("classes")
    .select("*", { count: "exact", head: true })
    .gte("date", "2026-09-01")
    .lte("date", "2026-09-30");

  console.log("\n================================================================================");
  console.log(" IMPORT STAGING COMPLETE — SUMMARY");
  console.log("================================================================================");
  console.log(`Total Rows Extracted:       ${parseResult.rows.length}`);
  console.log(`Ready / Valid Rows:         ${validCount}`);
  console.log(`Needs Review Rows:          ${needsReviewCount}`);
  console.log(`Holidays / Weekly Offs:     ${parseResult.holidays.length}`);
  console.log(`timetable_imports ID:       ${importRecord.id}`);
  console.log(`Staging Status:             STAGED (NOT PUBLISHED)`);
  console.log(`Classes in public.classes:  ${classesCount ?? 0} (Schedule unchanged, safe)`);
  console.log("================================================================================\n");
}

main().catch((err) => {
  console.error("Unhandled error during import staging:", err);
  process.exit(1);
});
