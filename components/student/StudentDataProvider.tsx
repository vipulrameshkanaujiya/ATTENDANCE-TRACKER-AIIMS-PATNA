"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getStudentDashboardData, getDeferredStudentData } from "@/app/actions/student";
import { buildSubjectAttendanceBreakdown } from "@/lib/utils/attendance";

interface StudentDataContextType {
  dashboardData: any;
  deferredData: any;
  isLoading: boolean;
  refresh: () => Promise<void>;
  updateAttendanceLocally: (classId: string, newStatus: "PRESENT" | "ABSENT") => void;
}

const StudentDataContext = createContext<StudentDataContextType | null>(null);

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [deferredData, setDeferredData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [dash, deferred] = await Promise.all([
        getStudentDashboardData(),
        getDeferredStudentData()
      ]);
      setDashboardData(dash);
      setDeferredData(deferred);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendanceLocally = (classId: string, newStatus: "PRESENT" | "ABSENT") => {
    setDashboardData((prevDash: any) => {
      if (!prevDash) return prevDash;
      
      // 1. Find class object if we don't have it in allStudentAttendance yet
      let classObj = prevDash.todayClasses?.find((c: any) => c.id === classId);
      if (!classObj && deferredData?.scheduleClasses) {
        classObj = deferredData.scheduleClasses.find((c: any) => c.id === classId);
      }

      // 2. Update allStudentAttendance array
      const allAtt = [...(prevDash.allStudentAttendance || [])];
      const existingIdx = allAtt.findIndex((a: any) => a.class_id === classId);
      
      if (existingIdx !== -1) {
        allAtt[existingIdx] = { ...allAtt[existingIdx], status: newStatus };
      } else {
        allAtt.push({
          status: newStatus,
          class_id: classId,
          class: classObj || { id: classId }
        });
      }

      // 3. Rebuild the dashboard subject breakdown
      const breakdownMap = buildSubjectAttendanceBreakdown(
        prevDash.allSubjects || [],
        allAtt,
        prevDash.historicalAttendance || []
      );
      
      const subjectAttendanceList = Object.values(breakdownMap)
        .filter((data: any) => data.total > 0)
        .map((data: any) => ({
          id: data.id,
          subject_id: data.id,
          subject_name: data.name,
          subject_code: data.code,
          color: data.color,
          is_split: data.is_split,
          attended: data.attended,
          total: data.total,
          percentage: data.percentage,
          theory: data.theory,
          practical: data.practical,
        }));

      return {
        ...prevDash,
        allStudentAttendance: allAtt,
        subjectAttendance: subjectAttendanceList
      };
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <StudentDataContext.Provider value={{ 
      dashboardData, 
      deferredData, 
      isLoading, 
      refresh: fetchAllData,
      updateAttendanceLocally 
    }}>
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData() {
  const ctx = useContext(StudentDataContext);
  if (!ctx) {
    throw new Error("useStudentData must be used within a StudentDataProvider");
  }
  return ctx;
}
