"use client";

import Link from "next/link";
import { UserProfile } from "@/types/database";
import { User, Shield } from "lucide-react";

interface TopHeaderProps {
  profile: UserProfile | null;
}

export function TopHeader({ profile }: TopHeaderProps) {
  const roll = profile?.roll_number || "24___";
  const batchName = profile?.batch?.name || "Batch";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
      <div className="w-full max-w-5xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 
              className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis tracking-tight"
              title="Attendance Tracker by Vipul K"
            >
              Attendance Tracker by Vipul K
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate whitespace-nowrap">
              AIIMS Patna · Phase-2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Batch Badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
            {batchName} · {roll}
          </span>

          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* Avatar Profile Link */}
          <Link
            href="/profile"
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="My Profile"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-600" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
