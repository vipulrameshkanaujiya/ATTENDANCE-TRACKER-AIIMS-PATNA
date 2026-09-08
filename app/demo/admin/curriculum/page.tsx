"use client";

import { useState } from "react";
import { demoCurriculum } from "@/lib/demo/mock-data";
import { Plus, BookOpen, FolderPlus, FilePlus } from "lucide-react";

export default function DemoAdminCurriculumPage() {
  const [curriculum, setCurriculum] = useState(demoCurriculum);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubCode || !newSubName) return;
    setCurriculum((prev) => [
      ...prev,
      { code: newSubCode.toUpperCase(), name: newSubName, progress: 0, units: [] }
    ]);
    setNewSubCode("");
    setNewSubName("");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Curriculum & Syllabus Manager
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Add/edit subjects, units, and topics for MBBS Phase-2 (Local Preview)
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Subject</span>
          </h2>
          <form onSubmit={handleAddSubject} className="space-y-2">
            <input
              type="text"
              placeholder="Code (e.g. FMT)"
              value={newSubCode}
              onChange={(e) => setNewSubCode(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Subject Name"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
            />
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition">
              Add Subject
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
            <FolderPlus className="w-4 h-4 text-emerald-600" />
            <span>Add Unit</span>
          </h2>
          <div className="space-y-2 text-xs">
            <select className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg">
              {curriculum.map((c) => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}
            </select>
            <input type="text" placeholder="Unit Title (e.g. Hematology)" className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg" />
            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition">
              Add Unit
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
            <FilePlus className="w-4 h-4 text-amber-600" />
            <span>Add Topic</span>
          </h2>
          <div className="space-y-2 text-xs">
            <input type="text" placeholder="Topic Title" className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg" />
            <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition">
              Add Topic
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {curriculum.map((s) => (
          <div key={s.code} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-sm text-slate-900">{s.name} ({s.code})</span>
              <span className="text-xs text-slate-400">{s.units.length} units configured</span>
            </div>
            <div className="space-y-2">
              {s.units.map((u) => (
                <div key={u.unit_number} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Unit {u.unit_number}: {u.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {u.topics.map((t) => t.title).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
