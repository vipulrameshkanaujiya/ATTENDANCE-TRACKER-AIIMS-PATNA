"use client";

import { toggleAttendance } from "@/app/actions/student";
import { AttendanceStatus } from "@/types/database";
import { Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useStudentData } from "@/components/student/StudentDataProvider";
import clsx from "clsx";

interface AttendanceToggleProps {
  classId: string;
  initialStatus: AttendanceStatus | null;
  compact?: boolean;
}

// Retry helper for transient network errors
async function saveWithRetry(classId: string, status: AttendanceStatus | null, attempt = 1): Promise<void> {
  try {
    await toggleAttendance(classId, status);
  } catch (err: any) {
    if (err?.name === "AbortError" || err?.message?.includes("aborted")) {
      throw err;
    }
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 500));
      return saveWithRetry(classId, status, attempt + 1);
    }
    throw err;
  }
}

export function AttendanceToggle({ classId, initialStatus, compact = false }: AttendanceToggleProps) {
  const [status, setStatus] = useState<AttendanceStatus | null>(initialStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const { updateAttendanceLocally } = useStudentData();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Keep internal status in sync when initialStatus prop changes from revalidation
  useEffect(() => {
    if (!isSaving) {
      setStatus(initialStatus);
    }
  }, [initialStatus, isSaving]);

  const handleToggle = async (clickedStatus: AttendanceStatus) => {
    if (isSaving) return; // Prevent double-click

    const previousStatus = status;
    const newStatus = status === clickedStatus ? null : clickedStatus;

    setError(null);

    // 1. Optimistic UI update locally (component level)
    setStatus(newStatus);
    
    // 2. Optimistic UI update globally (context level)
    updateAttendanceLocally(classId, newStatus);

    setIsSaving(true);

    // Set pending save flag in localStorage to handle fast browser reloads
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("bunkbuddy-pending-save", "1");
      }
    } catch {}

    try {
      await saveWithRetry(classId, newStatus);
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bunkbuddy-pending-save");
        }
      } catch {}
    } catch (err: any) {
      // Don't show error if component was unmounted or request was aborted by navigation/refresh
      if (!isMountedRef.current || err?.name === "AbortError" || err?.message?.includes("aborted")) {
        console.log("Save aborted due to navigation — ignoring");
        return;
      }

      // Rollback on actual network/server error
      setStatus(previousStatus);
      updateAttendanceLocally(classId, previousStatus);
      setError("Failed to save attendance. Please try again.");
      console.error("Failed to mark attendance", err);

      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bunkbuddy-pending-save");
        }
      } catch {}

      // Auto-clear error after 4 seconds
      setTimeout(() => {
        if (isMountedRef.current) {
          setError(null);
        }
      }, 4000);
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-end sm:items-start gap-1">
      <div className={clsx("flex items-center gap-1.5", compact ? "p-0.5" : "p-1 bg-slate-100 dark:bg-slate-800 rounded-xl")}>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleToggle("PRESENT")}
          className={clsx(
            "flex items-center justify-center gap-1 font-semibold transition-all select-none",
            isSaving && "opacity-75 cursor-not-allowed",
            compact
              ? "px-2.5 py-1 text-xs rounded-lg min-h-[36px]"
              : "px-3.5 py-2 text-xs rounded-lg min-h-[44px] min-w-[70px]",
            status === "PRESENT"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          )}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Present</span>
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleToggle("ABSENT")}
          className={clsx(
            "flex items-center justify-center gap-1 font-semibold transition-all select-none",
            isSaving && "opacity-75 cursor-not-allowed",
            compact
              ? "px-2.5 py-1 text-xs rounded-lg min-h-[36px]"
              : "px-3.5 py-2 text-xs rounded-lg min-h-[44px] min-w-[70px]",
            status === "ABSENT"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
          )}
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Absent</span>
        </button>

        {isSaving && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 animate-pulse font-medium whitespace-nowrap">
            Saving...
          </span>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium px-1 whitespace-nowrap">
          {error}
        </span>
      )}
    </div>
  );
}
