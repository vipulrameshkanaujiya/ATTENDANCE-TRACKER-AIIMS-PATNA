"use client";

import { useSearchParams } from "next/navigation";
import { useStudentData } from "@/components/student/StudentDataProvider";
import { AttendanceToggle } from "@/components/student/AttendanceToggle";
import { PreSeptemberAttendanceCard } from "@/components/student/PreSeptemberAttendanceCard";
import { buildSubjectAttendanceBreakdown } from "@/lib/utils/attendance";
import Link from "next/link";
import { useMemo } from "react";

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const selectedSubjectId = searchParams.get("subject") || "ALL";
  const selectedMonth = searchParams.get("month") || "";

  const { dashboardData, isLoading } = useStudentData();

  const metrics = useMemo(() => {
    if (!dashboardData) return null;
    const { allStudentAttendance: attendanceRecords, historicalAttendance: historicalRecords, allSubjects: subjects } = dashboardData;

    const septAttended = (attendanceRecords || []).filter((r: any) => r.status === "PRESENT").length;
    const septTotal = (attendanceRecords || []).length;

    let histAttended = 0;
    let histTotal = 0;
    (historicalRecords || []).forEach((h: any) => {
      histAttended += (h.theory_attended || 0) + (h.practical_attended || 0);
      histTotal += (h.theory_total || 0) + (h.practical_total || 0);
    });

    const totalAttended = septAttended + histAttended;
    const totalMarked = septTotal + histTotal;
    const overallPercentage = totalMarked > 0 ? Math.round((totalAttended / totalMarked) * 100) : 0;

    const subjectBreakdown = buildSubjectAttendanceBreakdown(
      subjects || [],
      attendanceRecords || [],
      historicalRecords
    );

    let filteredHistory = attendanceRecords || [];
    if (selectedSubjectId !== "ALL") {
      filteredHistory = filteredHistory.filter((r: any) => r.class?.subject_id === selectedSubjectId);
    }
    if (selectedMonth) {
      filteredHistory = filteredHistory.filter((r: any) => r.class?.date?.startsWith(selectedMonth));
    }

    return {
      septAttended, septTotal, histAttended, histTotal, totalAttended, totalMarked, overallPercentage, subjectBreakdown, filteredHistory
    };
  }, [dashboardData, selectedSubjectId, selectedMonth]);

  if (isLoading || !metrics || !dashboardData) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <p className="text-sm text-slate-500">Loading attendance records...</p>
      </div>
    );
  }

  const { septAttended, septTotal, histAttended, histTotal, totalAttended, totalMarked, overallPercentage, subjectBreakdown, filteredHistory } = metrics;
  const historicalRecords = dashboardData.historicalAttendance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Personal attendance record for MBBS 2nd Professional
        </p>
      </div>

      {/* Overall Attendance Metric Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Overall Attendance
          </p>
          <div className="flex items-baseline justify-center sm:justify-start gap-2">
            <span className={`text-4xl font-extrabold ${overallPercentage >= 75 ? "text-emerald-600" : overallPercentage >= 65 ? "text-amber-600" : "text-rose-600"}`}>
              {overallPercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-500">
              ({totalAttended} / {totalMarked} sessions)
            </span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            {overallPercentage >= 75
              ? "✓ Currently meeting NMC 75% exam eligibility threshold."
              : "⚠️ Below NMC 75% requirement. Prioritize upcoming clinical postings."}
          </p>
          {histTotal > 0 && (
            <p className="text-[11px] text-slate-400">
              Includes pre-September historical attendance ({histAttended}/{histTotal}) + September sessions ({septAttended}/{septTotal})
            </p>
          )}
        </div>

        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center border-8 border-slate-100 relative">
          <div
            className={`text-xl font-black ${overallPercentage >= 75 ? "text-emerald-700" : overallPercentage >= 65 ? "text-amber-700" : "text-rose-700"}`}
          >
            {overallPercentage}%
          </div>
        </div>
      </div>

      {/* Pre-September Historical Attendance Entry / Locked View */}
      <PreSeptemberAttendanceCard initialRecords={historicalRecords} />

      {/* Subject Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Subject-Wise Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(subjectBreakdown).map(([subId, stat]) => {
            const pct = stat.total > 0 ? Math.round((stat.attended / stat.total) * 100) : 0;
            const isSelected = selectedSubjectId === subId;

            if (stat.is_split) {
              const theoryPct = stat.theory?.total ? stat.theory.percentage : 0;
              const practicalPct = stat.practical?.total ? stat.practical.percentage : 0;

              return (
                <Link
                  key={subId}
                  href={`/attendance?subject=${isSelected ? "ALL" : subId}`}
                  className={`p-4 rounded-xl border transition-all text-left bg-white shadow-xs space-y-3 ${
                    isSelected
                      ? "border-blue-500 ring-2 ring-blue-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {stat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Combined: {stat.total > 0 ? `${pct}%` : "No data"}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        pct >= 75
                          ? "bg-emerald-100 text-emerald-800"
                          : pct >= 65
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {stat.total > 0 ? `${pct}%` : "—"}
                    </span>
                  </div>

                  {/* Theory Split */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Theory:{" "}
                        <span className="font-bold text-slate-900">
                          {stat.theory?.total ? `${theoryPct}%` : "—"}
                        </span>{" "}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({stat.theory?.attended || 0}/{stat.theory?.total || 0})
                        </span>
                      </span>
                      {(stat.theory?.total ?? 0) > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            theoryPct >= 75
                              ? "bg-emerald-100 text-emerald-800"
                              : theoryPct >= 65
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {theoryPct}%
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          theoryPct >= 75
                            ? "bg-emerald-500"
                            : theoryPct >= 65
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, theoryPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Practical Split */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Practical:{" "}
                        <span className="font-bold text-slate-900">
                          {stat.practical?.total ? `${practicalPct}%` : "—"}
                        </span>{" "}
                        <span className="text-[11px] font-normal text-slate-500">
                          ({stat.practical?.attended || 0}/{stat.practical?.total || 0})
                        </span>
                      </span>
                      {(stat.practical?.total ?? 0) > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            practicalPct >= 75
                              ? "bg-emerald-100 text-emerald-800"
                              : practicalPct >= 65
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {practicalPct}%
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          practicalPct >= 75
                            ? "bg-emerald-500"
                            : practicalPct >= 65
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, practicalPct)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={subId}
                href={`/attendance?subject=${isSelected ? "ALL" : subId}`}
                className={`p-4 rounded-xl border transition-all text-left bg-white shadow-xs ${
                  isSelected
                    ? "border-blue-500 ring-2 ring-blue-500/20"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    {stat.name}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      pct >= 75
                        ? "bg-emerald-100 text-emerald-800"
                        : pct >= 65
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {stat.total > 0 ? `${pct}%` : "No data"}
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      pct >= 75 ? "bg-emerald-500" : pct >= 65 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {stat.attended} attended / {stat.total} recorded
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Attendance History Section with 1-Tap Modifiers */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Attendance History ({filteredHistory.length})
          </h2>
          {selectedSubjectId !== "ALL" && (
            <Link
              href="/attendance"
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear filter
            </Link>
          )}
        </div>

        {filteredHistory.length > 0 ? (
          <div className="space-y-2.5">
            {filteredHistory.map((rec: any) => (
              <div
                key={rec.id}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-700">
                      {rec.class?.subject?.code || "MBBS"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rec.class?.date || rec.marked_at).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {rec.class?.start_time?.slice(0, 5)} - {rec.class?.end_time?.slice(0, 5)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {rec.class?.topic || rec.class?.subject?.name || "MBBS Session"}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span>{rec.class?.class_type} · {rec.class?.batch_scope}</span>
                    {rec.class?.class_type === "Practical" ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                        Practical
                      </span>
                    ) : ["Lecture", "SDL", "Integration", "Tutorial"].includes(rec.class?.class_type) ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                        Theory
                      </span>
                    ) : null}
                  </p>
                </div>

                {/* 1-Tap Instant Modifier (no midnight restriction!) */}
                <AttendanceToggle
                  classId={rec.class_id}
                  initialStatus={rec.status}
                  compact
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-xs text-slate-500">No attendance records found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}
