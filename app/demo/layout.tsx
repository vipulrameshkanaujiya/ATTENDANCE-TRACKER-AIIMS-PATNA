import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  BookOpen, 
  BarChart3, 
  User, 
  Shield, 
  AlertOctagon,
  Sparkles
} from "lucide-react";

// Security check: strictly block in public/production deployments
function verifyLocalOnly() {
  if (process.env.VERCEL || process.env.VERCEL_ENV === "production") {
    notFound();
  }
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  verifyLocalOnly();

  const navItems = [
    { label: "Home", href: "/demo", icon: Home },
    { label: "Schedule", href: "/demo/schedule", icon: Calendar },
    { label: "Attendance", href: "/demo/attendance", icon: CheckSquare },
    { label: "Topics", href: "/demo/topics", icon: BookOpen },
    { label: "Stats", href: "/demo/stats", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Prominent Local Demo Banner */}
      <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 shadow-xs border-b border-amber-600">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>LOCAL PREVIEW / DEMO MODE (Fake Demo Student: Roll 24001 · Batch A)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium hidden sm:inline text-amber-950">
            Isolated local mock data · Database & Google OAuth bypassed
          </span>
          <Link
            href="/demo/admin"
            className="px-2.5 py-1 rounded bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold uppercase tracking-wider transition"
          >
            Preview Admin UI →
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Left-Hand Sidebar */}
        <aside className="hidden md:flex flex-col flex-shrink-0 w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-40">
          <div className="flex flex-col flex-grow pt-6 px-4 pb-4">
            <div className="flex items-center gap-2.5 px-1 mb-6 min-w-0 overflow-hidden whitespace-nowrap">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                VK
              </div>
              <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
                <h2 
                  className="text-[11px] font-bold text-slate-900 leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis tracking-tight max-w-[165px] block"
                  title="Attendance Tracker by Vipul K"
                >
                  Attendance Tracker by Vipul K
                </h2>
                <p className="text-[10px] font-semibold text-amber-700 tracking-wider uppercase truncate whitespace-nowrap">Local Preview Mode</p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition"
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p className="text-[11px] font-bold text-slate-700">Preview Mode Switcher</p>
              <Link
                href="/demo/admin"
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold block text-center transition"
              >
                Switch to Admin Demo
              </Link>
              <Link
                href="/login"
                className="w-full py-1.5 px-3 rounded-lg border border-slate-300 text-slate-600 text-[11px] font-semibold block text-center hover:bg-white transition"
              >
                Back to Real /login
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
            <div className="w-full max-w-5xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <h1 
                      className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate whitespace-nowrap overflow-hidden text-ellipsis tracking-tight"
                      title="Attendance Tracker by Vipul K"
                    >
                      Attendance Tracker by Vipul K
                    </h1>
                    <span className="text-[10px] font-black uppercase px-1.5 py-0.2 bg-amber-100 text-amber-900 border border-amber-300 rounded flex-shrink-0">
                      DEMO
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate whitespace-nowrap">
                    AIIMS Patna · MBBS 2024 (Phase-2)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  Batch A · 24001
                </span>

                <Link
                  href="/demo/profile"
                  className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-300 flex items-center justify-center text-xs font-bold hover:bg-blue-200 transition"
                  title="Demo Profile"
                >
                  DS
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-5xl p-4 sm:p-6 pb-24 md:pb-10">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 shadow-lg">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center w-14 h-full py-1 text-slate-600 hover:text-blue-600 active:scale-95 transition"
              >
                <Icon className="w-5 h-5 stroke-[2]" />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
