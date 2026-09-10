"use client";

import { toggleAttendance } from "@/app/actions/student";
import { AttendanceStatus } from "@/types/database";
import { Check, X } from "lucide-react";
import { useState } from "react";
import { useStudentData } from "@/components/student/StudentDataProvider";
import clsx from "clsx";

interface AttendanceToggleProps {
  classId: string;
  initialStatus: AttendanceStatus | null;
  compact?: boolean;
}

export function AttendanceToggle({ classId, initialStatus, compact = false }: AttendanceToggleProps) {
  const [status, setStatus] = useState<AttendanceStatus | null>(initialStatus);
  const { updateAttendanceLocally } = useStudentData();

  const handleToggle = (clickedStatus: AttendanceStatus) => {
    // If clicking the currently selected status, deselect it (send null)
    const newStatus = status === clickedStatus ? null : clickedStatus;

    // 1. Optimistic UI update locally (component level)
    setStatus(newStatus);
    
    // 2. Optimistic UI update globally (context level)
    updateAttendanceLocally(classId, newStatus);

    // 3. Fire server action in background (no await blocking UI)
    toggleAttendance(classId, newStatus).catch((err) => {
      // 4. Rollback on network/permission error
      setStatus(initialStatus);
      updateAttendanceLocally(classId, initialStatus);
      alert("Failed to save attendance, please try again");
      console.error("Failed to mark attendance", err);
    });
  };

  return (
    <div className={clsx("flex items-center gap-1.5", compact ? "p-0.5" : "p-1 bg-slate-100 dark:bg-slate-800 rounded-xl")}>
      <button
        type="button"
        onClick={() => handleToggle("PRESENT")}
        className={clsx(
          "flex items-center justify-center gap-1 font-semibold transition-all select-none",
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
        onClick={() => handleToggle("ABSENT")}
        className={clsx(
          "flex items-center justify-center gap-1 font-semibold transition-all select-none",
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
    </div>
  );
}
