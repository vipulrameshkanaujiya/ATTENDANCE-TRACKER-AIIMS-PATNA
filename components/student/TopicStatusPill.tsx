"use client";

import { updateTopicProgress } from "@/app/actions/student";
import { TopicProgressStatus } from "@/types/database";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import clsx from "clsx";

interface TopicStatusPillProps {
  topicId: string;
  initialStatus: TopicProgressStatus;
}

export function TopicStatusPill({ topicId, initialStatus }: TopicStatusPillProps) {
  const [status, setStatus] = useState<TopicProgressStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const cycleStatus = () => {
    let nextStatus: TopicProgressStatus = "NOT_STARTED";
    if (status === "NOT_STARTED") nextStatus = "LEARNING";
    else if (status === "LEARNING") nextStatus = "COMPLETED";
    else nextStatus = "NOT_STARTED";

    setStatus(nextStatus);
    startTransition(async () => {
      try {
        await updateTopicProgress(topicId, nextStatus);
      } catch (err) {
        setStatus(initialStatus);
        console.error("Failed to update topic status", err);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={cycleStatus}
      disabled={isPending}
      className={clsx(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition select-none min-h-[36px]",
        status === "COMPLETED" && "bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100",
        status === "LEARNING" && "bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100",
        status === "NOT_STARTED" && "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
      )}
      title="Tap to change status"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : status === "COMPLETED" ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      ) : status === "LEARNING" ? (
        <Clock className="w-3.5 h-3.5 text-amber-600" />
      ) : (
        <Circle className="w-3.5 h-3.5 text-slate-400" />
      )}
      <span>
        {status === "COMPLETED" ? "Completed" : status === "LEARNING" ? "Learning" : "Not Started"}
      </span>
    </button>
  );
}
