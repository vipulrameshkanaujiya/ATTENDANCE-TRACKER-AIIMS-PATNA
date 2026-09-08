import { createClient } from "@/lib/supabase/server";
import { requireOnboarded } from "@/lib/auth/session";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { ClassSession } from "@/types/database";
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";

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
  const currentView = params.view || "today";
  const selectedDate = params.date || new Date().toISOString().split("T")[0];

  const supabase = await createClient();
  const studentBatch = profile?.batch?.name || "Batch A";

  // Build date range based on view
  let query = supabase
    .from("classes")
    .select("*, subject:subjects(*)")
    .in("batch_scope", ["ALL", studentBatch])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (currentView === "today" || currentView === "day") {
    const targetDate = currentView === "today" ? new Date().toISOString().split("T")[0] : selectedDate;
    query = query.eq("date", targetDate);
  } else if (currentView === "week") {
    // 7 days from selected date
    const d = new Date(selectedDate);
    const startOfWeek = new Date(d);
    startOfWeek.setDate(d.getDate() - d.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    query = query
      .gte("date", startOfWeek.toISOString().split("T")[0])
      .lte("date", endOfWeek.toISOString().split("T")[0]);
  } else if (currentView === "month") {
    const d = new Date(selectedDate);
    const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
    query = query.gte("date", firstDay).lte("date", lastDay);
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
      {/* Header & View Tabs */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Class Schedule
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Filtered for <span className="text-blue-700 font-semibold">{studentBatch}</span> and Batch-Wide Lectures
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
            {(["today", "day", "week", "month"] as const).map((view) => (
              <Link
                key={view}
                href={`/schedule?view=${view}&date=${selectedDate}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  currentView === view
                    ? "bg-white text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {view}
              </Link>
            ))}
          </div>
        </div>

        {/* Date Selector Navigation for Day / Week / Month */}
        {currentView !== "today" && (
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>Viewing: {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </span>

            <input
              type="date"
              defaultValue={selectedDate}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Schedule List */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([date, dayClasses]) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-14 z-20 bg-slate-50/95 backdrop-blur-sm py-1 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                  {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                </span>
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
            <p className="text-sm font-semibold text-slate-700">No classes found for this timeframe</p>
            <p className="text-xs text-slate-400">
              Classes will appear once published by the batch administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
