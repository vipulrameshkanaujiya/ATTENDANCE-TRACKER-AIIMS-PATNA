"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { parseTimetablePDF, ParsedScheduleRow } from "@/lib/pdf-parser/parser";
import { revalidatePath } from "next/cache";

export async function parsePdfAction(formData: FormData) {
  await requireAdmin();
  const file = formData.get("pdf_file") as File;
  if (!file) throw new Error("No PDF file uploaded");

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const parseResult = await parseTimetablePDF(uint8Array);
  return parseResult;
}

export async function publishTimetableAction(
  rows: ParsedScheduleRow[],
  monthYear: string,
  fileName: string,
  stagedImportId?: string
) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  if (!rows || rows.length === 0) {
    throw new Error("No timetable rows provided for publication.");
  }

  // 1. Strict server-side row validation
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.date || !r.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error(`Row ${i + 1} has invalid date format: "${r.date}". Must be YYYY-MM-DD.`);
    }
    if (!r.start_time || !r.end_time) {
      throw new Error(`Row ${i + 1} (${r.date}) is missing start or end time.`);
    }
    if (r.parse_status === "NEEDS_REVIEW" || r.parse_status === "UNKNOWN") {
      throw new Error(
        `Row ${i + 1} on ${r.date} (${r.start_time}) is flagged as "${r.parse_status}". All sessions must be reviewed and validated before publication.`
      );
    }
  }

  // 2. Query subject map and validate subject mappings
  const { data: subjects, error: subErr } = await supabase.from("subjects").select("id, code");
  if (subErr) throw new Error("Failed to load subjects: " + subErr.message);

  const subMap: Record<string, string> = {};
  (subjects || []).forEach((s: any) => {
    subMap[s.code.toUpperCase()] = s.id;
  });

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const subCode = r.subject_code?.toUpperCase();
    if (subCode && !subMap[subCode] && r.class_type !== "Other" && r.class_type !== "Integration") {
      throw new Error(
        `Row ${i + 1} on ${r.date} has unknown subject code "${r.subject_code}". Please configure this subject in Curriculum Manager first.`
      );
    }
  }

  // 3. Obtain or create a timetable_imports tracking record in STAGED status
  let importRecId = stagedImportId;
  if (!importRecId) {
    const { data: importRec, error: impErr } = await supabase
      .from("timetable_imports")
      .insert({
        file_name: fileName,
        month_year: monthYear,
        status: "STAGED",
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (impErr) throw new Error("Failed to create import staging record: " + impErr.message);
    importRecId = importRec.id;
  }

  try {
    // 4. Preserve staged import rows in timetable_import_rows table
    // If reusing existing staged import, replace staged rows to keep sync with UI edits
    if (stagedImportId) {
      await supabase.from("timetable_import_rows").delete().eq("import_id", importRecId);
    }

    const stagingRowsToInsert = rows.map((r) => ({
      import_id: importRecId,
      date: r.date,
      start_time: r.start_time,
      end_time: r.end_time,
      subject_raw: r.subject_code,
      subject_id: subMap[r.subject_code?.toUpperCase()] || null,
      topic: r.topic,
      faculty: r.faculty,
      venue: r.venue,
      class_type: r.class_type,
      batch_scope: r.batch_scope,
      parse_status: r.parse_status,
      notes: r.notes || null,
      is_deleted: false,
      created_at: new Date().toISOString(),
    }));

    const { error: stagingErr } = await supabase
      .from("timetable_import_rows")
      .insert(stagingRowsToInsert);

    if (stagingErr) {
      throw new Error("Failed to store staged import rows: " + stagingErr.message);
    }

    // 5. Duplicate Detection against existing scheduled classes
    const dates = rows.map((r) => r.date);
    const minDate = dates.reduce((a, b) => (a < b ? a : b));
    const maxDate = dates.reduce((a, b) => (a > b ? a : b));

    const { data: existingClasses } = await supabase
      .from("classes")
      .select("date, start_time, batch_scope, subject_id")
      .gte("date", minDate)
      .lte("date", maxDate);

    const existingClassSet = new Set<string>();
    (existingClasses || []).forEach((c: any) => {
      existingClassSet.add(`${c.date}_${c.start_time}_${c.batch_scope}`);
    });

    // 6. Filter out exact duplicates and prepare final classes
    const classesToInsert: any[] = [];
    let duplicateCount = 0;

    for (const r of rows) {
      const key = `${r.date}_${r.start_time}_${r.batch_scope}`;
      if (existingClassSet.has(key)) {
        duplicateCount++;
        continue; // Prevent duplicate session collision
      }

      classesToInsert.push({
        date: r.date,
        start_time: r.start_time,
        end_time: r.end_time,
        subject_id: subMap[r.subject_code?.toUpperCase()] || null,
        topic: r.topic,
        faculty: r.faculty,
        venue: r.venue,
        class_type: r.class_type,
        batch_scope: r.batch_scope,
        timetable_import_id: importRecId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (classesToInsert.length > 0) {
      const { error: insertErr } = await supabase.from("classes").insert(classesToInsert);
      if (insertErr) {
        throw new Error("Failed to publish classes into timetable: " + insertErr.message);
      }
    }

    // 7. Atomically mark timetable_imports as PUBLISHED only after successful class insertion
    const { error: finalizeErr } = await supabase
      .from("timetable_imports")
      .update({
        status: "PUBLISHED",
        published_at: new Date().toISOString(),
      })
      .eq("id", importRecId);

    if (finalizeErr) {
      throw new Error("Failed to finalize published import status: " + finalizeErr.message);
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    revalidatePath("/home");

    return { 
      success: true, 
      count: classesToInsert.length, 
      duplicatesSkipped: duplicateCount 
    };
  } catch (error: any) {
    // If any failure occurs, record FAILED status on import record
    if (importRecId) {
      await supabase
        .from("timetable_imports")
        .update({ status: "FAILED" })
        .eq("id", importRecId);
    }

    throw error;
  }
}

