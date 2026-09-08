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

export async function getStudentDashboardData() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getUserProfile(user.id);
  if (!profile) return null;

  const supabase = await createClient();
  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
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

  // Determine "Next Class"
  const now = new Date();
  const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60;
  let nextClass = enrichedTodayClasses.find((c: ClassSession) => {
    const [h, m] = c.start_time.split(":").map(Number);
    return h * 3600 + m * 60 >= currentSeconds;
  });
  if (!nextClass && enrichedTodayClasses.length > 0) {
    nextClass = enrichedTodayClasses[0];
  }

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
