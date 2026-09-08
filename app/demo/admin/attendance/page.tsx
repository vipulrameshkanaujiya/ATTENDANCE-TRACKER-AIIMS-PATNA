"use client";

import { useState } from "react";
import { demoAttendanceHistory } from "@/lib/demo/mock-data";

export default function DemoAdminAttendancePage() {
  const [logs, setLogs] = useState(demoAttendanceHistory);

  const correctStatus = (id: string, newStatus: "PRESENT" | "ABSENT") => {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Attendance Oversight & Correction
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Review batch logs and correct student records (Local Preview)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Records ({logs.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Session & Date</th>
                <th className="p-3">Student Batch</th>
                <th className="p-3">Current Status</th>
                <th className="p-3 text-right">Admin Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <span className="font-bold text-blue-700">{log.code}</span>
                    <p className="font-semibold text-slate-800">{log.topic}</p>
                    <p className="text-[11px] text-slate-400">{log.date} · {log.time}</p>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">{log.batch}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === "PRESENT" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => correctStatus(log.id, "PRESENT")}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => correctStatus(log.id, "ABSENT")}
                        className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold border border-rose-200"
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
