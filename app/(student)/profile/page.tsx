import { requireOnboarded } from "@/lib/auth/session";
import { signOutAction } from "@/app/actions/auth";
import { User, Mail, Hash, Layers, LogOut, Shield } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const { profile, user } = await requireOnboarded();

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Account details and batch assignment
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        {/* Avatar & Name */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border-2 border-blue-200 dark:border-blue-900/30 flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              profile?.full_name?.charAt(0) || "S"
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {profile?.full_name || "Medical Student"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {user.email}
            </p>
            {profile?.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md mt-1">
                <Shield className="w-3 h-3" />
                Administrator
              </span>
            )}
          </div>
        </div>

        {/* Info Rows */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Hash className="w-4 h-4 text-blue-600" />
              <span>MBBS Roll Number</span>
            </div>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
              {profile?.roll_number || "Not set"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Assigned Batch</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
              {profile?.batch?.name || "Batch A"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Google Account</span>
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[180px]">
              {user.email}
            </span>
          </div>
        </div>

        {profile?.role === "admin" && (
          <div className="pt-2">
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Go to Admin Dashboard</span>
            </Link>
          </div>
        )}

        {/* Sign Out Action */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
