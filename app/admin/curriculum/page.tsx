import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { createSubjectAction, createUnitAction, createTopicAction } from "@/app/actions/admin";
import { BookOpen, Plus, FolderPlus, FilePlus } from "lucide-react";

export default async function AdminCurriculumPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, units(*, topics(*))")
    .order("display_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Curriculum & Syllabus Manager
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Add/edit subjects, units, and topics for MBBS 2nd Professional
        </p>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Add Subject */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Subject</span>
          </h2>
          <form action={createSubjectAction} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Code (e.g. FMT)</label>
              <input
                name="code"
                type="text"
                required
                placeholder="FMT"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Subject Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="Forensic Medicine"
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
            >
              Add Subject
            </button>
          </form>
        </div>

        {/* 2. Add Unit */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <FolderPlus className="w-4 h-4 text-emerald-600" />
            <span>Add Unit</span>
          </h2>
          <form action={createUnitAction} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Parent Subject</label>
              <select
                name="subject_id"
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              >
                {(subjects || []).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Unit Number & Title</label>
              <div className="grid grid-cols-4 gap-1.5">
                <input
                  name="unit_number"
                  type="number"
                  defaultValue={1}
                  required
                  className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
                <input
                  name="title"
                  type="text"
                  placeholder="e.g. Toxicology"
                  required
                  className="col-span-3 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
            >
              Add Unit
            </button>
          </form>
        </div>

        {/* 3. Add Topic */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <FilePlus className="w-4 h-4 text-amber-600" />
            <span>Add Topic</span>
          </h2>
          <form action={createTopicAction} className="space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Parent Unit</label>
              <select
                name="unit_id"
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              >
                {(subjects || []).flatMap((s) =>
                  (s.units || []).map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {s.code} · Unit {u.unit_number}: {u.title}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Topic Title</label>
              <input
                name="title"
                type="text"
                placeholder="e.g. Snake Bite Envenomation"
                required
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition"
            >
              Add Topic
            </button>
          </form>
        </div>
      </div>

      {/* Curriculum Tree Listing */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Existing Subjects & Units Hierarchy
        </h2>

        {(subjects || []).map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  {s.code}
                </span>
                <span className="text-sm font-bold text-slate-900">{s.name}</span>
              </div>
              <span className="text-xs text-slate-400">
                {s.units?.length || 0} units
              </span>
            </div>

            <div className="space-y-2">
              {(s.units || []).map((u: any) => (
                <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    Unit {u.unit_number}: {u.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Topics: {(u.topics || []).map((t: any) => t.title).join(", ") || "None"}
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
