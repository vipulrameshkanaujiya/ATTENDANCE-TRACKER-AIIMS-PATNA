"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getStudentDashboardData, getDeferredStudentData } from "@/app/actions/student";
import { buildSubjectAttendanceBreakdown, computePathTo76 } from "@/lib/utils/attendance";

interface GlobalStudentCache {
  dashboardData: any;
  deferredData: any;
  timestamp: number;
  userId: string | null;
}

// Module-level cache (persists in memory across client-side route changes)
let globalCache: GlobalStudentCache = {
  dashboardData: null,
  deferredData: null,
  timestamp: 0,
  userId: null,
};

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function clearStudentDataCache() {
  globalCache = {
    dashboardData: null,
    deferredData: null,
    timestamp: 0,
    userId: null,
  };
}

interface StudentDataContextType {
  dashboardData: any;
  data: any; // Alias for convenience
  deferredData: any;
  isLoading: boolean;
  loading: boolean; // Alias for convenience
  isStale: boolean;
  refresh: () => Promise<void>;
  updateAttendanceLocally: (classId: string, newStatus: "PRESENT" | "ABSENT" | null) => void;
  updateAutoPresentLocally: (isEnabled: boolean) => void;
}

const StudentDataContext = createContext<StudentDataContextType | null>(null);

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const [dashboardData, setDashboardData] = useState<any>(globalCache.dashboardData);
  const [deferredData, setDeferredData] = useState<any>(globalCache.deferredData);
  // Only loading on first load if no cache is available
  const [isLoading, setIsLoading] = useState(!globalCache.dashboardData);

  const fetchAllData = useCallback(async (forceLoading = false) => {
    if (forceLoading || !globalCache.dashboardData) {
      setIsLoading(true);
    }
    try {
      const [dash, deferred] = await Promise.all([
        getStudentDashboardData(),
        getDeferredStudentData(),
      ]);

      const currentUserId = dash?.profile?.id || null;

      // Update module-level cache
      globalCache = {
        dashboardData: dash,
        deferredData: deferred,
        timestamp: Date.now(),
        userId: currentUserId,
      };

      setDashboardData(dash);
      setDeferredData(deferred);
    } catch (err) {
      console.error("Failed to fetch student data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAutoPresentLocally = useCallback((isEnabled: boolean) => {
    setDashboardData((prevDash: any) => {
      if (!prevDash) return prevDash;
      const updated = {
        ...prevDash,
        autoPresentPref: {
          ...(prevDash.autoPresentPref || {}),
          is_enabled: isEnabled,
        },
      };
      globalCache.dashboardData = updated;
      return updated;
    });
  }, []);

  const updateAttendanceLocally = useCallback((classId: string, newStatus: "PRESENT" | "ABSENT" | null) => {
    setDashboardData((prevDash: any) => {
      if (!prevDash) return prevDash;

      // 1. Find class object if we don't have it in allStudentAttendance yet
      let classObj = prevDash.todayClasses?.find((c: any) => c.id === classId);
      if (!classObj && globalCache.deferredData?.scheduleClasses) {
        classObj = globalCache.deferredData.scheduleClasses.find((c: any) => c.id === classId);
      }

      // 2. Update allStudentAttendance array
      const allAtt = [...(prevDash.allStudentAttendance || [])];
      const existingIdx = allAtt.findIndex((a: any) => a.class_id === classId);

      if (existingIdx !== -1) {
        allAtt[existingIdx] = { ...allAtt[existingIdx], status: newStatus };
      } else {
        const enrichedClassObj = classObj ? { ...classObj, subject_id: classObj.subject?.id } : { id: classId };
        allAtt.push({
          status: newStatus,
          class_id: classId,
          class: enrichedClassObj,
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

      // 4. Rebuild pathTo76
      const newPathTo76 = { ...prevDash.pathTo76 };
      const targetSubjects = ["PATH", "PHARMA", "MICRO"];
      for (const subCode of targetSubjects) {
        if (!newPathTo76[subCode]) continue;
        const breakdown = Object.values(breakdownMap).find((b: any) => b.code === subCode);
        if (!breakdown) continue;

        const predictedFutureTheory = newPathTo76[subCode].theory.predicted_future || 0;
        const predictedFuturePractical = newPathTo76[subCode].practical.predicted_future || 0;

        newPathTo76[subCode] = computePathTo76(
          breakdown,
          { theory: predictedFutureTheory, practical: predictedFuturePractical },
          0.76
        );
      }

      const nextDash = {
        ...prevDash,
        allStudentAttendance: allAtt,
        subjectAttendance: subjectAttendanceList,
        pathTo76: newPathTo76,
      };

      globalCache.dashboardData = nextDash;
      return nextDash;
    });
  }, []);

  useEffect(() => {
    const isStale = Date.now() - globalCache.timestamp > STALE_TIME;
    if (!globalCache.dashboardData) {
      // First load - blocking
      fetchAllData(true);
    } else if (isStale) {
      // Stale revalidation - background (non-blocking)
      fetchAllData(false);
    }
  }, [fetchAllData]);

  const isStale = Date.now() - globalCache.timestamp > STALE_TIME;

  return (
    <StudentDataContext.Provider
      value={{
        dashboardData,
        data: dashboardData,
        deferredData,
        isLoading,
        loading: isLoading,
        isStale,
        refresh: () => fetchAllData(true),
        updateAttendanceLocally,
        updateAutoPresentLocally,
      }}
    >
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
