"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, CheckSquare, BookOpen, BarChart3 } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Schedule", href: "/schedule", icon: Calendar },
  { label: "Attendance", href: "/attendance", icon: CheckSquare },
  { label: "Stats", href: "/stats", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Fixed Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 safe-area-pb shadow-lg">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={clsx(
                  "flex flex-col items-center justify-center w-14 h-full py-1 rounded-xl transition-all",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 active:scale-95"
                )}
              >
                <div className={clsx("p-1 rounded-lg transition", isActive && "bg-blue-50 dark:bg-blue-900/40")}>
                  <Icon className={clsx("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-[1.75]")} />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Left-Hand Sidebar */}
      <aside className="hidden md:flex flex-col flex-shrink-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen z-40">
        <div className="flex flex-col flex-grow pt-6 px-4 pb-4">
          <div className="flex items-center gap-2.5 px-1 mb-8 min-w-0 overflow-hidden whitespace-nowrap">
            <img 
              src="/logo.png" 
              alt="BunkBuddy" 
              className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
              <h2 
                className="text-[13px] font-bold text-slate-900 dark:text-slate-100 leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis tracking-tight max-w-[165px] block"
                title="BunkBuddy"
              >
                BunkBuddy
              </h2>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase truncate whitespace-nowrap">
                AIIMS Patna
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/home" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={clsx(
                    "flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition",
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  )}
                >
                  <Icon className={clsx("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400 stroke-[2.2]" : "text-slate-400 dark:text-slate-500")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
