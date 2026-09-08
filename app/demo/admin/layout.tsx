import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  Shield, 
  Calendar, 
  FileUp, 
  Users, 
  CheckSquare, 
  BookOpen, 
  Clock, 
  Layers, 
  ArrowLeft,
  AlertOctagon
} from "lucide-react";

function verifyLocalOnly() {
  if (process.env.VERCEL || process.env.VERCEL_ENV === "production") {
    notFound();
  }
}

const adminNavItems = [
  { label: "Overview", href: "/demo/admin", icon: Shield },
  { label: "Schedule", href: "/demo/admin/schedule", icon: Calendar },
  { label: "Import PDF", href: "/demo/admin/import", icon: FileUp },
  { label: "Students", href: "/demo/admin/students", icon: Users },
  { label: "Attendance", href: "/demo/admin/attendance", icon: CheckSquare },
  { label: "Curriculum", href: "/demo/admin/curriculum", icon: BookOpen },
  { label: "Exams", href: "/demo/admin/exams", icon: Clock },
  { label: "Batches", href: "/demo/admin/batches", icon: Layers },
];

export default function DemoAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  verifyLocalOnly();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Demo Warning Banner */}
      <div className="bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-amber-600 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 flex-shrink-0" />
          <span>LOCAL PREVIEW: Admin Mode Simulation (Simulating: vipulrameshkanaujiya@gmail.com)</span>
        </div>
        <Link
          href="/demo"
          className="px-2.5 py-1 rounded bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold uppercase tracking-wider transition"
        >
          ← Return to Student Preview
        </Link>
      </div>

      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">
                  Admin Control Panel (Preview)
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Mock Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                vipulrameshkanaujiya@gmail.com
              </p>
            </div>
          </div>

          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student View</span>
          </Link>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-6xl mx-auto flex items-center gap-1 py-2">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
