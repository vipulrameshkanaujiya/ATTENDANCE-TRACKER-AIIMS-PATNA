"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getUserProfile } from "@/lib/auth/session";
import { 
  AttendanceStatus, 
  TopicProgressStatus, 
  ClassSession, 
  Subject, 
  BatchAggregateStats,
  Exam 
} from "@/types/database";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/home");
  revalidatePath("/schedule");
  revalidatePath("/attendance");
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

import { getTodayDateString, getCurrentTimeString } from "@/lib/utils/date";

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

  const supabase = await createClient();
  const todayStr = getTodayDateString(); // YYYY-MM-DD in IST
  const currentTimeStr = getCurrentTimeString();
  const batchName = profile.batch?.name || "Batch A";

  // Fetch today's classes applicable to student
  const { data: todayClasses } = await supabase
    .from("classes")
    .select("*, subject:subjects(*)")
    .eq("date", todayStr)
    .in("batch_scope", ["ALL", batchName])
    .order("start_time", { ascending: true });

  // Fetch student's attendance records for today
  const classIds = (todayClasses || []).map((c: ClassSession) => c.id);
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

  const enrichedTodayClasses = (todayClasses || []).map((c: ClassSession) => ({
    ...c,
    attendance_status: attendanceMap[c.id] || null,
  }));

  // Determine "Next Class" strictly comparing current system date/time
  const nextClass = await getNextSession(batchName, user.id, todayStr, currentTimeStr);

  // Fetch active exam countdown
  const { data: activeExam } = await supabase
    .from("exams")
    .select("*")
    .eq("is_active", true)
    .order("exam_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Subject-wise attendance calculation
  const { data: allStudentAttendance } = await supabase
    .from("attendance")
    .select("status, class:classes(id, subject_id, batch_scope)")
    .eq("student_id", user.id);

  const { data: allSubjects } = await supabase
    .from("subjects")
    .select("*")
    .order("display_order", { ascending: true });

  const subjectStatsMap: Record<string, { name: string; color: string; attended: number; total: number }> = {};
  (allSubjects || []).forEach((s: Subject) => {
    subjectStatsMap[s.id] = { name: s.name, color: s.color_code, attended: 0, total: 0 };
  });

  (allStudentAttendance || []).forEach((att: any) => {
    const subId = att.class?.subject_id;
    if (subId && subjectStatsMap[subId]) {
      subjectStatsMap[subId].total += 1;
      if (att.status === "PRESENT") {
        subjectStatsMap[subId].attended += 1;
      }
    }
  });

  const subjectAttendanceList = Object.entries(subjectStatsMap)
    .filter(([_, data]) => data.total > 0)
    .map(([id, data]) => ({
      subject_id: id,
      subject_name: data.name,
      color: data.color,
      attended: data.attended,
      total: data.total,
      percentage: Math.round((data.attended / data.total) * 100),
    }));

  return {
    profile,
    todayClasses: enrichedTodayClasses,
    nextClass: nextClass || null,
    activeExam: (activeExam as Exam) || null,
    subjectAttendance: subjectAttendanceList,
  };
}
