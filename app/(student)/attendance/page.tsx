import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/session";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { Subject, ClassSession } from "@/types/database";
import { CheckCircle2, Clock, Calendar, BookOpen, Filter } from "lucide-react";
import Link from "next/link";

interface AttendancePageProps {
  searchParams: Promise<{
    subject?: string;
    month?: string;
  }>;
}

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const { profile } = await requireOnboarded();
  const params = await searchParams;
  const selectedSubjectId = params.subject || "ALL";
  const selectedMonth = params.month || "";

  const supabase = await createClient();
  const studentBatch = profile?.batch?.name || "Batch A";

  // 1. Fetch all subjects for filter tabs
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("display_order", { ascending: true });

  // 2. Fetch all student attendance records
  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("*, class:classes(*, subject:subjects(*))")
    .eq("student_id", profile?.id || "")
    .order("marked_at", { ascending: false });

  // 3. Calculate Overall & Subject-wise attendance metrics
  const totalAttended = (attendanceRecords || []).filter((r: any) => r.status === "PRESENT").length;
  const totalMarked = (attendanceRecords || []).length;
  const overallPercentage = totalMarked > 0 ? Math.round((totalAttended / totalMarked) * 100) : 0;

  // Subject breakdown map
  const subjectBreakdown: Record<string, { name: string; code: string; color: string; attended: number; total: number }> = {};
  (subjects || []).forEach((s: Subject) => {
    subjectBreakdown[s.id] = { name: s.name, code: s.code, color: s.color_code, attended: 0, total: 0 };
  });

  (attendanceRecords || []).forEach((r: any) => {
    const subId = r.class?.subject_id;
    if (subId && subjectBreakdown[subId]) {
      subjectBreakdown[subId].total += 1;
      if (r.status === "PRESENT") {
        subjectBreakdown[subId].attended += 1;
      }
    }
  });

  // Filter attendance history
  let filteredHistory = attendanceRecords || [];
  if (selectedSubjectId !== "ALL") {
    filteredHistory = filteredHistory.filter((r: any) => r.class?.subject_id === selectedSubjectId);
  }
  if (selectedMonth) {
    filteredHistory = filteredHistory.filter((r: any) => r.class?.date?.startsWith(selectedMonth));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Personal attendance record for MBBS 2nd Professional
        </p>
      </div>

      {/* Overall Attendance Metric Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Attendance
          </p>
          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className={`text-4xl font-extrabold ${overallPercentage >= 75 ? "text-emerald-600" : overallPercentage >= 65 ? "text-amber-600" : "text-rose-600"}`}>
              {overallPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalAttended} / {totalMarked} sessions)
            </span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            {overallPercentage >= 75
              ? "✓ Currently meeting NMC 75% exam eligibility threshold."
              : "⚠️ Below NMC 75% requirement. Prioritize upcoming clinical postings."}
          </p>
        </div>

        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-8 border-slate-100 relative">
          <div
            className={`text-xl font-black ${overallPercentage >= 75 ? "text-emerald-700" : overallPercentage >= 65 ? "text-amber-700" : "text-rose-700"}`}
          >
            {overallPercentage}%
          </div>
        </div>
      </div>

      {/* Subject Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Subject-Wise Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(subjectBreakdown).map(([subId, stat]) => {
            const pct = stat.total > 0 ? Math.round((stat.attended / stat.total) * 100) : 0;
            const isSelected = selectedSubjectId === subId;

            return (
              <Link
                key={subId}
                href={`/attendance?subject=${isSelected ? "ALL" : subId}`}
                className={`p-4 rounded-xl border transition-all text-left bg-white shadow-xs ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    {stat.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      pct >= 75
                        ? "bg-emerald-100 text-emerald-800"
                        : pct >= 65
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {stat.total > 0 ? `${pct}%` : "No data"}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 75 ? "bg-emerald-500" : pct >= 65 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {stat.attended} attended / {stat.total} recorded
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Attendance History Section with 1-Tap Modifiers */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Attendance History ({filteredHistory.length})
          </h2>
          {selectedSubjectId !== "ALL" && (
            <Link
              href="/attendance"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear filter
            </Link>
          )}
        </div>

        {filteredHistory.length > 0 ? (
          <div className="space-y-2.5">
            {filteredHistory.map((rec: any) => (
              <div
                key={rec.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700">
                      {rec.class?.subject?.code || "MBBS"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rec.class?.date || rec.marked_at).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {rec.class?.start_time?.slice(0, 5)} - {rec.class?.end_time?.slice(0, 5)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {rec.class?.topic || rec.class?.subject?.name || "MBBS Session"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {rec.class?.class_type} · {rec.class?.batch_scope}
                  </p>
                </div>

                {/* 1-Tap Instant Modifier (no midnight restriction!) */}
                <AttendanceToggle
                  classId={rec.class_id}
                  initialStatus={rec.status}
                  compact
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500">No attendance records found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
