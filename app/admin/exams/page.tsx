import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { upsertExamAction } from "@/app/actions/admin";
import { Clock, Plus, Calendar, Save } from "lucide-react";

export default async function AdminExamsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from("exams")
    .select("*")
    .order("exam_date", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Exam Countdown Management
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Create and modify exam records displayed on student dashboard countdown banner
        </p>
      </div>

      {/* Add / Update Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add / Update Exam Date</span>
        </h2>

        <form action={upsertExamAction} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Exam Title</label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. PRE-PROF"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Exam Date</label>
            <input
              name="exam_date"
              type="date"
              required
              defaultValue="2026-11-04"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <input
              name="description"
              type="text"
              placeholder="e.g. 2nd Professional Examination"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Exam Record</span>
            </button>
          </div>
        </form>
      </div>

      {/* Current Exams List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Configured Exam Countdowns
        </h2>

        <div className="divide-y divide-slate-100">
          {(exams || []).map((ex) => (
            <div key={ex.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{ex.title}</p>
                <p className="text-xs text-slate-500">{ex.description || "No description"}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  {ex.exam_date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
