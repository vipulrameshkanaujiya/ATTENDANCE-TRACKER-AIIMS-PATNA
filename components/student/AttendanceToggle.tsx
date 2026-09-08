"use client";

import { toggleAttendance } from "@/app/actions/student";
import { AttendanceStatus } from "@/types/database";
import { Check, X, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import clsx from "clsx";

interface AttendanceToggleProps {
  classId: string;
  initialStatus: AttendanceStatus | null;
  compact?: boolean;
}

export function AttendanceToggle({ classId, initialStatus, compact = false }: AttendanceToggleProps) {
  const [status, setStatus] = useState<AttendanceStatus | null>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (newStatus: AttendanceStatus) => {
    setStatus(newStatus); // Optimistic UI update
    startTransition(async () => {
      try {
        await toggleAttendance(classId, newStatus);
      } catch (err) {
        // Rollback on network/permission error
        setStatus(initialStatus);
        console.error("Failed to mark attendance", err);
      }
    });
  };

  return (
    <div className={clsx("flex items-center gap-1.5", compact ? "p-0.5" : "p-1 bg-slate-100 rounded-xl")}>
      <button
        type="button"
        onClick={() => handleToggle("PRESENT")}
        disabled={isPending}
        className={clsx(
          "flex items-center justify-center gap-1 font-semibold transition-all select-none",
          compact
            ? "px-2.5 py-1 text-xs rounded-lg min-h-[36px]"
            : "px-3.5 py-2 text-xs rounded-lg min-h-[44px] min-w-[70px]",
          status === "PRESENT"
            ? "bg-emerald-600 text-white shadow-xs"
            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
        )}
      >
        {isPending && status === "PRESENT" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
        <span>Present</span>
      </button>

      <button
        type="button"
        onClick={() => handleToggle("ABSENT")}
        disabled={isPending}
        className={clsx(
          "flex items-center justify-center gap-1 font-semibold transition-all select-none",
          compact
            ? "px-2.5 py-1 text-xs rounded-lg min-h-[36px]"
            : "px-3.5 py-2 text-xs rounded-lg min-h-[44px] min-w-[70px]",
          status === "ABSENT"
            ? "bg-rose-600 text-white shadow-xs"
            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
        )}
      >
        {isPending && status === "ABSENT" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
        <span>Absent</span>
      </button>
    </div>
  );
}
