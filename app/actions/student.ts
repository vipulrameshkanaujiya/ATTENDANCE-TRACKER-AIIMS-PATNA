"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserProfile } from "@/lib/auth/session";
import { 
  AttendanceStatus, 
  TopicProgressStatus, 
  ClassSession, 
  Subject, 
  BatchAggregateStats,
  Exam,
  StudentSubjectAttendance,
  HistoricalSubjectCode,
  StudentHistoricalAttendance,
} from "@/types/database";
import { revalidatePath } from "next/cache";
import { buildSubjectAttendanceBreakdown } from "@/lib/utils/attendance";

export async function toggleAttendance(classId: string, status: AttendanceStatus) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");

  const supabase = await createClient();

  // Upsert attendance record for current student and target class
  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        student_id: user.id,
        class_id: classId,
        status: status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,class_id" }
    )
    .select()
    .single();

  if (error) {
    throw new Error("Failed to record attendance: " + error.message);
  }

  return data;
}

export async function updateTopicProgress(topicId: string, status: TopicProgressStatus) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_topic_progress")
    .upsert(
      {
        student_id: user.id,
        topic_id: topicId,
        status: status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,topic_id" }
    )
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update topic progress: " + error.message);
  }

  revalidatePath("/home");
  revalidatePath("/topics");
  return data;
}

import { getTodayDateString, getCurrentTimeString, shiftDateString } from "@/lib/utils/date";

/**
 * Strictly returns the next upcoming session that is in the future.
 * Compares against both the date and start/end time.
 */
export async function getNextSession(
  batchName: string,
  userId?: string,
  currentDateStr?: string,
  currentTimeStr?: string
): Promise<(ClassSession & { attendance_status?: AttendanceStatus | null }) | null> {
  const supabase = await createClient();
  const dateStr = currentDateStr || getTodayDateString();
  const timeStr = currentTimeStr || getCurrentTimeString();

  // Query upcoming classes from today onwards for the student's batch
  const { data: upcomingCandidates } = await supabase
    .from("classes")
    .select("*, subject:subjects(*)")
    .gte("date", dateStr)
    .in("batch_scope", ["ALL", batchName])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(10);

  if (!upcomingCandidates || upcomingCandidates.length === 0) {
    return null;
  }

  // Find the first class that is in the future:
  // 1. If class.date > dateStr: It is on a future date.
  // 2. If class.date === dateStr: It is today, and class.end_time > timeStr (session is ongoing or upcoming).
  const nextClass = upcomingCandidates.find((c: ClassSession) => {
    if (c.date > dateStr) return true;
    if (c.date === dateStr) {
      return c.end_time > timeStr;
    }
    return false;
  });

  if (!nextClass) {
    return null;
  }

  // If user ID provided, fetch their attendance status for this class
  let attendanceStatus: AttendanceStatus | null = null;
  if (userId) {
    const { data: att } = await supabase
      .from("attendance")
      .select("status")
      .eq("student_id", userId)
      .eq("class_id", nextClass.id)
      .maybeSingle();

    if (att) {
      attendanceStatus = att.status;
    }
  }

  return {
    ...nextClass,
    attendance_status: attendanceStatus,
  };
}

export async function getStudentDashboardData() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getUserProfile(user.id);
  if (!profile) return null;

  const batchName = profile.batch?.name || "Batch A";
  
  // 1. Process Auto-Present before fetching data
  await processAutoPresent(user.id, batchName);

  const supabase = await createClient();
  const todayStr = getTodayDateString(); // YYYY-MM-DD in IST
  const currentTimeStr = getCurrentTimeString();

  // Batch network requests
  const [
    { data: todayClasses },
    { data: activeExam },
    { data: allStudentAttendance },
    { data: allSubjects },
    { data: autoPresentPref },
    historicalAttendance
  ] = await Promise.all([
    supabase
      .from("classes")
      .select("id, date, start_time, end_time, topic, class_type, batch_scope, venue, faculty, subject:subjects(id, code, name)")
      .eq("date", todayStr)
      .in("batch_scope", ["ALL", batchName])
      .order("start_time", { ascending: true }),
    supabase
      .from("exams")
      .select("id, title, exam_date, description")
      .gte("exam_date", todayStr)
      .eq("is_active", true)
      .order("exam_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("attendance")
      .select("id, class_id, status, class:classes(subject_id, date, class_type)")
      .eq("student_id", user.id),
    supabase
      .from("subjects")
      .select("id, name, code, color_code, display_order, type, semester, is_active")
      .order("display_order", { ascending: true }),
    supabase
      .from("student_auto_present_preferences")
      .select("*")
      .eq("student_id", user.id)
      .maybeSingle(),
    getStudentHistoricalAttendance(user.id)
  ]);

  const classIds = (todayClasses || []).map((c: any) => c.id);
  let attendanceMap: Record<string, AttendanceStatus> = {};
  if (classIds.length > 0) {
    const { data: attRecords } = await supabase
      .from("attendance")
      .select("class_id, status")
      .eq("student_id", user.id)
      .in("class_id", classIds);

    (attRecords || []).forEach((r: { class_id: string; status: AttendanceStatus }) => {
      attendanceMap[r.class_id] = r.status;
    });
  }

  const enrichedTodayClasses = (todayClasses || []).map((c: any) => ({
    ...c,
    attendance_status: attendanceMap[c.id] || null,
  }));

  // Determine "Next Class" strictly comparing current system date/time
  const nextClass = await getNextSession(batchName, user.id, todayStr, currentTimeStr);

  const breakdownMap = buildSubjectAttendanceBreakdown(
    (allSubjects as any) || [],
    (allStudentAttendance as any) || [],
    historicalAttendance
  );

  const subjectAttendanceList: StudentSubjectAttendance[] = Object.values(breakdownMap)
    .filter((data) => data.total > 0)
    .map((data) => ({
      id: data.id,
      subject_id: data.id,
      subject_name: data.name,
      subject_code: data.code,
      color: data.color,
      is_split: data.is_split,
      attended: data.attended,
      total: data.total,
      percentage: data.percentage,
      theory: data.theory,
      practical: data.practical,
    }));

  return {
    profile,
    todayClasses: enrichedTodayClasses,
    nextClass: nextClass || null,
    activeExam: (activeExam as Exam) || null,
    subjectAttendance: subjectAttendanceList,
    allStudentAttendance: allStudentAttendance || [],
    historicalAttendance: historicalAttendance || [],
    allSubjects: allSubjects || [],
    autoPresentPref: autoPresentPref || null,
  };
}

export async function getDeferredStudentData() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getUserProfile(user.id);
  if (!profile) return null;

  const supabase = await createClient();
  const batchName = profile.batch?.name || "Batch A";
  const todayStr = getTodayDateString();
  const d = new Date(todayStr);
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  const endOfNextMonth = new Date(d.getFullYear(), d.getMonth() + 2, 0).toISOString().split("T")[0];

  const [
    { data: scheduleClasses },
    { data: units },
    { data: progressRecords },
    { data: rawStats }
  ] = await Promise.all([
    supabase
      .from("classes")
      .select("id, date, start_time, end_time, topic, class_type, batch_scope, venue, faculty, subject:subjects(id, code, name)")
      .in("batch_scope", ["ALL", batchName])
      .gte("date", startOfMonth)
      .lte("date", endOfNextMonth)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase
      .from("units")
      .select("id, subject_id, unit_number, title, topics(id, title, topic_code, display_order)")
      .order("unit_number", { ascending: true }),
    supabase
      .from("student_topic_progress")
      .select("topic_id, status")
      .eq("student_id", user.id),
    supabase.rpc("get_batch_aggregate_stats")
  ]);

  return {
    scheduleClasses: scheduleClasses || [],
    units: units || [],
    progressRecords: progressRecords || [],
    stats: rawStats || {
      active_students_30d: 0,
      batch_average_attendance_pct: 0,
      subject_averages: [],
    }
  };
}

/**
 * Fetches pre-September historical attendance records for a student.
 * Fails gracefully if table does not exist.
 */
export async function getStudentHistoricalAttendance(
  studentId?: string
): Promise<StudentHistoricalAttendance[]> {
  try {
    const supabase = await createClient();
    let targetStudentId = studentId;

    if (!targetStudentId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];
      targetStudentId = user.id;
    }

    const { data, error } = await supabase
      .from("student_historical_attendance")
      .select("*")
      .eq("student_id", targetStudentId);

    if (error) {
      // Graceful fallback for missing table
      return [];
    }

    return (data as StudentHistoricalAttendance[]) || [];
  } catch {
    return [];
  }
}

/**
 * Saves a student's one-time historical attendance entry for the 5 split subjects.
 * Locked once submitted.
 */
export async function saveStudentHistoricalAttendanceAction(
  entries: Array<{
    subject_code: HistoricalSubjectCode;
    theory_attended: number;
    theory_total: number;
    practical_attended: number;
    practical_total: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Use createClient() for student operations to ensure student auth context and cookies are used
    const supabase = await createClient();

    // 2. Obtain authenticated user directly from the client session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated. Please log in to record your attendance." };
    }

    // 3. Check if one-time entry has already been locked for this student
    const { data: existingRecords, error: checkError } = await supabase
      .from("student_historical_attendance")
      .select("is_one_time_set")
      .eq("student_id", user.id)
      .eq("is_one_time_set", true);

    if (checkError && checkError.code !== "PGRST205") {
      console.warn("Notice checking historical attendance:", checkError.message);
    }

    if (existingRecords && existingRecords.length > 0) {
      return {
        success: false,
        error: "Historical attendance has already been recorded as a one-time entry. Only an administrator can modify this data.",
      };
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
        return {
          success: false,
          error: `Theory attended (${tAtt}) cannot exceed total (${tTot}) for ${entry.subject_code}`,
        };
      }
      if (isNaN(pAtt) || isNaN(pTot) || pAtt < 0 || pTot < 0) {
        return { success: false, error: `Invalid practical values for ${entry.subject_code}` };
      }
      if (pAtt > pTot) {
        return {
          success: false,
          error: `Practical attended (${pAtt}) cannot exceed total (${pTot}) for ${entry.subject_code}`,
        };
      }
    }

    // 4. Upsert records explicitly with student_id: user.id (matching auth.uid()) and specific RLS error capture
    for (const entry of entries) {
      const { error: upsertError } = await supabase
        .from("student_historical_attendance")
        .upsert(
          {
            student_id: user.id, // CRITICAL: Must match auth.uid()
            subject_code: entry.subject_code,
            theory_attended: Number(entry.theory_attended) || 0,
            theory_total: Number(entry.theory_total) || 0,
            practical_attended: Number(entry.practical_attended) || 0,
            practical_total: Number(entry.practical_total) || 0,
            is_one_time_set: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "student_id,subject_code" }
        );

      if (upsertError) {
        console.error(`Historical attendance upsert error for ${entry.subject_code}:`, upsertError);

        // Specific handling for Row-Level Security violation
        if (
          upsertError.code === "42501" ||
          upsertError.message?.toLowerCase().includes("row-level security") ||
          upsertError.message?.toLowerCase().includes("violates row-level security policy")
        ) {
          return {
            success: false,
            error: `Row-level security violation for ${entry.subject_code}: ${upsertError.message} (student_id: ${user.id}). Please verify that table RLS policies permit INSERT/UPDATE for auth.uid().`,
          };
        }

        return {
          success: false,
          error: `Failed to save historical attendance for ${entry.subject_code}: ${upsertError.message}`,
        };
      }
    }

    revalidatePath("/attendance");
    revalidatePath("/home");
    revalidatePath("/admin/students");

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in saveStudentHistoricalAttendanceAction:", err);
    return { success: false, error: err?.message || "An unexpected error occurred while saving historical attendance." };
  }
}
export async function toggleAutoPresent(isEnabled: boolean) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required");
  const supabase = await createClient();
  const todayStr = getTodayDateString();

  const { error } = await supabase
    .from("student_auto_present_preferences")
    .upsert(
      {
        student_id: user.id,
        is_enabled: isEnabled,
        enabled_from: isEnabled ? todayStr : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id" }
    );
  if (error) throw new Error("Failed to update auto-present preference: " + error.message);
  return { success: true };
}

export async function processAutoPresent(userId: string, batchName: string) {
  const supabase = await createClient();
  const todayStr = getTodayDateString();

  const { data: pref } = await supabase
    .from("student_auto_present_preferences")
    .select("*")
    .eq("student_id", userId)
    .single();

  if (!pref || !pref.is_enabled || !pref.enabled_from) return;

  // Fetch all classes since enabled_from to today
  const { data: classes } = await supabase
    .from("classes")
    .select("id")
    .in("batch_scope", ["ALL", batchName])
    .gte("date", pref.enabled_from)
    .lte("date", todayStr);

  if (!classes || classes.length === 0) return;

  // Fetch existing attendance records
  const classIds = classes.map(c => c.id);
  const { data: existingAttendance } = await supabase
    .from("attendance")
    .select("class_id")
    .eq("student_id", userId)
    .in("class_id", classIds);

  const existingIds = new Set(existingAttendance?.map(a => a.class_id) || []);
  const missingClassIds = classIds.filter(id => !existingIds.has(id));

  if (missingClassIds.length === 0) return;

  // Insert PRESENT for missing classes
  const toInsert = missingClassIds.map(classId => ({
    student_id: userId,
    class_id: classId,
    status: "PRESENT",
    updated_at: new Date().toISOString(),
  }));

  await supabase.from("attendance").insert(toInsert);
}
