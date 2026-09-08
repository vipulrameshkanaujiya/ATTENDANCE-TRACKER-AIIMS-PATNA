"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { ClassType, BatchScope, AttendanceStatus } from "@/types/database";
import { revalidatePath } from "next/cache";

// 1. CLASS / SCHEDULE ACTIONS
export async function createClassAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const date = formData.get("date")?.toString();
  const start_time = formData.get("start_time")?.toString();
  const end_time = formData.get("end_time")?.toString();
  const subject_id = formData.get("subject_id")?.toString() || null;
  const topic = formData.get("topic")?.toString();
  const faculty = formData.get("faculty")?.toString() || null;
  const venue = formData.get("venue")?.toString() || "Lecture Hall 2";
  const class_type = formData.get("class_type")?.toString() as ClassType;
  const batch_scope = formData.get("batch_scope")?.toString() as BatchScope;

  if (!date || !start_time || !end_time || !class_type || !batch_scope) {
    throw new Error("Missing required class fields");
  }

  const { error } = await supabase.from("classes").insert({
    date,
    start_time,
    end_time,
    subject_id,
    topic,
    faculty,
    venue,
    class_type,
    batch_scope,
  });

  if (error) throw new Error("Failed to create class: " + error.message);

  revalidatePath("/admin/schedule");
  revalidatePath("/schedule");
  revalidatePath("/home");
}

export async function deleteClassAction(classId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) throw new Error("Failed to delete class: " + error.message);

  revalidatePath("/admin/schedule");
  revalidatePath("/schedule");
  revalidatePath("/home");
}

// 2. STUDENT BATCH OVERRIDE
export async function updateStudentBatchAction(studentId: string, batchId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ batch_id: batchId, updated_at: new Date().toISOString() })
    .eq("id", studentId);

  if (error) throw new Error("Failed to update student batch: " + error.message);

  revalidatePath("/admin/students");
}

// 3. ATTENDANCE ADMINISTRATIVE CORRECTION
export async function adminCorrectAttendanceAction(
  studentId: string,
  classId: string,
  status: AttendanceStatus
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("attendance").upsert(
    {
      student_id: studentId,
      class_id: classId,
      status: status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,class_id" }
  );

  if (error) throw new Error("Failed to correct attendance: " + error.message);

  revalidatePath("/admin/attendance");
}

// 4. CURRICULUM MANAGEMENT
export async function createSubjectAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const code = formData.get("code")?.toString().trim().toUpperCase();
  const name = formData.get("name")?.toString().trim();
  const color_code = formData.get("color_code")?.toString() || "#2563EB";
  const display_order = parseInt(formData.get("display_order")?.toString() || "0", 10);

  if (!code || !name) throw new Error("Code and name are required");

  const { error } = await supabase.from("subjects").insert({
    code,
    name,
    color_code,
    display_order,
  });

  if (error) throw new Error("Failed to create subject: " + error.message);

  revalidatePath("/admin/curriculum");
  revalidatePath("/topics");
}

export async function createUnitAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const subject_id = formData.get("subject_id")?.toString();
  const unit_number = parseInt(formData.get("unit_number")?.toString() || "1", 10);
  const title = formData.get("title")?.toString().trim();

  if (!subject_id || !title) throw new Error("Subject and title are required");

  const { error } = await supabase.from("units").insert({
    subject_id,
    unit_number,
    title,
  });

  if (error) throw new Error("Failed to create unit: " + error.message);

  revalidatePath("/admin/curriculum");
  revalidatePath("/topics");
}

export async function createTopicAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const unit_id = formData.get("unit_id")?.toString();
  const topic_code = formData.get("topic_code")?.toString().trim() || null;
  const title = formData.get("title")?.toString().trim();
  const display_order = parseInt(formData.get("display_order")?.toString() || "0", 10);

  if (!unit_id || !title) throw new Error("Unit and title are required");

  const { error } = await supabase.from("topics").insert({
    unit_id,
    topic_code,
    title,
    display_order,
  });

  if (error) throw new Error("Failed to create topic: " + error.message);

  revalidatePath("/admin/curriculum");
  revalidatePath("/topics");
}

// 5. EXAM COUNTDOWN MANAGEMENT
export async function upsertExamAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = formData.get("title")?.toString().trim();
  const exam_date = formData.get("exam_date")?.toString();
  const description = formData.get("description")?.toString() || null;
  const exam_id = formData.get("id")?.toString();

  if (!title || !exam_date) throw new Error("Title and exam date are required");

  if (exam_id) {
    const { error } = await supabase
      .from("exams")
      .update({ title, exam_date, description, updated_at: new Date().toISOString() })
      .eq("id", exam_id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("exams")
      .insert({ title, exam_date, description, is_active: true });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/exams");
  revalidatePath("/home");
}

// 6. BATCH CONFIGURATION
export async function updateBatchRangeAction(batchId: string, rollMin: number, rollMax: number) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("batches")
    .update({ roll_min: rollMin, roll_max: rollMax, updated_at: new Date().toISOString() })
    .eq("id", batchId);

  if (error) throw new Error("Failed to update batch range: " + error.message);

  revalidatePath("/admin/batches");
}

// 7. ROSTER MANAGEMENT
export async function addRosterStudentAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const rollNumber = formData.get("roll_number")?.toString().trim() || "";
  const fullName = formData.get("full_name")?.toString().trim() || null;
  const batchId = formData.get("batch_id")?.toString() || null;

  if (!rollNumber.match(/^24[0-9]{3}$/)) {
    throw new Error("Roll number must be exactly 5 digits starting with 24 (e.g. 24042)");
  }

  const { error } = await supabase.from("student_roster").insert({
    roll_number: rollNumber,
    full_name: fullName,
    batch_id: batchId,
    status: "UNCLAIMED",
  });

  if (error) throw new Error("Failed to add student to roster: " + error.message);

  revalidatePath("/admin/students");
}

export async function resetStudentClaimAction(rosterId: string) {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch roster entry to find claimed user
  const { data: rosterEntry } = await supabase
    .from("student_roster")
    .select("claimed_by_user_id, roll_number")
    .eq("id", rosterId)
    .single();

  if (!rosterEntry) throw new Error("Roster entry not found");

  // Reset roster claim
  const { error: resetError } = await supabase
    .from("student_roster")
    .update({
      claimed_by_user_id: null,
      status: "UNCLAIMED",
      claimed_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rosterId);

  if (resetError) throw new Error("Failed to reset roster entry: " + resetError.message);

  // If a user account was linked, reset their onboarding status so they can reclaim or re-link
  if (rosterEntry.claimed_by_user_id) {
    await supabase
      .from("users")
      .update({
        roll_number: null,
        batch_id: null,
        is_onboarded: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rosterEntry.claimed_by_user_id);
  }

  revalidatePath("/admin/students");
}

export async function bulkImportRosterAction(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const rawText = formData.get("roster_csv")?.toString() || "";
  if (!rawText.trim()) throw new Error("Please enter or paste roster data.");

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error("No entries found in input.");

  const { data: batches } = await supabase.from("batches").select("*").order("roll_min", { ascending: true });
  const batchMap: Record<string, string> = {};
  (batches || []).forEach((b: any) => {
    batchMap[b.name.toLowerCase()] = b.id;
  });

  const rosterEntries: any[] = [];
  const errors: string[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (line.startsWith("#") || line.toLowerCase().startsWith("roll")) continue; // skip comments / headers

    const parts = line.split(/[,\t]/).map((p) => p.trim());
    const roll = parts[0];
    const name = parts[1] || null;
    const specifiedBatch = parts[2] || null;

    if (!roll.match(/^24[0-9]{3}$/)) {
      errors.push(`Line ${idx + 1}: Invalid roll "${roll}" (must be 5 digits starting with 24).`);
      continue;
    }

    let batchId = specifiedBatch ? batchMap[specifiedBatch.toLowerCase()] : null;
    if (!batchId && batches && batches.length > 0) {
      const suffix = parseInt(roll.substring(2), 10);
      const matched = (batches as any[]).find((b) => suffix >= b.roll_min && suffix <= b.roll_max);
      batchId = matched ? matched.id : (batches.find((b: any) => b.is_default_fallback)?.id || null);
    }

    rosterEntries.push({
      roll_number: roll,
      full_name: name,
      batch_id: batchId,
      status: "UNCLAIMED",
    });
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ""}`);
  }

  if (rosterEntries.length > 0) {
    const { error: upsertErr } = await supabase
      .from("student_roster")
      .upsert(rosterEntries, { onConflict: "roll_number", ignoreDuplicates: true });

    if (upsertErr) throw new Error("Failed to bulk import roster: " + upsertErr.message);
  }

  revalidatePath("/admin/students");
}


