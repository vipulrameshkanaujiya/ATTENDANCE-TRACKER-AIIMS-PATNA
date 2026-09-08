import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { TimetableImportClient } from "@/components/admin/TimetableImportClient";
import { FileUp, ShieldCheck, AlertTriangle } from "lucide-react";

export default async function AdminImportPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Fetch past import batches
  const { data: recentImports } = await supabase
    .from("timetable_imports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: subjects } = await supabase
    .from("subjects")
    .select("*")
    .order("name", { ascending: true });

  // Fetch active STAGED import and its rows if present
  const { data: stagedImport } = await supabase
    .from("timetable_imports")
    .select("*")
    .eq("status", "STAGED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let initialRows: any[] = [];
  if (stagedImport) {
    const { data: rows } = await supabase
      .from("timetable_import_rows")
      .select("*")
      .eq("import_id", stagedImport.id)
      .eq("is_deleted", false)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (rows) {
      initialRows = rows.map((r: any) => ({
        date: r.date,
        day_of_week: "",
        start_time: r.start_time,
        end_time: r.end_time,
        subject_code: r.subject_raw || "UNKNOWN",
        topic: r.topic || "",
        faculty: r.faculty,
        venue: r.venue || "Lecture Hall 2",
        class_type: r.class_type,
        batch_scope: r.batch_scope,
        parse_status: r.parse_status,
        notes: r.notes,
      }));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Timetable PDF Importer
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Upload official monthly teaching schedule PDF (AIIMS Patna Phase-2 MBBS)
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-amber-900">
            Publishing Rule: Never Auto-Publish Extracted Timetables
          </p>
          <p className="text-xs text-amber-800 leading-relaxed">
            All extracted rows are staged in a validation preview table. You must review subjects, faculty, batch allocations, and delete holidays before confirming publication to the live schedule.
          </p>
        </div>
      </div>

      {/* Interactive Import Client Component */}
      <TimetableImportClient 
        subjects={subjects || []} 
        initialStagedImport={stagedImport}
        initialRows={initialRows}
      />

      {/* Recent Imports History */}
      {recentImports && recentImports.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Import History
          </h2>
          <div className="divide-y divide-slate-100">
            {recentImports.map((imp) => (
              <div key={imp.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-800">{imp.file_name}</p>
                  <p className="text-[11px] text-slate-400">{imp.month_year}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${imp.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  {imp.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
