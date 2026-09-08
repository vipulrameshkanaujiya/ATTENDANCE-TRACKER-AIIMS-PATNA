"use client";

import { useState } from "react";
import { demoTodayClasses } from "@/lib/demo/mock-data";
import { Calendar, Clock, MapPin, User, Check, X, Filter } from "lucide-react";

export default function DemoSchedulePage() {
  const [view, setView] = useState<"today" | "day" | "week" | "month">("today");
  const [classes, setClasses] = useState(demoTodayClasses);

  const toggleAttendance = (id: string, newStatus: "PRESENT" | "ABSENT") => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, attendance_status: newStatus } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Class Schedule
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Filtered for <span className="text-blue-700 font-semibold">Batch A</span> and Full-Batch Lectures
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          {(["today", "day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                view === v ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="py-1 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
            Monday
          </span>
          <span className="text-sm font-bold text-slate-800">
            7 September 2026
          </span>
          <span className="text-xs text-slate-400">({classes.length} sessions)</span>
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
                <div className="border-l-2 border-slate-200 pl-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700">{c.subject_code}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {c.class_type}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{c.batch_scope}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{c.topic}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" />{c.faculty}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{c.venue}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toggleAttendance(c.id, "PRESENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    c.attendance_status === "PRESENT" ? "bg-emerald-600 text-white shadow-xs" : "bg-white text-slate-600"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleAttendance(c.id, "ABSENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    c.attendance_status === "ABSENT" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-600"
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
    </div>
  );
}
