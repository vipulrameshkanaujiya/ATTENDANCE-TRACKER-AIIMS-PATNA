"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  demoStudent, 
  demoTodayClasses, 
  demoAttendanceStats, 
  demoExam, 
  demoCurriculum 
} from "@/lib/demo/mock-data";
import { 
  Clock, 
  MapPin, 
  User, 
  ChevronRight, 
  Check, 
  X, 
  CheckCircle2, 
  Sparkles, 
  Calendar 
} from "lucide-react";

export default function DemoHomePage() {
  const [classes, setClasses] = useState(demoTodayClasses);

  const toggleAttendance = (id: string, newStatus: "PRESENT" | "ABSENT") => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, attendance_status: newStatus } : c))
    );
  };

  const nextClass = classes[0];

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Countdown Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            MBBS Phase-2 Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Good Morning</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Monday · 7 September 2026
          </p>
        </div>

        {/* Dynamic Exam Countdown Pill */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-sm flex items-center justify-between sm:justify-start gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              {demoExam.title}
            </p>
            <p className="text-2xl font-black leading-none">
              {demoExam.days_left} <span className="text-xs font-normal text-blue-200">DAYS LEFT</span>
            </p>
          </div>
          <div className="text-right sm:text-left text-[11px] text-blue-100 border-l border-blue-500/40 pl-3">
            <p className="font-semibold">4 Nov 2026</p>
            <p className="text-[10px] text-blue-200">Pre-Professional Exam</p>
          </div>
        </div>
      </div>

      {/* 2. NEXT CLASS Hero Card */}
      {nextClass && (
        <div className="bg-white rounded-2xl border-2 border-blue-600/30 shadow-sm p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-bl-xl shadow-xs">
            Next Scheduled Session
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                {nextClass.subject_code}
              </span>
              <span className="text-xs font-semibold text-slate-600">
                {nextClass.class_type} · {nextClass.batch_scope}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {nextClass.topic}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{nextClass.faculty}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{nextClass.start_time.slice(0, 5)} – {nextClass.end_time.slice(0, 5)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{nextClass.venue}</span>
                </span>
              </div>

              {/* 1-Tap Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => toggleAttendance(nextClass.id, "PRESENT")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    nextClass.attendance_status === "PRESENT"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleAttendance(nextClass.id, "ABSENT")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    nextClass.attendance_status === "ABSENT"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Absent</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TODAY'S SESSIONS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Today's Sessions</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
              {classes.length}
            </span>
          </h2>
          <Link
            href="/demo/schedule"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>Full Schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {classes.map((c) => (
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
                      {c.subject_code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {c.class_type} · {c.batch_scope}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {c.topic}
                  </p>
                  <p className="text-xs text-slate-500">{c.faculty} · {c.venue}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toggleAttendance(c.id, "PRESENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    c.attendance_status === "PRESENT"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleAttendance(c.id, "ABSENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    c.attendance_status === "ABSENT"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Absent</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MY ATTENDANCE SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              My Attendance Summary
            </h2>
            <p className="text-xs text-slate-500">
              Overall: <strong className="text-emerald-600 font-bold">{demoAttendanceStats.overall_percentage}%</strong> · ({demoAttendanceStats.total_attended}/{demoAttendanceStats.total_classes} sessions)
            </p>
          </div>
          <Link
            href="/demo/attendance"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {demoAttendanceStats.subjects.map((sub: any) => {
            if (sub.is_split) {
              const theoryPct = sub.theory?.percentage || 0;
              const practicalPct = sub.practical?.percentage || 0;
              return (
                <div
                  key={sub.code}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/50 pb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      {sub.name}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Combined: {sub.percentage}%
                    </span>
                  </div>

                  {/* Theory */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Theory:{" "}
                        <span className="font-bold text-slate-900">{theoryPct}%</span>{" "}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({sub.theory?.attended}/{sub.theory?.total})
                        </span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          theoryPct >= 75
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {theoryPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          theoryPct >= 75 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${theoryPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Practical */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Practical:{" "}
                        <span className="font-bold text-slate-900">{practicalPct}%</span>{" "}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({sub.practical?.attended}/{sub.practical?.total})
                        </span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          practicalPct >= 75
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {practicalPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          practicalPct >= 75 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${practicalPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={sub.code}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {sub.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      sub.percentage >= 75
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {sub.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.percentage >= 75 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {sub.attended} attended / {sub.total} sessions
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. MY PROGRESS SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              My Syllabus Progress
            </h2>
            <p className="text-xs text-slate-500">Student self-paced topic tracking</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {demoCurriculum.map((sub) => (
            <div key={sub.code} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{sub.name}</span>
                <span className="text-xs font-bold text-blue-700">{sub.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${sub.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

