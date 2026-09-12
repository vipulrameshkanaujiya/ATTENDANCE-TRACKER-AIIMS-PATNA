"use client";

import { useState, useTransition } from "react";
import { HistoricalSubjectCode, StudentHistoricalAttendance } from "@/types/database";
import { saveStudentHistoricalAttendanceAction } from "@/app/actions/student";
import { useStudentData } from "@/components/student/StudentDataProvider";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, AlertCircle, Save, Loader2, Info } from "lucide-react";

interface SubjectConfig {
  code: HistoricalSubjectCode;
  name: string;
  shortName: string;
}

const HISTORICAL_SUBJECTS: SubjectConfig[] = [
  { code: "PATH", name: "Pathology", shortName: "Path" },
  { code: "PHARMA", name: "Pharmacology", shortName: "Pharma" },
  { code: "MICRO", name: "Microbiology", shortName: "Micro" },
  { code: "FMT", name: "Forensic Medicine & Toxicology (FMT)", shortName: "FMT" },
  { code: "CFM", name: "Community & Family Medicine (CFM)", shortName: "CFM" },
];

interface FormEntryState {
  theoryAttended: string;
  theoryTotal: string;
  practicalAttended: string;
  practicalTotal: string;
}

interface PreSeptemberAttendanceCardProps {
  initialRecords: StudentHistoricalAttendance[];
}

export function PreSeptemberAttendanceCard({ initialRecords }: PreSeptemberAttendanceCardProps) {
  const router = useRouter();
  const { refresh } = useStudentData();
  const [isPending, startTransition] = useTransition();
  const [isLocked, setIsLocked] = useState(initialRecords.some((r) => r.is_one_time_set));
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Map initial records by subject code for easy lookup
  const initialMap: Record<string, StudentHistoricalAttendance> = {};
  initialRecords.forEach((r) => {
    initialMap[r.subject_code] = r;
  });

  // State for editable form inputs
  const [formData, setFormData] = useState<Record<HistoricalSubjectCode, FormEntryState>>(() => {
    const state: Record<HistoricalSubjectCode, FormEntryState> = {
      PATH: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
      PHARMA: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
      MICRO: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
      FMT: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
      CFM: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
    };

    HISTORICAL_SUBJECTS.forEach((sub) => {
      const rec = initialMap[sub.code];
      if (rec) {
        state[sub.code] = {
          theoryAttended: String(rec.theory_attended || 0),
          theoryTotal: String(rec.theory_total || 0),
          practicalAttended: String(rec.practical_attended || 0),
          practicalTotal: String(rec.practical_total || 0),
        };
      }
    });

    return state;
  });

  const handleInputChange = (
    subject: HistoricalSubjectCode,
    field: keyof FormEntryState,
    val: string
  ) => {
    // Only permit non-negative digits
    const cleaned = val.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: cleaned,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate inputs
    const entriesToSave: Array<{
      subject_code: HistoricalSubjectCode;
      theory_attended: number;
      theory_total: number;
      practical_attended: number;
      practical_total: number;
    }> = [];

    for (const sub of HISTORICAL_SUBJECTS) {
      const values = formData[sub.code];
      const tAtt = parseInt(values.theoryAttended || "0", 10);
      const tTot = parseInt(values.theoryTotal || "0", 10);
      const pAtt = parseInt(values.practicalAttended || "0", 10);
      const pTot = parseInt(values.practicalTotal || "0", 10);

      if (isNaN(tAtt) || isNaN(tTot) || tAtt < 0 || tTot < 0) {
        setErrorMessage(`Please enter valid theory numbers for ${sub.name}.`);
        return;
      }
      if (tAtt > tTot) {
        setErrorMessage(`Theory attended (${tAtt}) cannot exceed total (${tTot}) for ${sub.name}.`);
        return;
      }
      if (isNaN(pAtt) || isNaN(pTot) || pAtt < 0 || pTot < 0) {
        setErrorMessage(`Please enter valid practical numbers for ${sub.name}.`);
        return;
      }
      if (pAtt > pTot) {
        setErrorMessage(`Practical attended (${pAtt}) cannot exceed total (${pTot}) for ${sub.name}.`);
        return;
      }

      entriesToSave.push({
        subject_code: sub.code,
        theory_attended: tAtt,
        theory_total: tTot,
        practical_attended: pAtt,
        practical_total: pTot,
      });
    }

    startTransition(async () => {
      const res = await saveStudentHistoricalAttendanceAction(entriesToSave);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to record historical attendance.");
      } else {
        setIsLocked(true);
        setShowSuccess(true);
        await refresh();
        router.refresh();
        setTimeout(() => setShowSuccess(false), 4000);
      }
    });
  };

  // 1. READ-ONLY LOCKED VIEW
  if (isLocked) {
    return (
      <div className="space-y-4">
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

        {/* Formatted breakdown for the 5 subjects */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {HISTORICAL_SUBJECTS.map((sub) => {
            const rec = initialMap[sub.code];
            const tAtt = rec?.theory_attended || 0;
            const tTot = rec?.theory_total || 0;
            const pAtt = rec?.practical_attended || 0;
            const pTot = rec?.practical_total || 0;

            const tPct = tTot > 0 ? ((tAtt / tTot) * 100).toFixed(1) : "0.0";
            const pPct = pTot > 0 ? ((pAtt / pTot) * 100).toFixed(1) : "0.0";

            return (
              <div
                key={sub.code}
                className="py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span className="w-16 font-bold text-slate-900 dark:text-slate-100">{sub.shortName}:</span>
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

  // 2. EDITABLE INITIAL ENTRY VIEW
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-blue-500/20 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Pre-September Attendance History
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your total attended and total conducted classes prior to September 2026
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 border border-amber-200 dark:border-amber-900/30 self-start sm:self-auto">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>One-Time Submission</span>
        </span>
      </div>

      {/* Warning Notice Banner */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-100 space-y-0.5">
          <p className="font-semibold">⚠️ This is a one-time entry.</p>
          <p className="text-amber-800/90 text-[11px]">
            Once submitted, your pre-September attendance is permanently locked. Only an Admin can modify this data after saving. Double-check your numbers against college department records before saving.
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-blue-50/90 border border-blue-200 dark:border-blue-900/30 rounded-xl flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 dark:text-blue-100 space-y-0.5">
          <p className="font-semibold">⚠️ PHARMA Note:</p>
          <p className="text-blue-800/90 text-[11px]">
            Integration sessions count as 2 units (2 hours) + SDL as 1 unit. Make sure your historical count reflects this.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/30 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-2.5 font-semibold">Subject</th>
                <th className="p-2.5 font-semibold text-center" colSpan={2}>
                  Theory (Attended / Total)
                </th>
                <th className="p-2.5 font-semibold text-center" colSpan={2}>
                  Practical (Attended / Total)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {HISTORICAL_SUBJECTS.map((sub) => {
                const values = formData[sub.code];
                return (
                  <tr key={sub.code} className="hover:bg-slate-50/70">
                    <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{sub.name}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">{sub.code}</span>
                    </td>

                    {/* Theory Inputs */}
                    <td className="p-2.5 text-right w-24">
                      <div className="flex items-center gap-1.5 justify-end">
                        <label className="sr-only">Theory Attended for {sub.name}</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={values.theoryAttended}
                          onChange={(e) => handleInputChange(sub.code, "theoryAttended", e.target.value)}
                          className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                          placeholder="Att"
                        />
                        <span className="text-slate-400 dark:text-slate-500 font-bold">/</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-left w-20">
                      <label className="sr-only">Theory Total for {sub.name}</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={values.theoryTotal}
                        onChange={(e) => handleInputChange(sub.code, "theoryTotal", e.target.value)}
                        className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                        placeholder="Total"
                      />
                    </td>

                    {/* Practical Inputs */}
                    <td className="p-2.5 text-right w-24">
                      <div className="flex items-center gap-1.5 justify-end">
                        <label className="sr-only">Practical Attended for {sub.name}</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={values.practicalAttended}
                          onChange={(e) => handleInputChange(sub.code, "practicalAttended", e.target.value)}
                          className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                          placeholder="Att"
                        />
                        <span className="text-slate-400 dark:text-slate-500 font-bold">/</span>
                      </div>
                    </td>
                    <td className="p-2.5 text-left w-20">
                      <label className="sr-only">Practical Total for {sub.name}</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={values.practicalTotal}
                        onChange={(e) => handleInputChange(sub.code, "practicalTotal", e.target.value)}
                        className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                        placeholder="Total"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Historical Data...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Historical Data</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
