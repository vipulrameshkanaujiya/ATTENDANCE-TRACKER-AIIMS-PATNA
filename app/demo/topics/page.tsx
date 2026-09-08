"use client";

import { useState } from "react";
import { demoCurriculum } from "@/lib/demo/mock-data";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function DemoTopicsPage() {
  const [curriculum, setCurriculum] = useState(demoCurriculum);
  const [activeCode, setActiveCode] = useState("PATH");

  const cycleStatus = (subCode: string, unitIndex: number, topicId: string) => {
    setCurriculum((prev) =>
      prev.map((s) => {
        if (s.code !== subCode) return s;
        const updatedUnits = s.units.map((u, uIdx) => {
          if (uIdx !== unitIndex) return u;
          const updatedTopics = u.topics.map((t) => {
            if (t.id !== topicId) return t;
            let nextStatus: "NOT_STARTED" | "LEARNING" | "COMPLETED" = "NOT_STARTED";
            if (t.status === "NOT_STARTED") nextStatus = "LEARNING";
            else if (t.status === "LEARNING") nextStatus = "COMPLETED";
            else nextStatus = "NOT_STARTED";
            return { ...t, status: nextStatus };
          });
          return { ...u, topics: updatedTopics };
        });
        return { ...s, units: updatedUnits };
      })
    );
  };

  const activeSubject = curriculum.find((s) => s.code === activeCode) || curriculum[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Syllabus & Topic Tracker
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Personal learning progress (independent of class attendance)
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {curriculum.map((sub) => (
          <button
            key={sub.code}
            onClick={() => setActiveCode(sub.code)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeCode === sub.code ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-700 border border-slate-200"
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeSubject.units.map((u, uIdx) => (
          <div key={u.unit_number} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Unit {u.unit_number}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{u.title}</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">{u.topics.length} topics</span>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              {u.topics.map((t) => (
                <div key={t.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl transition">
                  <div>
                    <span className="text-[11px] font-mono font-semibold text-slate-400 mr-2">{t.code}</span>
                    <span className="text-sm font-semibold text-slate-800">{t.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => cycleStatus(activeSubject.code, uIdx, t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition select-none ${
                      t.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                        : t.status === "LEARNING"
                        ? "bg-amber-50 text-amber-700 border border-amber-300"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {t.status === "COMPLETED" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : t.status === "LEARNING" ? (
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{t.status === "COMPLETED" ? "Completed" : t.status === "LEARNING" ? "Learning" : "Not Started"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
