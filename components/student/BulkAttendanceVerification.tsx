"use client";

import { useState, useTransition } from "react";
import { confirmBulkHistoricalAttendanceAction } from "@/app/actions/student";
import { FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function BulkAttendanceVerification({ bulkData, rollNumber }: { bulkData: any[], rollNumber: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isIssueReported, setIsIssueReported] = useState(false);

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await confirmBulkHistoricalAttendanceAction();
        if (!res.success) {
          setError(res.error || "Failed to confirm data.");
        }
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      }
    });
  };

  if (isIssueReported) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1">Issue Reported</h3>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          The admin has been notified. Please wait for the issue to be resolved before confirming your attendance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-xl overflow-hidden mb-6 relative">
      <div className="absolute top-0 right-0 p-3">
        <span className="flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
          <FileSpreadsheet className="w-3 h-3" /> Auto-Filled
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Pre-September Attendance Found
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              We found your official attendance records for roll number <strong className="font-mono text-slate-900 dark:text-slate-200">{rollNumber}</strong>. 
              Please review carefully before confirming.
            </p>
          </div>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden my-6">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Subject</th>
                <th className="px-4 py-3 font-semibold text-center">Theory</th>
                <th className="px-4 py-3 font-semibold text-center">Practical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bulkData.map((row) => (
                <tr key={row.subject_code}>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                    {row.subject_code}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">{row.theory_attended}</strong> / {row.theory_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-mono bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                      <strong className="text-slate-900 dark:text-slate-100">{row.practical_attended}</strong> / {row.practical_total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 mb-6 flex items-start gap-2 text-amber-800 dark:text-amber-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Once confirmed, this data is <strong>permanently locked</strong> and cannot be edited. 
            If you find an error, do not confirm—report the issue below.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Confirm & Lock Data
          </button>
          
          <button
            onClick={() => setIsIssueReported(true)}
            disabled={isPending}
            className="flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl transition border border-slate-200 dark:border-slate-700"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}
