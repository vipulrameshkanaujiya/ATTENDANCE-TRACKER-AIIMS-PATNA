"use client";
import { useEffect, useRef } from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";
import { parseDateString } from "@/lib/utils/date";

interface ScheduleDateNavProps {
  currentView: "day" | "week" | "month";
  selectedDate: string;
  todayStr: string;
  onChangeView: (view: "day" | "week" | "month") => void;
  onChangeDate: (date: string) => void;
}

export function ScheduleDateNav({
  currentView,
  selectedDate,
  todayStr,
  onChangeView,
  onChangeDate
}: ScheduleDateNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const selectedD = parseDateString(selectedDate);
  const todayD = parseDateString(todayStr);

  // Wide range: Sep 1 → Nov 30, 2026
  const days: Date[] = [];
  let current = new Date("2026-09-01");
  const end = new Date("2026-11-30");
  while (current <= end) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }

  // Auto-scroll to center the active day
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const scrollLeft = active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [selectedDate]);

  const handleViewChange = (newView: "day" | "week" | "month") => {
    onChangeView(newView);
  };

  const handleDateChange = (day: Date) => {
    const str = format(day, "yyyy-MM-dd");
    onChangeView(currentView);
    onChangeDate(str);
  };

  return (
    <div className="space-y-3">
      {/* 1. Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Class Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            AIIMS Patna MBBS Batch 2024 (Phase-2)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl self-start sm:self-auto">
          {(["day", "week", "month"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => handleViewChange(view)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                currentView === view
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: Today + Calendar picker */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => handleDateChange(todayD)}
          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
        >
          Today
        </button>

        <input
          type="date"
          value={format(selectedD, "yyyy-MM-dd")}
          onChange={(e) => {
            if (e.target.value) handleDateChange(new Date(e.target.value));
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Row 2: Swipeable Date Slider */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs py-3">
        {/* Gradient fades on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none rounded-l-xl" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none rounded-r-xl" />

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {days.map((day) => {
            const isActive = isSameDay(day, selectedD);
            const isToday = isSameDay(day, todayD);

            return (
              <button
                key={day.toISOString()}
                ref={isActive ? activeRef : null}
                onClick={() => handleDateChange(day)}
                className={`flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-2xl snap-center transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md scale-105"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider ${
                    isActive ? "text-indigo-200" : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {format(day, "EEE")}
                </span>
                <span className="text-lg font-black mt-0.5">
                  {format(day, "d")}
                </span>
                {isToday && !isActive && (
                  <span className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
