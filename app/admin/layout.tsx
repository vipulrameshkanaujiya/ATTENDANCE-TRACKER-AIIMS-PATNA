import { requireAdmin } from "@/lib/auth/session";
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
  ShieldAlert,
  Camera
} from "lucide-react";

const adminNavItems = [
  { label: "Overview", href: "/admin", icon: Shield },
  { label: "Schedule", href: "/admin/schedule", icon: Calendar },
  { label: "Import PDF", href: "/admin/import", icon: FileUp },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Bulk Attendance", href: "/admin/bulk-attendance", icon: FileUp },
  { label: "Access Control", href: "/admin/access-control", icon: ShieldAlert },
  { label: "Batch Photo", href: "/admin/batch-photo", icon: Camera },
  { label: "Attendance", href: "/admin/attendance", icon: CheckSquare },
  { label: "Curriculum", href: "/admin/curriculum", icon: BookOpen },
  { label: "Exams", href: "/admin/exams", icon: Clock },
  { label: "Batches", href: "/admin/batches", icon: Layers },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 sm:px-6 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-100">
                  Admin Control Panel
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Single Owner
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {user.email}
              </p>
            </div>
          </div>

          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student View</span>
          </Link>
        </div>
      </header>

      {/* Admin Navigation Bar (Responsive Tabs) */}
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

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
