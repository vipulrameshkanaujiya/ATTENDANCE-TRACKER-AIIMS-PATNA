"use client";

import { useState } from "react";
import { demoBatches } from "@/lib/demo/mock-data";
import { Save } from "lucide-react";

export default function DemoAdminBatchesPage() {
  const [batches, setBatches] = useState(demoBatches);
  const [saved, setSaved] = useState(false);

  const handleUpdate = (id: string, min: number, max: number) => {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, roll_min: min, roll_max: max } : b))
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Batch Rules Configuration
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Dynamically adjust roll ranges for practicals and clinical postings
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
          ✓ Batch ranges updated in demo state!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {batches.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{b.name}</h2>
              {b.is_default_fallback && (
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  Fallback
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">{b.notes}</p>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Roll Min</label>
                  <input
                    type="number"
                    defaultValue={b.roll_min}
                    id={`min-${b.id}`}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Roll Max</label>
                  <input
                    type="number"
                    defaultValue={b.roll_max}
                    id={`max-${b.id}`}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const min = parseInt((document.getElementById(`min-${b.id}`) as HTMLInputElement)?.value || "0", 10);
                  const max = parseInt((document.getElementById(`max-${b.id}`) as HTMLInputElement)?.value || "0", 10);
                  handleUpdate(b.id, min, max);
                }}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Update Range</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
