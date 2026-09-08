import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/session";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { ScheduleDateNav } from "@/components/student/ScheduleDateNav";
import { ClassSession } from "@/types/database";
import { 
  getTodayDateString, 
  getWeekRange, 
  getMonthRange, 
  formatReadableDate, 
  parseDateString 
} from "@/lib/utils/date";
import { Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";

interface SchedulePageProps {
  searchParams: Promise<{
    date?: string;
    view?: "today" | "day" | "week" | "month";
    subject?: string;
  }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const { profile } = await requireOnboarded();
  const params = await searchParams;
  const todayStr = getTodayDateString();

  // Selected date defaults to today in IST
  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
    ? params.date
    : todayStr;

  // View: if view is passed, use it. If user navigated to a specific date different from today without view, default to "day"
  const currentView: "today" | "day" | "week" | "month" = 
    params.view || (params.date && params.date !== todayStr ? "day" : "today");

  const supabase = await createClient();
  const studentBatch = profile?.batch?.name || "Batch A";

  // Build query filtered by batch
  let query = supabase
    .from("classes")
    .select("*, subject:subjects(*)")
    .in("batch_scope", ["ALL", studentBatch])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  // Apply date filters strictly
  if (currentView === "today") {
    query = query.eq("date", todayStr);
  } else if (currentView === "day") {
    query = query.eq("date", selectedDate);
  } else if (currentView === "week") {
    const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
    query = query.gte("date", startOfWeek).lte("date", endOfWeek);
  } else if (currentView === "month") {
    const { startOfMonth, endOfMonth } = getMonthRange(selectedDate);
    query = query.gte("date", startOfMonth).lte("date", endOfMonth);
  }

  const { data: classes } = await query;

  // Fetch student attendance for loaded classes
  const classIds = (classes || []).map((c: ClassSession) => c.id);
  let attendanceMap: Record<string, any> = {};
  if (classIds.length > 0 && profile) {
    const { data: att } = await supabase
      .from("attendance")
      .select("class_id, status")
      .eq("student_id", profile.id)
      .in("class_id", classIds);

    (att || []).forEach((r: any) => {
      attendanceMap[r.class_id] = r.status;
    });
  }

  // Group by date
  const groupedByDate: Record<string, ClassSession[]> = {};
  (classes || []).forEach((c: any) => {
    if (!groupedByDate[c.date]) groupedByDate[c.date] = [];
    groupedByDate[c.date].push({
      ...c,
      attendance_status: attendanceMap[c.id] || null,
    });
  });

  return (
    <div className="space-y-6">
      {/* Interactive Date Navigation Component */}
      <ScheduleDateNav
        currentView={currentView}
        selectedDate={selectedDate}
        todayStr={todayStr}
      />

      {/* Schedule List */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([date, dayClasses]) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-14 z-20 bg-slate-50/95 backdrop-blur-sm py-1 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                  {parseDateString(date).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {formatReadableDate(date, false)}
                </span>
                {date === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Today
                  </span>
                )}
                <span className="text-[11px] text-slate-400 font-medium">
                  ({dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"})
                </span>
              </div>

              <div className="space-y-2.5">
                {dayClasses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 text-center flex-shrink-0 pt-0.5">
                        <p className="text-xs font-bold text-slate-900">{c.start_time.slice(0, 5)}</p>
                        <p className="text-[11px] text-slate-400">{c.end_time.slice(0, 5)}</p>
                      </div>

                      <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-blue-700">
                            {c.subject?.code || "MBBS"}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {c.class_type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {c.batch_scope}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {c.topic || c.subject?.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                          {c.faculty && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.faculty}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.venue || "Lecture Hall"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-start">
                      <AttendanceToggle
                        classId={c.id}
                        initialStatus={c.attendance_status || null}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              {currentView === "today"
                ? `No classes scheduled for today (${formatReadableDate(todayStr, true)})`
                : currentView === "day"
                ? `No classes scheduled for ${formatReadableDate(selectedDate, true)}`
                : `No classes found for this timeframe`}
            </p>
            <p className="text-xs text-slate-400">
              Classes will appear once published by the batch administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
