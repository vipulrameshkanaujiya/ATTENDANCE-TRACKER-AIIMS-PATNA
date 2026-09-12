"use client";

import { useState, useTransition } from "react";
import { changeUserRollNumberAction } from "@/app/actions/admin";
import { Edit2, Loader2, AlertCircle } from "lucide-react";

interface ChangeRollModalProps {
  studentId: string;
  currentRoll?: string | null;
}

export function ChangeRollModal({ studentId, currentRoll }: ChangeRollModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRoll, setNewRoll] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await changeUserRollNumberAction(studentId, newRoll);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setIsOpen(false);
        setNewRoll("");
      } catch (err: any) {
        setError(err.message || "An error occurred while changing the roll number.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Change Roll Number"
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-[11px] font-semibold transition"
      >
        <Edit2 className="w-3 h-3" />
        <span>Change Roll</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Change Roll Number
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Current Roll: <span className="font-mono font-semibold">{currentRoll || "None"}</span>
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  New Roll Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={newRoll}
                  onChange={(e) => setNewRoll(e.target.value.trim())}
                  placeholder="e.g. 24001"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || newRoll.length !== 5}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                  Update Roll Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
