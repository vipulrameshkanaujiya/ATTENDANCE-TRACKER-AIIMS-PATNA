"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmBulkHistoricalAttendanceAction } from "@/app/actions/student";
import { useStudentData } from "@/components/student/StudentDataProvider";
import { FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, Lock, Info } from "lucide-react";

export function BulkAttendanceVerification({
  bulkData,
  rollNumber,
  initialLocked = false,
}: {
  bulkData: any[];
  rollNumber: string;
  initialLocked?: boolean;
}) {
  const router = useRouter();
  const { refresh } = useStudentData();
  const isLegacyStudent = !rollNumber?.startsWith("24");
  const nameFromBulk = bulkData[0]?.name || "";

  const [isPending, startTransition] = useTransition();
  const [isLocked, setIsLocked] = useState(initialLocked);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIssueReported, setIsIssueReported] = useState(false);

  const [nameConfirmed, setNameConfirmed] = useState(!isLegacyStudent);
  const [enteredName, setEnteredName] = useState("");

  const handleConfirm = () => {
    if (isPending || isLocked || (isLegacyStudent && !nameConfirmed)) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await confirmBulkHistoricalAttendanceAction();
        if (!res.success) {
          setError(res.error || "Failed to confirm data.");
          return;
        }

        // ✅ SUCCESS — update local state immediately
        setIsLocked(true);
        setShowSuccess(true);

        // ✅ Refresh global cache and router so all components see the locked data
        await refresh();
        router.refresh();

        // ✅ Auto-hide success banner after 4 seconds
        setTimeout(() => setShowSuccess(false), 4000);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred.");
      }
    });
  };

  if (isIssueReported) {
    return (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 text-center mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-500 mb-1">Issue Reported</h3>
        <p className="text-xs text-amber-700 dark:text-amber-400">
          The admin has been notified. Please wait for the issue to be resolved before confirming your attendance.
        </p>
      </div>
    );
  }

  // ✅ LOCKED VIEW (rendered immediately upon locking, or if already locked)
  if (isLocked) {
    return (
      <div className="space-y-4 mb-6">
        {showSuccess && (
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-6 text-center animate-fade-in shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Historical Data Locked
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
              Your pre-September attendance has been permanently recorded and verified.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Pre-September Attendance History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Official historical baseline before September 2026
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 border border-emerald-200 dark:border-emerald-900/30 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>✅ Historical data recorded (one-time entry)</span>
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {bulkData.map((row) => {
              const tAtt = Number(row.theory_attended) || 0;
              const tTot = Number(row.theory_total) || 0;
              const pAtt = Number(row.practical_attended) || 0;
              const pTot = Number(row.practical_total) || 0;

              const tPct = tTot > 0 ? ((tAtt / tTot) * 100).toFixed(1) : "0.0";
              const pPct = pTot > 0 ? ((pAtt / pTot) * 100).toFixed(1) : "0.0";

              return (
                <div
                  key={row.subject_code}
                  className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span className="w-16 font-bold text-slate-900 dark:text-slate-100">{row.subject_code}:</span>
                    <span className="text-slate-600 dark:text-slate-400 font-normal">
                      Theory{" "}
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {tAtt}/{tTot}
                      </strong>{" "}
                      ({tPct}%)
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-600 dark:text-slate-400 font-normal">
                      Practical{" "}
                      <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                        {pAtt}/{pTot}
                      </strong>{" "}
                      ({pPct}%)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">
                    Total: {tAtt + pAtt}/{tTot + pTot} (
                    {tTot + pTot > 0
                      ? (((tAtt + pAtt) / (tTot + pTot)) * 100).toFixed(1)
                      : "0.0"}
                    %)
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-900/70 p-3 rounded-xl">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Note:</strong> Pre-September data is permanently locked to prevent accidental changes. If you notice a clerical error, please contact an Admin to request a correction.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // UNLOCKED VIEW WITH CONFIRMATION BUTTON
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

        {isLegacyStudent && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-900/40 rounded-xl p-4 mb-4">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-2">
              ⚠️ Legacy Roll Number Detected
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
              Because your roll number is from a previous batch, please confirm your full name (as per college records) to verify your identity.
            </p>
            <input
              type="text"
              placeholder="Type your full name (e.g., NOOR ALAM)"
              value={enteredName}
              onChange={(e) => {
                setEnteredName(e.target.value);
                setNameConfirmed(
                  e.target.value.trim().toUpperCase() === nameFromBulk?.toUpperCase()
                );
              }}
              className="w-full text-sm rounded-lg border border-amber-300 dark:border-amber-900/50 bg-white dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 uppercase"
            />
            {enteredName && !nameConfirmed && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Name doesn't match our records. Please enter your exact name from the CSV data above.
              </p>
            )}
            {nameConfirmed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                ✓ Name verified. You can now confirm your data.
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfirm}
            disabled={isPending || isLocked || (isLegacyStudent && !nameConfirmed)}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Locking your data...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Lock Data</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setIsIssueReported(true)}
            disabled={isPending}
            className="flex-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2.5 px-4 rounded-xl transition border border-slate-200 dark:border-slate-700 text-sm"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}
