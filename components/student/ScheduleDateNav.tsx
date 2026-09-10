"use client";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw 
} from "lucide-react";
import { 
  shiftDateString, 
  getWeekRange, 
  formatReadableDate, 
  parseDateString 
} from "@/lib/utils/date";

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
  const handleViewChange = (newView: "day" | "week" | "month") => {
    onChangeView(newView);
  };

  const handleDateChange = (newDate: string) => {
    if (!newDate) return;
    onChangeView(currentView);
    onChangeDate(newDate);
  };

  const handleStepDate = (direction: -1 | 1) => {
    let delta = direction;
    if (currentView === "week") {
      delta = direction * 7;
    } else if (currentView === "month") {
      delta = direction * 30;
    }
    const nextDate = shiftDateString(selectedDate, delta);
    onChangeView(currentView);
    onChangeDate(nextDate);
  };

  const { days: weekDays } = getWeekRange(selectedDate);
  const isSelectedToday = selectedDate === todayStr;

  return (
    <div className="space-y-3">
      {/* 1. Header & View Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Class Schedule
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            AIIMS Patna MBBS Batch 2024 (Phase-2)
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          {(["day", "week", "month"] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => handleViewChange(view)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                currentView === view
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Date Navigation Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Stepper buttons & date display */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleStepDate(-1)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition focus:outline-none"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleStepDate(1)}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition focus:outline-none"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  {currentView === "month"
                    ? parseDateString(selectedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : currentView === "week"
                    ? `Week of ${formatReadableDate(weekDays[0], false)} – ${formatReadableDate(weekDays[6], false)}`
                    : formatReadableDate(selectedDate, true)}
                </span>
              </span>

              {isSelectedToday && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Today
                </span>
              )}
            </div>
          </div>

          {/* Quick jump actions & Date Picker */}
          <div className="flex items-center gap-2">
            {!isSelectedToday && (
              <button
                type="button"
                onClick={() => {
                  onChangeDate(todayStr);
                  onChangeView("day");
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Jump to Today</span>
              </button>
            )}

            {/* Native Date Picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              title="Pick a specific date"
            />
          </div>
        </div>

        {/* 3. Quick-Click Weekday Pills (Mon - Sun) */}
        <div className="pt-2 border-t border-slate-100">
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDays.map((dStr) => {
              const d = parseDateString(dStr);
              const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
              const dayNum = d.getDate();
              const isSelected = dStr === selectedDate;
              const isToday = dStr === todayStr;

              return (
                <button
                  key={dStr}
                  type="button"
                  onClick={() => handleDateChange(dStr)}
                  className={`py-1.5 px-1 rounded-lg text-center transition flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : isToday
                      ? "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                    {weekday}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold leading-tight">
                    {dayNum}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
