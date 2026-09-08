import { demoBatchStats } from "@/lib/demo/mock-data";
import { Users, BarChart2, ShieldCheck } from "lucide-react";

export default function DemoStatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Batch Statistics
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Anonymous, aggregate benchmarks across MBBS Batch 2024
        </p>
      </div>

      <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>Privacy Enforced:</strong> Aggregate batch-level analytics only. No student names, individual percentages, or leaderboards are displayed.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Batch Average Attendance</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{demoBatchStats.batch_average_attendance_pct}%</p>
          <p className="text-[11px] text-slate-400">Semester cohort average</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Active Students</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{demoBatchStats.active_students_30d}</p>
          <p className="text-[11px] text-slate-400">MBBS Batch 2024 students logged in the past 30 days</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Subject-Wise Cohort Averages</h2>
        <div className="space-y-4">
          {demoBatchStats.subject_averages.map((s) => (
            <div key={s.subject_code} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">{s.subject_name}</span>
                <span className="text-blue-700">{s.avg_pct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${s.avg_pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
