"use client";

import { useStudentData } from "@/components/student/StudentDataProvider";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { Clock, MapPin, User, ChevronRight, Loader2, Bot } from "lucide-react";
import Link from "next/link";
import { getTodayDateString, parseDateString, formatReadableDate } from "@/lib/utils/date";
import { useState, useTransition } from "react";
import { toggleAutoPresent } from "@/app/actions/student";

function AutoPresentCard({ initialPref }: { initialPref: any }) {
  const [isEnabled, setIsEnabled] = useState(initialPref?.is_enabled || false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    startTransition(async () => {
      try {
        await toggleAutoPresent(newValue);
      } catch (e) {
        setIsEnabled(!newValue);
        alert("Failed to update Auto-Present mode.");
      }
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 mt-4 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">Auto-Present</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Marked present for past classes.
          </p>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
            isEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        >
          {isPending && <Loader2 className="absolute top-1 left-[14px] w-4 h-4 text-white animate-spin z-10" />}
          <span
            className={`inline-block w-4 h-4 bg-white dark:bg-slate-900 rounded-full transition-transform transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            } mt-1`}
          />
        </button>
      </div>
    </div>
  );
}

export default function StudentHomePage() {
  const { dashboardData: data, isLoading } = useStudentData();

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading student profile and daily schedule...</p>
      </div>
    );
  }

  const { profile, todayClasses, activeExam, subjectAttendance, autoPresentPref } = data;

  const todayStr = getTodayDateString();
  const dateObj = parseDateString(todayStr);
  const dateStr = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Calculate exam countdown days
  let countdownDays: number | null = null;
  if (activeExam?.exam_date) {
    const examDate = new Date(activeExam.exam_date);
    const now = new Date();
    const diffTime = examDate.getTime() - now.getTime();
    countdownDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Good Morning</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium pt-0.5">
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

      {/* Auto-Present Toggle Card */}
      <AutoPresentCard initialPref={autoPresentPref} />

      {data?.batchPhoto && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <img 
            src={data.batchPhoto.url} 
            alt="MBBS 2024 Batch" 
            className="w-full h-auto object-cover"
          />
          {data.batchPhoto.caption && (
            <p className="text-xs text-slate-500 dark:text-slate-400 px-4 py-3 text-center">
              {data.batchPhoto.caption}
            </p>
          )}
        </div>
      )}

      {/* 3. TODAY'S SESSIONS TIMELINE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>Today's Sessions</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
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
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 text-center flex-shrink-0 pt-0.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.start_time.slice(0, 5)}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{c.end_time.slice(0, 5)}</p>
                  </div>
                  <div className="border-l-2 border-slate-200 dark:border-slate-800 pl-3 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700">
                        {c.subject?.code || "MBBS"}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {c.class_type} · {c.batch_scope}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                      {c.topic || c.subject?.name}
                    </p>
                    {c.faculty && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.faculty}</p>
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
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">No classes listed for today.</p>
          </div>
        )}
      </div>

      {/* 4. MY ATTENDANCE SUMMARY */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              My Attendance Summary
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Official NMC minimum requirement is 75%</p>
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
            {subjectAttendance.map((sub: any) => {
              if (sub.is_split) {
                const theoryPct = sub.theory?.total ? sub.theory.percentage : 0;
                const practicalPct = sub.practical?.total ? sub.practical.percentage : 0;
                return (
                  <div
                    key={sub.subject_id}
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-1.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sub.subject_name}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        Combined: {sub.percentage}%
                      </span>
                    </div>

                    {/* Theory Breakdown */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Theory:{" "}
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {sub.theory?.total ? `${theoryPct}%` : "—"}
                          </span>{" "}
                          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            ({sub.theory?.attended || 0}/{sub.theory?.total || 0})
                          </span>
                        </span>
                        {sub.theory?.total > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              theoryPct >= 75
                                ? "bg-emerald-100 text-emerald-800"
                                : theoryPct >= 65
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {theoryPct}%
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            theoryPct >= 75
                              ? "bg-emerald-500"
                              : theoryPct >= 65
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, theoryPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Practical Breakdown */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Practical:{" "}
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {sub.practical?.total ? `${practicalPct}%` : "—"}
                          </span>{" "}
                          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            ({sub.practical?.attended || 0}/{sub.practical?.total || 0})
                          </span>
                        </span>
                        {sub.practical?.total > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              practicalPct >= 75
                                ? "bg-emerald-100 text-emerald-800"
                                : practicalPct >= 65
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {practicalPct}%
                          </span>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            practicalPct >= 75
                              ? "bg-emerald-500"
                              : practicalPct >= 65
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, practicalPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={sub.subject_id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
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
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {sub.attended} attended / {sub.total} sessions
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Attendance percentages will calculate automatically once classes are marked.
          </p>
        )}
      </div>
    </div>
  );
}
