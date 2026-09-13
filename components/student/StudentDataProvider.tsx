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
const STORAGE_KEY = "bunkbuddy-dashboard-cache";

export function clearStudentDataCache() {
  globalCache = {
    dashboardData: null,
    deferredData: null,
    timestamp: 0,
    userId: null,
  };
  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
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

  // When data is available, notify window and splash screen
  useEffect(() => {
    if (!isLoading && dashboardData) {
      if (typeof window !== "undefined") {
        (window as any).__BUNKBUDDY_DATA_READY__ = true;
        window.dispatchEvent(new Event("bunkbuddy:data-ready"));
      }
    }
  }, [isLoading, dashboardData]);

  const fetchAllData = useCallback(async (forceLoading = false) => {
    if (forceLoading && !globalCache.dashboardData) {
      setIsLoading(true);
    }
    try {
      const [dash, deferred] = await Promise.all([
        getStudentDashboardData(),
        getDeferredStudentData(),
      ]);

      if (dash) {
        const currentUserId = dash?.profile?.id || null;

        // Update module-level cache
        globalCache = {
          dashboardData: dash,
          deferredData: deferred,
          timestamp: Date.now(),
          userId: currentUserId,
        };

        // Cache dashboard and deferred data in localStorage for offline access & instant loads
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({
                dashboardData: dash,
                deferredData: deferred,
                timestamp: Date.now(),
              })
            );
          }
        } catch (e) {
          // localStorage might be full or private browsing
        }

        setDashboardData(dash);
        setDeferredData(deferred);
      }
    } catch (err) {
      console.error("Failed to fetch student data:", err);
      // Fall back to localStorage if offline
      try {
        if (typeof window !== "undefined") {
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            const cachedDash = parsed?.dashboardData || parsed?.data;
            const cachedDeferred = parsed?.deferredData;
            if (cachedDash) {
              setDashboardData(cachedDash);
              globalCache.dashboardData = cachedDash;
              if (cachedDeferred) {
                setDeferredData(cachedDeferred);
                globalCache.deferredData = cachedDeferred;
              }
              globalCache.timestamp = parsed.timestamp || Date.now();
            }
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage:", e);
      }
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
    // 1. Check if an attendance save was in-flight when user refreshed/navigated
    let hasPendingSave = false;
    if (typeof window !== "undefined") {
      try {
        hasPendingSave = Boolean(localStorage.getItem("bunkbuddy-pending-save"));
        if (hasPendingSave) {
          localStorage.removeItem("bunkbuddy-pending-save");
          localStorage.removeItem(STORAGE_KEY); // Clear stale cache
          globalCache = {
            dashboardData: null,
            deferredData: null,
            timestamp: 0,
            userId: null,
          };
        }
      } catch (e) {
        // ignore localStorage error
      }
    }

    // 2. Immediately hydrate from localStorage if memory cache is empty (and no pending save was flagged)
    if (!hasPendingSave && (!globalCache.dashboardData || !globalCache.deferredData) && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const cachedDash = parsed?.dashboardData || parsed?.data;
          const cachedDeferred = parsed?.deferredData;
          if (cachedDash) {
            setDashboardData(cachedDash);
            globalCache.dashboardData = cachedDash;
            if (cachedDeferred) {
              setDeferredData(cachedDeferred);
              globalCache.deferredData = cachedDeferred;
            }
            globalCache.timestamp = parsed.timestamp || 0;
            setIsLoading(false);
            (window as any).__BUNKBUDDY_DATA_READY__ = true;
            window.dispatchEvent(new Event("bunkbuddy:data-ready"));
          }
        }
      } catch (e) {
        // ignore localStorage error
      }
    }

    const isStale = Date.now() - globalCache.timestamp > STALE_TIME;
    if (!globalCache.dashboardData || hasPendingSave) {
      // First load without cache OR fresh recovery after in-flight save — blocking
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
