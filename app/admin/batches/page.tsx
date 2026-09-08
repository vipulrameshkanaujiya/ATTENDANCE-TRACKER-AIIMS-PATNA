import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateBatchRangeAction } from "@/app/actions/admin";
import { Layers, Edit3, Save } from "lucide-react";

export default async function AdminBatchesPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: batches } = await supabase
    .from("batches")
    .select("*")
    .order("roll_min", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Batch Rules Configuration
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Dynamically adjust roll number ranges for practicals and clinical postings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(batches || []).map((b) => (
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

            <form
              action={async (formData) => {
                "use server";
                const min = parseInt(formData.get("roll_min")?.toString() || "0", 10);
                const max = parseInt(formData.get("roll_max")?.toString() || "0", 10);
                await updateBatchRangeAction(b.id, min, max);
              }}
              className="space-y-3 pt-2 border-t border-slate-100"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Roll Min</label>
                  <input
                    name="roll_min"
                    type="number"
                    defaultValue={b.roll_min}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600">Roll Max</label>
                  <input
                    name="roll_max"
                    type="number"
                    defaultValue={b.roll_max}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Update Range</span>
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
