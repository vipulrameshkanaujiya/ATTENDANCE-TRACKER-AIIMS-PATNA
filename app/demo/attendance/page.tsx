"use client";

import { useState } from "react";
import { demoAttendanceStats, demoAttendanceHistory } from "@/lib/demo/mock-data";
import { Check, X, Filter } from "lucide-react";

export default function DemoAttendancePage() {
  const [history, setHistory] = useState(demoAttendanceHistory);
  const [selectedSub, setSelectedSub] = useState<string>("ALL");

  const toggleAttendance = (id: string, newStatus: "PRESENT" | "ABSENT") => {
    setHistory((prev) =>
      prev.map((h) => (h.id === id ? { ...h, status: newStatus } : h))
    );
  };

  const filtered = selectedSub === "ALL" ? history : history.filter((h) => h.code === selectedSub);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Personal MBBS 2nd Professional attendance log
        </p>
      </div>

      {/* Overall Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Attendance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-600">{demoAttendanceStats.overall_percentage}%</span>
            <span className="text-xs text-slate-500 font-medium">({demoAttendanceStats.total_attended} / {demoAttendanceStats.total_classes} sessions)</span>
          </div>
          <p className="text-xs text-slate-500 pt-1">✓ Meeting NMC 75% minimum examination eligibility requirement.</p>
        </div>
        <div className="w-20 h-20 rounded-full border-8 border-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-lg">
          {demoAttendanceStats.overall_percentage}%
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Subject Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {demoAttendanceStats.subjects.map((s) => (
            <button
              key={s.code}
              onClick={() => setSelectedSub(selectedSub === s.code ? "ALL" : s.code)}
              className={`p-4 rounded-xl border text-left bg-white transition shadow-xs ${
                selectedSub === s.code ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{s.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{s.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.percentage}%` }} />
              </div>
              <p className="text-[11px] text-slate-400">{s.attended} attended / {s.total} sessions</p>
            </button>
          ))}
        </div>
      </div>

      {/* Attendance History with 1-Tap Modifiers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attendance History ({filtered.length})
          </h2>
          {selectedSub !== "ALL" && (
            <button onClick={() => setSelectedSub("ALL")} className="text-xs font-semibold text-blue-600 hover:underline">
              Reset filter
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700">{item.code}</span>
                  <span className="text-[11px] text-slate-400">{item.date} · {item.time}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{item.topic}</p>
                <p className="text-[11px] text-slate-500">{item.type} · {item.batch}</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => toggleAttendance(item.id, "PRESENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    item.status === "PRESENT" ? "bg-emerald-600 text-white shadow-xs" : "bg-white text-slate-600"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleAttendance(item.id, "ABSENT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    item.status === "ABSENT" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-600"
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
