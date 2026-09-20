"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/session";
import { ClassType, BatchScope, AttendanceStatus, HistoricalSubjectCode, StudentHistoricalAttendance } from "@/types/database";
import { revalidatePath } from "next/cache";
import { getTodayDateString } from "@/lib/utils/date";
import { computePathTo76 } from "@/lib/utils/attendance";

// 1. CLASS / SCHEDULE ACTIONS
export async function createClassAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

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

  const formattedStartTime = start_time.length === 5 ? `${start_time}:00` : start_time;
  const formattedEndTime = end_time.length === 5 ? `${end_time}:00` : end_time;

  const { error } = await supabase.from("classes").insert({
    date,
    start_time: formattedStartTime,
    end_time: formattedEndTime,
    subject_id: subject_id === "" ? null : subject_id,
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

export async function updateClassAction(classId: string, formData: FormData) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const date = formData.get("date")?.toString();
    const start_time = formData.get("start_time")?.toString();
    const end_time = formData.get("end_time")?.toString();
    const subject_id = formData.get("subject_id")?.toString() || null;
    const topic = formData.get("topic")?.toString();
    const faculty = formData.get("faculty")?.toString() || null;
    const venue = formData.get("venue")?.toString() || null;
    const class_type = formData.get("class_type")?.toString() as ClassType;
    const batch_scope = formData.get("batch_scope")?.toString() as BatchScope;

    if (!classId) {
      return { success: false, error: "Missing class ID" };
    }

    if (!date || !start_time || !end_time || !class_type || !batch_scope) {
      return { success: false, error: "Missing required class fields" };
    }

    const formattedStartTime = start_time.length === 5 ? `${start_time}:00` : start_time;
    const formattedEndTime = end_time.length === 5 ? `${end_time}:00` : end_time;

    const { error } = await supabase
      .from("classes")
      .update({
        date,
        start_time: formattedStartTime,
        end_time: formattedEndTime,
        subject_id: subject_id === "" ? null : subject_id,
        topic: topic || "",
        faculty,
        venue,
        class_type,
        batch_scope,
        updated_at: new Date().toISOString(),
      })
      .eq("id", classId);

    if (error) {
      return { success: false, error: "Failed to update class: " + error.message };
    }

    revalidatePath("/admin/schedule");
    revalidatePath("/schedule");
    revalidatePath("/home");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred" };
  }
}

export async function deleteClassAction(classId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

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

  if (!rollNumber.match(/^2[1-4][0-9]{3}$/)) {
    throw new Error("Roll number must be exactly 5 digits starting with 21, 22, 23, or 24 (e.g. 24042, 22064)");
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

    if (!roll.match(/^2[1-4][0-9]{3}$/)) {
      errors.push(`Line ${idx + 1}: Invalid roll "${roll}" (must be 5 digits starting with 21, 22, 23, or 24).`);
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

// 8. STUDENT HISTORICAL ATTENDANCE ADMINISTRATIVE OVERRIDE
export async function adminGetStudentHistoricalAttendanceAction(
  studentId: string
): Promise<{ success: boolean; data?: StudentHistoricalAttendance[]; error?: string }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("student_historical_attendance")
      .select("*")
      .eq("student_id", studentId);

    if (error) {
      if (error.code === "PGRST205") {
        return { success: true, data: [] };
      }
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as StudentHistoricalAttendance[]) || [] };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to get historical records" };
  }
}

export async function adminUpdateStudentHistoricalAttendanceAction(
  studentId: string,
  entries: Array<{
    subject_code: HistoricalSubjectCode;
    theory_attended: number;
    theory_total: number;
    practical_attended: number;
    practical_total: number;
    is_one_time_set?: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user: adminUser } = await requireAdmin();
    const supabase = createAdminClient();

    if (!studentId) {
      return { success: false, error: "Missing student ID" };
    }

    const validCodes: HistoricalSubjectCode[] = ["PATH", "PHARMA", "MICRO", "FMT", "CFM"];

    for (const entry of entries) {
      if (!validCodes.includes(entry.subject_code)) {
        return { success: false, error: `Invalid subject code: ${entry.subject_code}` };
      }
      const tAtt = Number(entry.theory_attended);
      const tTot = Number(entry.theory_total);
      const pAtt = Number(entry.practical_attended);
      const pTot = Number(entry.practical_total);

      if (isNaN(tAtt) || isNaN(tTot) || tAtt < 0 || tTot < 0) {
        return { success: false, error: `Invalid theory values for ${entry.subject_code}` };
      }
      if (tAtt > tTot) {
        return { success: false, error: `Theory attended (${tAtt}) cannot exceed total (${tTot}) for ${entry.subject_code}` };
      }
      if (isNaN(pAtt) || isNaN(pTot) || pAtt < 0 || pTot < 0) {
        return { success: false, error: `Invalid practical values for ${entry.subject_code}` };
      }
      if (pAtt > pTot) {
        return { success: false, error: `Practical attended (${pAtt}) cannot exceed total (${pTot}) for ${entry.subject_code}` };
      }
    }

    const payload = entries.map((e) => ({
      student_id: studentId,
      subject_code: e.subject_code,
      theory_attended: Number(e.theory_attended) || 0,
      theory_total: Number(e.theory_total) || 0,
      practical_attended: Number(e.practical_attended) || 0,
      practical_total: Number(e.practical_total) || 0,
      is_one_time_set: e.is_one_time_set ?? true,
      updated_at: new Date().toISOString(),
      updated_by: adminUser.id,
    }));

    const { error: upsertError } = await supabase
      .from("student_historical_attendance")
      .upsert(payload, { onConflict: "student_id,subject_code" });

    if (upsertError) {
      return { success: false, error: "Failed to update historical attendance: " + upsertError.message };
    }

    revalidatePath("/admin/students");
    revalidatePath("/attendance");
    revalidatePath("/home");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "An unexpected error occurred" };
  }
}


export async function adminToggleAutoPresentAction(studentId: string, isEnabled: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const todayStr = getTodayDateString();

  const { error } = await supabase
    .from("student_auto_present_preferences")
    .upsert(
      {
        student_id: studentId,
        is_enabled: isEnabled,
        enabled_from: isEnabled ? todayStr : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id" }
    );
  if (error) throw new Error("Failed to update auto-present preference: " + error.message);
  revalidatePath("/admin/students");
  return { success: true };
}


// --- ACCESS CONTROL ACTIONS ---

export async function blockUserAction(input: { email?: string; rollNumber?: string; reason?: string }) {
  const { user: adminUser } = await requireAdmin();
  const supabase = createAdminClient();

  let targetUserId: string | null = null;
  const emailLower = input.email?.trim().toLowerCase() || null;
  const roll = input.rollNumber?.trim() || null;

  if (!emailLower && !roll) {
    throw new Error("Must provide either email or roll number to block.");
  }

  // If email provided, look up in users table
  if (emailLower) {
    const { data: userRow } = await supabase
      .from("users")
      .select("id")
      .eq("email", emailLower)
      .maybeSingle();
    if (userRow) {
      targetUserId = userRow.id;
    }
  }

  const { error } = await supabase.from("access_control").upsert(
    {
      user_id: targetUserId,
      email: emailLower,
      roll_number: roll,
      is_blocked: true,
      reason: input.reason || null,
      blocked_by: adminUser.id,
      blocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw new Error("Failed to block user: " + error.message);
  revalidatePath("/admin/access-control");
}

export async function unblockUserAction(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from("access_control")
    .update({
      is_blocked: false,
      unblocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", id);
    
  if (error) throw new Error("Failed to unblock user: " + error.message);
  revalidatePath("/admin/access-control");
}

export async function forceLogoutUserAction(userId: string) {
  await requireAdmin();
  const adminSupabase = createAdminClient();
  
  const { error } = await adminSupabase.auth.admin.signOut(userId);
  if (error) throw new Error("Failed to force logout user: " + error.message);
  
  revalidatePath("/admin/access-control");
  revalidatePath("/admin/students");
}

export async function removeUserAction(userId: string) {
  const { user: adminUser } = await requireAdmin();
  const supabase = createAdminClient();

  // 1. Fetch user to log the removal
  const { data: userRow } = await supabase
    .from("users")
    .select("email, roll_number")
    .eq("id", userId)
    .single();

  if (userRow) {
    await supabase.from("access_control").insert({
      email: userRow.email,
      roll_number: userRow.roll_number,
      is_blocked: true,
      reason: "Account permanently removed by admin",
      blocked_by: adminUser.id
    });
  }

  // 2. Clear student roster claim
  if (userRow?.roll_number) {
    await supabase
      .from("student_roster")
      .update({ claimed_by_user_id: null, status: "UNCLAIMED", claimed_at: null })
      .eq("roll_number", userRow.roll_number);
  }

  // 3. Delete attendance & progress
  await supabase.from("attendance").delete().eq("student_id", userId);
  await supabase.from("student_topic_progress").delete().eq("student_id", userId);
  await supabase.from("student_historical_attendance").delete().eq("student_id", userId);
  await supabase.from("student_auto_present_preferences").delete().eq("student_id", userId);

  // 4. Delete from public.users
  await supabase.from("users").delete().eq("id", userId);

  // 5. Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error("Failed to delete auth user: " + authError.message);

  revalidatePath("/admin/access-control");
  revalidatePath("/admin/students");
}

export async function changeUserRollNumberAction(
  userId: string,
  newRollNumber: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user: adminUser } = await requireAdmin();
    const supabaseAdmin = createAdminClient();
    const supabaseUser = await createClient();

    const cleanRoll = newRollNumber.trim();

    // 1. Validate roll format
    if (!/^2[1-4]\d{3}$/.test(cleanRoll)) {
      throw new Error("Invalid roll number format. Must be 5 digits starting with 21, 22, 23, or 24 (e.g., 24001, 22064).");
    }

    // 2. Fetch current user
    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("id, roll_number, email, batch_id")
      .eq("id", userId)
      .single();

    if (!currentUser) throw new Error("User not found.");

    const oldRoll = currentUser.roll_number;

    // 3. Check if new roll exists in roster and is claimable
    const { data: rosterEntry } = await supabaseAdmin
      .from("student_roster")
      .select("roll_number, status, claimed_by_user_id, batch_id")
      .eq("roll_number", cleanRoll)
      .maybeSingle();

    if (!rosterEntry) {
      throw new Error("Roll number not found in official roster. Contact admin to add it first.");
    }

    if (rosterEntry.status === "CLAIMED" && rosterEntry.claimed_by_user_id !== userId) {
      throw new Error("Roll number is already claimed by another student.");
    }

    // 4. Call RPC to update roll number securely USING THE USER CLIENT
    // The RPC uses auth.uid() which needs the user's session JWT, not the admin service role
    const { error } = await supabaseUser.rpc("admin_change_roll_number", {
      p_user_id: userId,
      p_new_roll: cleanRoll,
      p_new_batch_id: rosterEntry.batch_id,
    });

    if (error) throw new Error("Failed to update roll number: " + error.message);

    // 5. Audit log
    await supabaseAdmin.from("access_control").insert({
      user_id: userId,
      email: currentUser.email,
      roll_number: cleanRoll,
      is_blocked: false,
      reason: `Roll number changed from ${oldRoll || "(none)"} to ${cleanRoll} by admin`,
      blocked_by: adminUser.id,
    });

    // 6. Invalidate caches
    revalidatePath("/admin/students");
    revalidatePath("/admin/access-control");
    revalidatePath("/home");
    revalidatePath("/attendance");
    revalidatePath("/schedule");

    return { success: true };
  } catch (err: any) {
    console.error("changeUserRollNumberAction error:", err);
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function uploadBulkAttendanceAction(csvRows: Array<{
  roll_number: string;
  name?: string;
  subject_code: string;
  theory_attended: number;
  theory_total: number;
  practical_attended: number;
  practical_total: number;
}>) {
  const { user: adminUser } = await requireAdmin();
  const supabase = createAdminClient();

  // Validate every row
  const errors: string[] = [];
  const validRows = csvRows.filter((row, i) => {
    if (!/^2[1-4]\d{3}$/.test(row.roll_number)) {
      errors.push(`Row ${i + 1}: Invalid roll format "${row.roll_number}"`);
      return false;
    }
    if (!["PATH", "PHARMA", "MICRO", "FMT", "CFM"].includes(row.subject_code)) {
      errors.push(`Row ${i + 1}: Invalid subject "${row.subject_code}"`);
      return false;
    }
      if (row.theory_attended > row.theory_total) {
        console.warn(`Row ${i + 1}: Clamping theory_attended from ${row.theory_attended} to ${row.theory_total}`);
        row.theory_attended = row.theory_total;
      }
      if (row.practical_attended > row.practical_total) {
        console.warn(`Row ${i + 1}: Clamping practical_attended from ${row.practical_attended} to ${row.practical_total}`);
        row.practical_attended = row.practical_total;
      }
      return true;
  });

  if (errors.length > 0) {
    return { success: false, errors, uploaded: 0 };
  }

  const batchId = crypto.randomUUID();
  const rowsToInsert = validRows.map(r => ({
    ...r,
    uploaded_by: adminUser.id,
    upload_batch_id: batchId,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("bulk_historical_attendance")
    .upsert(rowsToInsert, { onConflict: "roll_number,subject_code" });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/bulk-attendance");
  revalidatePath("/attendance");
  return { success: true, uploaded: validRows.length };
}

export async function deleteBulkRowAction(roll_number: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("bulk_historical_attendance").delete().eq("roll_number", roll_number);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bulk-attendance");
  revalidatePath("/attendance");
}

export async function clearAllBulkAction() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("bulk_historical_attendance").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/bulk-attendance");
  revalidatePath("/attendance");
}

export async function wipeUserAccountAction(userId: string) {
  try {
    const { user: adminUser } = await requireAdmin();
    const supabase = createAdminClient();

    // 1. Fetch user info for audit log
    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, roll_number, batch_id")
      .eq("id", userId)
      .maybeSingle();

    if (!userRow) {
      return { success: false, error: "User not found." };
    }

    // 2. Delete all related data
    await supabase.from("attendance").delete().eq("student_id", userId);
    await supabase.from("student_topic_progress").delete().eq("student_id", userId);
    await supabase.from("student_historical_attendance").delete().eq("student_id", userId);
    await supabase.from("student_auto_present_preferences").delete().eq("student_id", userId);

    // 3. Reset roster entry if roll exists
    if (userRow.roll_number) {
      await supabase
        .from("student_roster")
        .update({
          status: "UNCLAIMED",
          claimed_by_user_id: null,
          claimed_at: null,
        })
        .eq("roll_number", userRow.roll_number);
    }

    // 4. Delete public.users row
    await supabase.from("users").delete().eq("id", userId);

    // 5. Delete auth.users record
    const { error: authErr } = await supabase.auth.admin.deleteUser(userId);
    if (authErr) {
      return { success: false, error: "Failed to delete auth user: " + authErr.message };
    }

    // 6. Audit log
    await supabase.from("access_control").insert({
      email: userRow.email,
      roll_number: userRow.roll_number,
      is_blocked: false,
      reason: "Test account wiped by admin — all data removed, roll freed",
      blocked_by: adminUser.id,
    });

    revalidatePath("/admin/students");
    revalidatePath("/admin/access-control");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function uploadBatchPhotoAction(formData: FormData) {
  try {
    const { user: adminUser } = await requireAdmin();
    const supabase = createAdminClient();
    
    const file = formData.get("photo") as File | null;
    const caption = formData.get("caption") as string | null;
    
    if (!file) return { success: false, error: "No file provided" };
    if (file.size > 5 * 1024 * 1024) return { success: false, error: "File exceeds 5MB limit" };
    
    const ext = file.name.split('.').pop();
    const fileName = `batch_photo_${Date.now()}.${ext}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("batch-photos")
      .upload(fileName, file);
      
    if (uploadError) return { success: false, error: uploadError.message };
    
    const { data: { publicUrl } } = supabase.storage
      .from("batch-photos")
      .getPublicUrl(fileName);
      
    const { error: dbError } = await supabase
      .from("app_settings")
      .upsert({
        key: "batch_photo",
        value: { url: publicUrl, caption: caption || "" },
        updated_by: adminUser.id,
        updated_at: new Date().toISOString()
      });
      
    if (dbError) return { success: false, error: dbError.message };
    
    revalidatePath("/home");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function deleteBatchPhotoAction() {
  try {
    const { user: adminUser } = await requireAdmin();
    const supabase = createAdminClient();
    
    const { error: dbError } = await supabase
      .from("app_settings")
      .upsert({
        key: "batch_photo",
        value: { url: "/batch-photo.jpg", caption: "MBBS Batch 2024 — AIIMS Patna" },
        updated_by: adminUser.id,
        updated_at: new Date().toISOString()
      });
      
    if (dbError) return { success: false, error: dbError.message };
    
    revalidatePath("/home");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function getFeedbackListAction() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function updateFeedbackStatusAction(id: string, status: string, adminNotes?: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    const { error } = await supabase
      .from("feedback")
      .update(updatePayload)
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteFeedbackAction(id: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("feedback")
      .delete()
      .eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/admin/feedback");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getDonationsListAction() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("donations")
      .select("*")
      .order("amount", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: error.message, data: [] };
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

export async function addDonationAction(formData: FormData) {
  try {
    const { user } = await requireAdmin();
    const supabase = createAdminClient();

    const donorName = (formData.get("donor_name") as string)?.trim();
    const amountStr = (formData.get("amount") as string)?.trim();
    const currency = (formData.get("currency") as string)?.trim() || "INR";
    const message = (formData.get("message") as string)?.trim();
    const isPublic = formData.get("is_public") === "on" || formData.get("is_public") === "true";

    if (!donorName) return { success: false, error: "Donor name is required." };

    const amount = amountStr ? parseFloat(amountStr) : null;

    const { error } = await supabase.from("donations").insert({
      donor_name: donorName,
      amount: amount !== null && !isNaN(amount) ? amount : null,
      currency,
      message: message || null,
      is_public: isPublic,
      created_by: user.id,
    });

    if (error) return { success: false, error: error.message };
    revalidatePath("/home");
    revalidatePath("/help");
    revalidatePath("/admin/donations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteDonationAction(id: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from("donations").delete().eq("id", id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/home");
    revalidatePath("/help");
    revalidatePath("/admin/donations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateDonationAction(
  id: string,
  updates: { donor_name?: string; amount?: number | null; message?: string | null; is_public?: boolean }
) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("donations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/home");
    revalidatePath("/help");
    revalidatePath("/admin/donations");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function getAllStudentsAttendanceAction() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: students } = await supabase
      .from("users")
      .select("id, roll_number, full_name, email, batch_id, created_at, batch:batches(name)")
      .eq("is_onboarded", true)
      .order("roll_number");

    if (!students) return { success: true, students: [] };

    const { data: exam } = await supabase
      .from("exams")
      .select("exam_date")
      .eq("is_active", true)
      .maybeSingle();
    const examDate = exam?.exam_date || "2026-11-02";

    const { data: subjects } = await supabase
      .from("subjects")
      .select("*");

    const { data: allAttendance, error: attError } = await supabase
      .from("attendance")
      .select(`
        student_id, status, class_id,
        class:classes(
          id, date, class_type, subject_id,
          subject:subjects(id, code, name, color_code)
        )
      `);
    if (attError) console.error("Error fetching attendance:", attError);

    const { data: allHistorical } = await supabase
      .from("student_historical_attendance")
      .select("*");

    const todayStr = getTodayDateString();
    
    // Fallback simple shift: examDate - 1 day roughly. For simplicity, just use todayStr to examDate in generateFutureClasses. 
    // generateFutureClasses predicts up to endDate.
    const adjustedEndDate = new Date(new Date(examDate).getTime() - 86400000).toISOString().split("T")[0];
    
    const uniqueBatches = Array.from(new Set(students.map(s => (s.batch as any)?.name || "Batch A")));
    const futureClassesByBatch: Record<string, any[]> = {};
    
    const { generateFutureClasses } = await import("@/lib/utils/schedule-predictor");
    const { buildSubjectAttendanceBreakdown, computePathTo76 } = await import("@/lib/utils/attendance");
    
    for (const b of uniqueBatches) {
      futureClassesByBatch[b] = generateFutureClasses(todayStr, adjustedEndDate, b);
    }

    const results = students.map(student => {
      const studentAttendance = (allAttendance || []).filter(a => a.student_id === student.id) as any;
      const studentHistorical = (allHistorical || []).filter(h => h.student_id === student.id) as any;
      const batchName = (student.batch as any)?.name || "Batch A";

      const breakdownMap = buildSubjectAttendanceBreakdown(
        subjects as any || [],
        studentAttendance,
        studentHistorical
      );

      const futureClasses = futureClassesByBatch[batchName] || [];

      let totalNeed = 0;
      let totalPredicted = 0;
      let totalOverallAttended = 0;
      let totalOverallClasses = 0;

      const perSubject: Record<string, any> = {};

      for (const sub of Object.values(breakdownMap)) {
         totalOverallAttended += sub.attended;
         totalOverallClasses += sub.total;

         const futureTheoryClasses = futureClasses.filter((c: any) => c.subject_code === sub.code && (c.class_type === "Lecture" || c.class_type === "Tutorial" || c.class_type === "Integration" || c.class_type === "SDL"));
         const futurePracticalClasses = futureClasses.filter((c: any) => c.subject_code === sub.code && c.class_type === "Practical");
         
         const predictedFutureTheory = futureTheoryClasses.reduce((sum: number, c: any) => sum + (c.units || 1), 0);
         const predictedFuturePractical = futurePracticalClasses.reduce((sum: number, c: any) => sum + (c.units || 1), 0);
         
         const path = computePathTo76(
           sub,
           { theory: predictedFutureTheory, practical: predictedFuturePractical },
           0.76
         );

         totalNeed += (path.theory.need + path.practical.need);
         totalPredicted += (path.theory.predicted_future + path.practical.predicted_future);

         const hasSplit = !!(sub.theory || sub.practical);

         perSubject[sub.code] = {
            code: sub.code,
            name: sub.name,
            percentage: sub.percentage,
            attended: sub.attended,
            total: sub.total,
            need: (!hasSplit && path.theory.need > 0) ? path.theory.need : undefined, // If non-split, computePathTo76 might put everything in theory
            ...(hasSplit && sub.theory && {
              theory: {
                attended: sub.theory.attended || 0,
                total: sub.theory.total || 0,
                percentage: sub.theory.percentage || 0,
                need: path.theory.need,
                predicted_future: path.theory.predicted_future
              }
            }),
            ...(hasSplit && sub.practical && {
              practical: {
                attended: sub.practical.attended || 0,
                total: sub.practical.total || 0,
                percentage: sub.practical.percentage || 0,
                need: path.practical.need,
                predicted_future: path.practical.predicted_future
              }
            })
         };
      }

      const overallPct = totalOverallClasses > 0 ? (totalOverallAttended / totalOverallClasses) * 100 : 0;

      return {
        id: student.id,
        roll_number: student.roll_number,
        full_name: student.full_name,
        batch_id: batchName,
        overall_attendance_pct: overallPct,
        classes_needed_total: totalNeed,
        classes_predicted_total: totalPredicted,
        per_subject: perSubject,
      };
    });

    return { success: true, students: results };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function sendAdminMessageAction(formData: FormData) {
  try {
    const { user: adminUser } = await requireAdmin();
    const supabase = createAdminClient();

    const toUserId = formData.get("to_user_id") as string;
    const subject = (formData.get("subject") as string)?.trim() || null;
    const body = (formData.get("body") as string)?.trim();

    if (!toUserId) return { success: false, error: "Recipient required." };
    if (!body || body.length < 3) return { success: false, error: "Message too short." };

    const { error } = await supabase.from("admin_messages").insert({
      from_admin_id: adminUser.id,
      to_user_id: toUserId,
      subject,
      body,
    });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteAdminMessageAction(id: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("admin_messages").delete().eq("id", id);
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserActivityOverviewAction() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Last 30 days window
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: students } = await supabase
      .from("users")
      .select("id, roll_number, full_name, email, last_seen_at, last_page_visited")
      .eq("is_onboarded", true)
      .order("last_seen_at", { ascending: false, nullsFirst: false });

    const { data: activityCounts } = await supabase
      .from("user_activity")
      .select("user_id")
      .gte("created_at", thirtyDaysAgo);

    const countsByUser = (activityCounts || []).reduce((acc: any, r) => {
      acc[r.user_id] = (acc[r.user_id] || 0) + 1;
      return acc;
    }, {});

    const results = (students || []).map(s => ({
      ...s,
      activity_last_30d: countsByUser[s.id] || 0,
    }));

    return { success: true, students: results };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserActivityLogAction(userId: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    return { success: true, log: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
