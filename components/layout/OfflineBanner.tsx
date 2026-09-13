"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-slide-down shadow-md">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>
        You're offline — showing cached data. Changes won't save until you're back online.
      </span>
    </div>
  );
}
