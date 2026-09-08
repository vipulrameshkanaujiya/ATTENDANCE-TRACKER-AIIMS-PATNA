"use client";

import { useState } from "react";
import { demoRegisteredStudents } from "@/lib/demo/mock-data";

export default function DemoAdminStudentsPage() {
  const [students, setStudents] = useState(demoRegisteredStudents);

  const updateBatch = (id: string, newBatch: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, batch: newBatch } : s))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Registered Students Directory
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Manage enrolled MBBS students and override batch allocations (Local Preview)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Total Students: {students.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Name & Email</th>
                <th className="p-3">Batch Allocation</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">{s.roll}</td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{s.email}</p>
                  </td>
                  <td className="p-3">
                    <select
                      value={s.batch}
                      onChange={(e) => updateBatch(s.id, e.target.value)}
                      className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-2 py-1"
                    >
                      <option value="Batch A">Batch A (Roll 1-40)</option>
                      <option value="Batch B">Batch B (Roll 41-80)</option>
                      <option value="Batch C">Batch C (Roll 81+)</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-600 font-semibold">{s.status}</span>
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
