"use client";

import { useSearchParams } from "next/navigation";
import { useStudentData } from "@/components/student/StudentDataProvider";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { ScheduleDateNav } from "@/components/student/ScheduleDateNav";
import { Calendar as CalendarIcon, MapPin, User } from "lucide-react";
import { getTodayDateString, parseDateString, formatReadableDate } from "@/lib/utils/date";
import { useMemo, useState, useEffect } from "react";

function getWeekRange(dateStr: string) {
  const d = parseDateString(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  const start = new Date(d.setDate(diff));
  const end = new Date(d.setDate(diff + 6));
  return {
    startOfWeek: start.toISOString().split("T")[0],
    endOfWeek: end.toISOString().split("T")[0],
  };
}

function getMonthRange(dateStr: string) {
  const d = parseDateString(dateStr);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return {
    startOfMonth: start.toISOString().split("T")[0],
    endOfMonth: end.toISOString().split("T")[0],
  };
}

export default function SchedulePage() {
  const searchParams = useSearchParams();
  const todayStr = getTodayDateString();

  const initialDate = searchParams.get("date") || todayStr;
  const initialView = searchParams.get("view") || "day";

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">(initialView as any);

  // Sync state if URL changes (e.g. back button)
  useEffect(() => {
    const d = searchParams.get("date");
    const v = searchParams.get("view");
    if (d) setSelectedDate(d);
    if (v) setCurrentView(v as any);
  }, [searchParams]);

  const { dashboardData, deferredData, isLoading } = useStudentData();

  const filteredData = useMemo(() => {
    if (!dashboardData || !deferredData) return null;
    let classes = deferredData.scheduleClasses || [];
    const attendanceMap: Record<string, string> = {};
    (dashboardData.allStudentAttendance || []).forEach((r: any) => {
      attendanceMap[r.class_id] = r.status;
    });

    if (currentView === "day") {
      classes = classes.filter((c: any) => c.date === selectedDate);
    } else if (currentView === "week") {
      const { startOfWeek, endOfWeek } = getWeekRange(selectedDate);
      classes = classes.filter((c: any) => c.date >= startOfWeek && c.date <= endOfWeek);
    } else if (currentView === "month") {
      const { startOfMonth, endOfMonth } = getMonthRange(selectedDate);
      classes = classes.filter((c: any) => c.date >= startOfMonth && c.date <= endOfMonth);
    }

    const groupedByDate: Record<string, any[]> = {};
    classes.forEach((c: any) => {
      if (!groupedByDate[c.date]) groupedByDate[c.date] = [];
      groupedByDate[c.date].push({
        ...c,
        attendance_status: attendanceMap[c.id] || null,
      });
    });

    return { groupedByDate, hasClasses: classes.length > 0 };
  }, [dashboardData, deferredData, currentView, selectedDate, todayStr]);

  if (isLoading || !filteredData) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading schedule...</p>
      </div>
    );
  }

  const { groupedByDate, hasClasses } = filteredData;

  return (
    <div className="space-y-6">
      {/* Interactive Date Navigation Component */}
      <ScheduleDateNav
        currentView={currentView}
        selectedDate={selectedDate}
        todayStr={todayStr}
        onChangeView={(view) => {
          setCurrentView(view);
          window.history.replaceState({}, '', `/schedule?view=${view}&date=${selectedDate}`);
        }}
        onChangeDate={(date) => {
          setSelectedDate(date);
          window.history.replaceState({}, '', `/schedule?view=${currentView}&date=${date}`);
        }}
      />

      {/* Schedule List */}
      <div className="space-y-6">
        {Object.keys(groupedByDate).length > 0 ? (
          Object.entries(groupedByDate).map(([date, dayClasses]) => (
            <div key={date} className="space-y-3">
              <div className="sticky top-14 z-20 bg-slate-50/95 backdrop-blur-sm py-1 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                  {parseDateString(date).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  {formatReadableDate(date, false)}
                </span>
                {date === todayStr && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Today
                  </span>
                )}
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  ({dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"})
                </span>
              </div>

              <div className="space-y-2.5">
                {dayClasses.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 text-center flex-shrink-0 pt-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.start_time.slice(0, 5)}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.end_time.slice(0, 5)}</p>
                      </div>

                      <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-3 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-blue-700">
                            {c.subject?.code || "MBBS"}
                          </span>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {c.class_type}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {c.batch_scope}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                          {c.topic || c.subject?.name}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          {c.faculty && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                              <span>{c.faculty}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
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
          <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentView === "day"
                ? `No classes scheduled for ${formatReadableDate(selectedDate, true)}`
                : `No classes found for this timeframe`}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Classes will appear once published by the batch administrator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
