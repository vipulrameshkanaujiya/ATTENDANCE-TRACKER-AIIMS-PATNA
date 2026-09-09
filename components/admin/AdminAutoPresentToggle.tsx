"use client";

import { useTransition } from "react";
import { adminToggleAutoPresentAction } from "@/app/actions/admin";
import { Bot, Loader2 } from "lucide-react";

export function AdminAutoPresentToggle({ studentId, isEnabled }: { studentId: string; isEnabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await adminToggleAutoPresentAction(studentId, !isEnabled);
      } catch (error) {
        alert("Failed to toggle auto-present");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isEnabled ? "Disable Auto-Present" : "Enable Auto-Present"}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-semibold transition ${
        isEnabled
          ? "border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
          : "border-slate-200 text-slate-500 bg-slate-50 hover:bg-slate-100"
      }`}
    >
      {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
      <span>{isEnabled ? "Auto: ON" : "Auto: OFF"}</span>
    </button>
  );
}
