"use client";

import Link from "next/link";
import { UserProfile } from "@/types/database";
import { User, Shield, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface TopHeaderProps {
  profile: UserProfile | null;
}

export function TopHeader({ profile }: TopHeaderProps) {
  const roll = profile?.roll_number || "24___";
  const batchName = profile?.batch?.name || "Batch";

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="BunkBuddy" 
            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 
              className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis tracking-tight"
              title="BunkBuddy"
            >
              BunkBuddy
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate whitespace-nowrap">
              AIIMS Patna
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition focus:outline-none"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Batch Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            {batchName} A {roll}
          </span>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* Avatar Profile Link */}
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="My Profile"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
