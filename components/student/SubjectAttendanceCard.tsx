"use client";

import Link from "next/link";
import { SubjectAttendanceBreakdown } from "@/lib/utils/attendance";
import clsx from "clsx";

interface SubjectAttendanceCardProps {
  stat: SubjectAttendanceBreakdown;
  isSelected?: boolean;
}

export function SubjectAttendanceCard({ stat, isSelected = false }: SubjectAttendanceCardProps) {
  const pct = stat.total > 0 ? Math.round((stat.attended / stat.total) * 100) : 0;

  if (stat.is_split) {
    const theoryPct = stat.theory?.total ? stat.theory.percentage : 0;
    const practicalPct = stat.practical?.total ? stat.practical.percentage : 0;

    return (
      <Link
        href={`/attendance?subject=${isSelected ? "ALL" : stat.id}`}
        className={clsx(
          "p-4 rounded-xl border transition-all text-left bg-white dark:bg-slate-900 shadow-xs space-y-3",
          isSelected
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {stat.name}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Combined: {stat.total > 0 ? `${pct}%` : "No data"}
            </span>
          </div>
          <span
            className={clsx(
              "text-xs font-bold px-2 py-0.5 rounded-md",
              pct >= 75
                ? "bg-emerald-100 text-emerald-800"
                : pct >= 65
                ? "bg-amber-100 text-amber-800"
                : "bg-rose-100 text-rose-800"
            )}
          >
            {stat.total > 0 ? `${pct}%` : "—"}
          </span>
        </div>

        {/* Theory Split */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Theory:{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {stat.theory?.total ? `${theoryPct}%` : "—"}
              </span>{" "}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                ({stat.theory?.attended || 0}/{stat.theory?.total || 0})
              </span>
            </span>
            {(stat.theory?.total ?? 0) > 0 && (
              <span
                className={clsx(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  theoryPct >= 75
                    ? "bg-emerald-100 text-emerald-800"
                    : theoryPct >= 65
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                )}
              >
                {theoryPct}%
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                theoryPct >= 75
                  ? "bg-emerald-500"
                  : theoryPct >= 65
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
              style={{ width: `${Math.min(100, theoryPct)}%` }}
            />
          </div>
        </div>

        {/* Practical Split */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Practical:{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {stat.practical?.total ? `${practicalPct}%` : "—"}
              </span>{" "}
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                ({stat.practical?.attended || 0}/{stat.practical?.total || 0})
              </span>
            </span>
            {(stat.practical?.total ?? 0) > 0 && (
              <span
                className={clsx(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  practicalPct >= 75
                    ? "bg-emerald-100 text-emerald-800"
                    : practicalPct >= 65
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                )}
              >
                {practicalPct}%
              </span>
            )}
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                practicalPct >= 75
                  ? "bg-emerald-500"
                  : practicalPct >= 65
                  ? "bg-amber-500"
                  : "bg-rose-500"
              )}
              style={{ width: `${Math.min(100, practicalPct)}%` }}
            />
          </div>
        </div>
      </Link>
    );
  }

  // Non-split cards
  return (
    <Link
      href={`/attendance?subject=${isSelected ? "ALL" : stat.id}`}
      className={clsx(
        "p-4 rounded-xl border transition-all text-left bg-white dark:bg-slate-900 shadow-xs",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {stat.name}
        </span>
        <span
          className={clsx(
            "text-xs font-bold px-2 py-0.5 rounded-md",
            pct >= 75
              ? "bg-emerald-100 text-emerald-800"
              : pct >= 65
              ? "bg-amber-100 text-amber-800"
              : "bg-rose-100 text-rose-800"
          )}
        >
          {stat.total > 0 ? `${pct}%` : "No data"}
        </span>
      </div>

      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            pct >= 75 ? "bg-emerald-500" : pct >= 65 ? "bg-amber-500" : "bg-rose-500"
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        {stat.attended} attended / {stat.total} recorded
      </p>
    </Link>
  );
}
