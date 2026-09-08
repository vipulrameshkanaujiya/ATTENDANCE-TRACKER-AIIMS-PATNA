import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { createClassAction, deleteClassAction } from "@/app/actions/admin";
import { Plus, Trash2, Calendar, Clock, MapPin, User } from "lucide-react";

export default async function AdminSchedulePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  const { data: classes } = await supabase
    .from("classes")
    .select("*, subject:subjects(*)")
    .order("date", { ascending: false })
    .order("start_time", { ascending: true })
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Schedule & Class Sessions
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Add new sessions manually or review existing schedule entries
        </p>
      </div>

      {/* Add New Session Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add New Scheduled Class</span>
        </h2>

        <form action={createClassAction} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Date</label>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Start Time</label>
            <input
              name="start_time"
              type="time"
              required
              defaultValue="08:00"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">End Time</label>
            <input
              name="end_time"
              type="time"
              required
              defaultValue="09:00"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Subject</label>
            <select
              name="subject_id"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- General / Other --</option>
              {(subjects || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-700">Topic Title</label>
            <input
              name="topic"
              type="text"
              required
              placeholder="e.g. Iron Deficiency Anemia"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Faculty</label>
            <input
              name="faculty"
              type="text"
              placeholder="e.g. Dr. Alok"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Venue</label>
            <input
              name="venue"
              type="text"
              defaultValue="Lecture Hall 2"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Class Type</label>
            <select
              name="class_type"
              required
              defaultValue="Lecture"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {["Lecture", "SDL", "Tutorial", "Practical", "Clinical Posting", "Seminar", "Integration", "Exam", "Other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Batch Scope</label>
            <select
              name="batch_scope"
              required
              defaultValue="ALL"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">ALL (Full Batch)</option>
              <option value="Batch A">Batch A</option>
              <option value="Batch B">Batch B</option>
              <option value="Batch C">Batch C</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              Save Class to Schedule
            </button>
          </div>
        </form>
      </div>

      {/* Class List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Scheduled Sessions ({classes?.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Type & Batch</th>
                <th className="p-3">Faculty & Venue</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(classes || []).map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 whitespace-nowrap font-medium text-slate-800">
                    <div>{c.date}</div>
                    <div className="text-[11px] text-slate-400">{c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)}</div>
                  </td>
                  <td className="p-3 font-bold text-blue-700">
                    {c.subject?.code || "—"}
                  </td>
                  <td className="p-3 font-medium text-slate-900 max-w-[200px] truncate">
                    {c.topic}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-700">{c.class_type}</span>
                    <span className="text-slate-400 block text-[11px]">{c.batch_scope}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-500">
                    <div>{c.faculty || "—"}</div>
                    <div className="text-[11px] text-slate-400">{c.venue}</div>
                  </td>
                  <td className="p-3 text-right">
                    <form action={deleteClassAction.bind(null, c.id)}>
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                        title="Delete class"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
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
