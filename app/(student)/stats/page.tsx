"use client";

import { useStudentData } from "@/components/student/StudentDataProvider";
import { Users, BarChart2, ShieldCheck, Award } from "lucide-react";

export default function StatsPage() {
  const { deferredData, isLoading } = useStudentData();

  if (isLoading || !deferredData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <p className="text-sm text-slate-500">Loading statistics...</p>
      </div>
    );
  }

  const stats = deferredData.stats;

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

      {/* Privacy Notice Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900 leading-relaxed">
          <strong>Privacy Preserved:</strong> All statistics are computed server-side in aggregate. No individual student names, emails, attendance records, or leaderboards are ever published.
        </p>
      </div>

      {/* High-Level Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Batch Average Attendance</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats.batch_average_attendance_pct}%
          </p>
          <p className="text-[11px] text-slate-400">
            Across all verified academic sessions this semester
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Active Students</span>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {stats.active_students_30d}
          </p>
          <p className="text-[11px] text-slate-400">
            MBBS students tracking attendance in the last 30 days
          </p>
        </div>
      </div>

      {/* Subject-Wise Batch Benchmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Subject-Wise Batch Averages
          </h2>
          <p className="text-xs text-slate-500">
            Cohort aggregate attendance rate per subject
          </p>
        </div>

        {stats.subject_averages && stats.subject_averages.length > 0 ? (
          <div className="space-y-4">
            {stats.subject_averages.map((sub: any) => (
              <div key={sub.subject_code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">{sub.subject_name}</span>
                  <span className="text-blue-700">{sub.avg_pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, sub.avg_pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl">
            <p className="text-xs text-slate-400">
              Subject benchmarks will populate as batch attendance data accumulates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
