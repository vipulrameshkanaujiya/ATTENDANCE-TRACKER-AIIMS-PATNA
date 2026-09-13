"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    // Disable in development mode
    if (process.env.NODE_ENV === "development") {
      setIsVisible(false);
      return;
    }

    // Check if this is a PWA launch (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check if it's a fresh session (not navigation)
    const hasShownSplash = sessionStorage.getItem("splash-shown");

    // Only show splash on first launch in this session OR when launched as PWA
    if (hasShownSplash && !isStandalone) {
      setIsVisible(false);
      return;
    }

    // Minimum splash time: 1.8s animation
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, 1800);

    // Safety fallback: Never block user for more than 4.5s even if network is slow or on non-student route
    const maxTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("splash-shown", "true");
      }, 500);
    }, 4500);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Hide when both: min time elapsed AND data ready
  useEffect(() => {
    if (!isVisible || isFading) return;

    const dismissSplash = () => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem("splash-shown", "true");
      }, 500);
    };

    if (minTimeElapsed && (window as any).__BUNKBUDDY_DATA_READY__) {
      dismissSplash();
      return;
    }

    const handleDataReady = () => {
      if (minTimeElapsed) {
        dismissSplash();
      }
    };

    window.addEventListener("bunkbuddy:data-ready", handleDataReady);

    const checkData = setInterval(() => {
      if ((window as any).__BUNKBUDDY_DATA_READY__ && minTimeElapsed) {
        clearInterval(checkData);
        dismissSplash();
      }
    }, 100);

    return () => {
      window.removeEventListener("bunkbuddy:data-ready", handleDataReady);
      clearInterval(checkData);
    };
  }, [minTimeElapsed, isVisible, isFading]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 transition-opacity duration-500 ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          {/* Ring pulse glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-xl opacity-60 animate-pulse-glow" />

          {/* Logo */}
          <img
            src="/logo.png"
            alt="BunkBuddy"
            className="relative w-28 h-28 rounded-3xl shadow-2xl object-cover animate-logo-entrance"
          />
        </div>

        {/* App name */}
        <div className="text-center space-y-1 animate-text-entrance">
          <h1 className="text-3xl font-black text-white tracking-tight">
            BunkBuddy
          </h1>
          <p className="text-xs font-medium text-indigo-300/80 uppercase tracking-[0.3em]">
            AIIMS Patna
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2 mt-4 animate-text-entrance-delay">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
