"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getStudentDashboardData, getDeferredStudentData } from "@/app/actions/student";

interface StudentDataContextType {
  dashboardData: any;
  deferredData: any;
  isLoading: boolean;
  refresh: () => Promise<void>;
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

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <StudentDataContext.Provider value={{ dashboardData, deferredData, isLoading, refresh: fetchAllData }}>
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
