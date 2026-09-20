"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackUserActivityAction } from "@/app/actions/student";

export function ActivityTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<{ page: string; time: number } | null>(null);

  useEffect(() => {
    // Throttle: only track if page changed OR 5 minutes passed
    const now = Date.now();
    const last = lastTrackedRef.current;
    if (last && last.page === pathname && now - last.time < 5 * 60 * 1000) {
      return;
    }

    lastTrackedRef.current = { page: pathname, time: now };
    trackUserActivityAction(pathname).catch(() => {});
  }, [pathname]);

  return null;
}
