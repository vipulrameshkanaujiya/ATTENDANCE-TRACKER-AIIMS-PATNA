"use client";

import { useSearchParams } from "next/navigation";
import { useStudentData } from "@/components/student/StudentDataProvider";
import { PreSeptemberAttendanceCard } from "@/components/student/PreSeptemberAttendanceCard";
import { SubjectAttendanceCard } from "@/components/student/SubjectAttendanceCard";
import { PathTo76Card } from "@/components/student/PathTo76Card";
import { buildSubjectAttendanceBreakdown } from "@/lib/utils/attendance";
import Link from "next/link";
import { useMemo } from "react";

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const selectedSubjectId = searchParams.get("subject") || "ALL";

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

    return {
      septAttended, septTotal, histAttended, histTotal, totalAttended, totalMarked, overallPercentage, subjectBreakdown
    };
  }, [dashboardData, selectedSubjectId]);

  if (isLoading || !metrics || !dashboardData) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading attendance records...</p>
      </div>
    );
  }

  const { septAttended, septTotal, histAttended, histTotal, totalAttended, totalMarked, overallPercentage, subjectBreakdown } = metrics;
  const historicalRecords = dashboardData.historicalAttendance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Attendance Tracker
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Personal attendance record for MBBS 2nd Professional
        </p>
      </div>

      {/* Pre-September Historical Attendance Entry / Locked View */}
      <PreSeptemberAttendanceCard initialRecords={historicalRecords} />

      {/* Subject Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Subject-Wise Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dashboardData?.allSubjects?.map((subject: any) => {
            const stat = subjectBreakdown?.[subject.id];
            if (!stat) return null;
            return (
              <SubjectAttendanceCard
                key={subject.id}
                stat={stat}
                isSelected={selectedSubjectId === subject.id}
              />
            );
          })}
        </div>
      </div>

      {/* Path to 76% Section */}
      {dashboardData?.pathTo76 && Object.keys(dashboardData.pathTo76).length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              📅 Path to 76% ({new Date(dashboardData.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(dashboardData.pathTo76).map(([subCode, stat]: [string, any]) => {
              const subjectName = dashboardData.allSubjects?.find((s: any) => s.code === subCode)?.name || subCode;
              return (
                <PathTo76Card
                  key={subCode}
                  subjectName={subjectName}
                  stat={stat}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
