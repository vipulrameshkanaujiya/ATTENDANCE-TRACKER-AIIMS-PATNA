"use client";

import { useState, useTransition, useEffect } from "react";
import { HistoricalSubjectCode, StudentHistoricalAttendance } from "@/types/database";
import {
  adminGetStudentHistoricalAttendanceAction,
  adminUpdateStudentHistoricalAttendanceAction,
} from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { History, X, Save, Loader2, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";

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

interface AdminHistoricalAttendanceModalProps {
  studentId: string;
  studentName: string;
  rollNumber: string;
}

export function AdminHistoricalAttendanceModal({
  studentId,
  studentName,
  rollNumber,
}: AdminHistoricalAttendanceModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isOneTimeSet, setIsOneTimeSet] = useState(true);

  const [formData, setFormData] = useState<Record<HistoricalSubjectCode, FormEntryState>>({
    PATH: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
    PHARMA: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
    MICRO: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
    FMT: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
    CFM: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
  });

  const handleOpen = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await adminGetStudentHistoricalAttendanceAction(studentId);
    if (res.success && res.data) {
      const state: Record<HistoricalSubjectCode, FormEntryState> = {
        PATH: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
        PHARMA: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
        MICRO: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
        FMT: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
        CFM: { theoryAttended: "0", theoryTotal: "0", practicalAttended: "0", practicalTotal: "0" },
      };

      let locked = true;
      res.data.forEach((rec) => {
        if (state[rec.subject_code]) {
          state[rec.subject_code] = {
            theoryAttended: String(rec.theory_attended || 0),
            theoryTotal: String(rec.theory_total || 0),
            practicalAttended: String(rec.practical_attended || 0),
            practicalTotal: String(rec.practical_total || 0),
          };
          if (!rec.is_one_time_set) {
            locked = false;
          }
        }
      });

      setFormData(state);
      setIsOneTimeSet(locked);
    } else if (res.error) {
      setErrorMessage(res.error);
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (
    subject: HistoricalSubjectCode,
    field: keyof FormEntryState,
    val: string
  ) => {
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

    const entriesToSave: Array<{
      subject_code: HistoricalSubjectCode;
      theory_attended: number;
      theory_total: number;
      practical_attended: number;
      practical_total: number;
      is_one_time_set: boolean;
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
        is_one_time_set: isOneTimeSet,
      });
    }

    startTransition(async () => {
      const res = await adminUpdateStudentHistoricalAttendanceAction(studentId, entriesToSave);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to update student historical attendance.");
      } else {
        setSuccessMessage("Historical attendance successfully updated!");
        setTimeout(() => {
          handleClose();
          router.refresh();
        }, 700);
      }
    });
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        title="Admin Override: View & Edit Historical Attendance"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold transition shadow-xs"
      >
        <History className="w-3 h-3" />
        <span>Historical Data</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Historical Attendance Override
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student: <strong className="text-slate-800 font-semibold">{studentName}</strong> (Roll{" "}
                    <span className="font-mono font-bold text-slate-900">{rollNumber}</span>)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Administrative Record Override</p>
                  <p className="text-[11px] text-blue-800/90">
                    Modifying these values will update the student's pre-September baseline and record your admin user ID as the editor.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <p className="text-xs font-medium">Loading historical records...</p>
                </div>
              ) : (
                <form id="admin-historical-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
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
                      <tbody className="divide-y divide-slate-100">
                        {HISTORICAL_SUBJECTS.map((sub) => {
                          const values = formData[sub.code];
                          return (
                            <tr key={sub.code} className="hover:bg-slate-50/70">
                              <td className="p-2.5 font-medium text-slate-800">
                                <div className="font-bold text-slate-900">{sub.name}</div>
                                <span className="text-[10px] text-slate-400 font-mono uppercase">
                                  {sub.code}
                                </span>
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
                                    onChange={(e) =>
                                      handleInputChange(sub.code, "theoryAttended", e.target.value)
                                    }
                                    className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                                    placeholder="Att"
                                  />
                                  <span className="text-slate-400 font-bold">/</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-left w-20">
                                <label className="sr-only">Theory Total for {sub.name}</label>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={values.theoryTotal}
                                  onChange={(e) =>
                                    handleInputChange(sub.code, "theoryTotal", e.target.value)
                                  }
                                  className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
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
                                    onChange={(e) =>
                                      handleInputChange(sub.code, "practicalAttended", e.target.value)
                                    }
                                    className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                                    placeholder="Att"
                                  />
                                  <span className="text-slate-400 font-bold">/</span>
                                </div>
                              </td>
                              <td className="p-2.5 text-left w-20">
                                <label className="sr-only">Practical Total for {sub.name}</label>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={values.practicalTotal}
                                  onChange={(e) =>
                                    handleInputChange(sub.code, "practicalTotal", e.target.value)
                                  }
                                  className="w-16 px-2 py-1.5 text-xs text-center border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                                  placeholder="Total"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isOneTimeSet"
                      checked={isOneTimeSet}
                      onChange={(e) => setIsOneTimeSet(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isOneTimeSet" className="text-xs text-slate-700 font-medium">
                      Lock as one-time entry (student cannot modify directly)
                    </label>
                  </div>
                </form>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-historical-form"
                disabled={isPending || isLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Override...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Historical Override</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
