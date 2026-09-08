"use client";

import { useState } from "react";
import { demoExam } from "@/lib/demo/mock-data";
import { Clock, Save, Plus } from "lucide-react";

export default function DemoAdminExamsPage() {
  const [exam, setExam] = useState(demoExam);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Exam Countdown Management
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure exam records displayed on student dashboard banner
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
          ✓ Exam countdown updated in demo state!
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Configured Exam Record</span>
        </h2>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Exam Title</label>
            <input
              type="text"
              value={exam.title}
              onChange={(e) => setExam({ ...exam, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Exam Date</label>
            <input
              type="date"
              value={exam.exam_date}
              onChange={(e) => setExam({ ...exam, exam_date: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <input
              type="text"
              value={exam.description}
              onChange={(e) => setExam({ ...exam, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Exam Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
