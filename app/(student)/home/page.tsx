import { getStudentDashboardData } from "@/app/actions/student";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { Calendar, Clock, MapPin, User, BookOpen, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function StudentHomePage() {
  const data = await getStudentDashboardData();

  if (!data) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500">Loading student profile and daily schedule...</p>
      </div>
    );
  }

  const { profile, todayClasses, nextClass, activeExam, subjectAttendance } = data;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Calculate exam countdown days
  let countdownDays: number | null = null;
  if (activeExam?.exam_date) {
    const examDate = new Date(activeExam.exam_date);
    const diffTime = examDate.getTime() - now.getTime();
    countdownDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            MBBS Phase-2 Utility
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Good Morning</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium pt-0.5">
            {dateStr}
          </p>
        </div>

        {/* Exam Countdown Widget */}
        {activeExam && countdownDays !== null && (
          <div className="mt-2 sm:mt-0 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm flex items-center justify-between sm:justify-start gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                {activeExam.title}
              </p>
              <p className="text-xl font-extrabold leading-none">
                {countdownDays} <span className="text-xs font-normal text-blue-100">DAYS LEFT</span>
              </p>
            </div>
            <div className="text-right sm:text-left text-[11px] text-blue-100 border-l border-blue-400/40 pl-3">
              <p className="font-semibold">{new Date(activeExam.exam_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</p>
              <p className="text-[10px] text-blue-200">Pre-Prof Exam</p>
            </div>
          </div>
        )}
      </div>

      {/* 2. NEXT CLASS Hero Card */}
      {nextClass ? (
        <div className="bg-white rounded-2xl border-2 border-blue-600/20 shadow-sm p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-bl-xl">
            Next Session
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                {nextClass.subject?.code || "CLASS"}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {nextClass.class_type} · {nextClass.batch_scope}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {nextClass.topic || nextClass.subject?.name || "Scheduled Class"}
              </h3>
              {nextClass.faculty && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{nextClass.faculty}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{nextClass.start_time.slice(0, 5)} – {nextClass.end_time.slice(0, 5)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{nextClass.venue || "Lecture Hall 2"}</span>
                </span>
              </div>

              {/* 1-Tap Attendance */}
              <AttendanceToggle
                classId={nextClass.id}
                initialStatus={nextClass.attendance_status}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-1">
          <p className="text-sm font-semibold text-slate-800">No more classes scheduled today</p>
          <p className="text-xs text-slate-500">Enjoy your self-directed learning time!</p>
        </div>
      )}

      {/* 3. TODAY'S SESSIONS TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Today's Sessions</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
              {todayClasses.length}
            </span>
          </h2>
          <Link
            href="/schedule"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Full Schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {todayClasses.length > 0 ? (
          <div className="space-y-2.5">
            {todayClasses.map((c: any) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 text-center flex-shrink-0 pt-0.5">
                    <p className="text-xs font-bold text-slate-900">{c.start_time.slice(0, 5)}</p>
                    <p className="text-[11px] text-slate-400">{c.end_time.slice(0, 5)}</p>
                  </div>
                  <div className="border-l-2 border-slate-200 pl-3 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700">
                        {c.subject?.code || "MBBS"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {c.class_type} · {c.batch_scope}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                      {c.topic || c.subject?.name}
                    </p>
                    {c.faculty && (
                      <p className="text-xs text-slate-500">{c.faculty}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end sm:justify-start">
                  <AttendanceToggle
                    classId={c.id}
                    initialStatus={c.attendance_status}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500">No classes listed for today.</p>
          </div>
        )}
      </div>

      {/* 4. MY ATTENDANCE SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              My Attendance Summary
            </h2>
            <p className="text-xs text-slate-500">Official NMC minimum requirement is 75%</p>
          </div>
          <Link
            href="/attendance"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {subjectAttendance.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjectAttendance.map((sub: any) => (
              <div
                key={sub.subject_id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {sub.subject_name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      sub.percentage >= 75
                        ? "bg-emerald-100 text-emerald-800"
                        : sub.percentage >= 65
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sub.percentage >= 75
                        ? "bg-emerald-500"
                        : sub.percentage >= 65
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {sub.attended} attended / {sub.total} sessions
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Attendance percentages will calculate automatically once classes are marked.
          </p>
        )}
      </div>
    </div>
  );
}
