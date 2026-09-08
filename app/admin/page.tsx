import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import Link from "next/link";
import { Users, Calendar, FileUp, CheckSquare, BookOpen, Clock, Layers, ArrowRight } from "lucide-react";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const todayStr = new Date().toISOString().slice(0, 10);

  // 1. Total Registered Students
  const { count: totalStudents } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "student");

  // 2. Classes this month
  const { count: classesThisMonth } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .gte("date", `${currentMonthPrefix}-01`);

  // 3. Active students today
  const { count: activeStudentsToday } = await supabase
    .from("attendance")
    .select("student_id", { count: "exact", head: true })
    .gte("marked_at", `${todayStr}T00:00:00.000Z`);

  const statCards = [
    {
      label: "Total Registered Students",
      value: totalStudents || 0,
      sub: "Enrolled MBBS students with linked roll numbers",
      icon: Users,
      href: "/admin/students",
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Classes This Month",
      value: classesThisMonth || 0,
      sub: `Sessions scheduled for ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
      icon: Calendar,
      href: "/admin/schedule",
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Active Attendance Today",
      value: activeStudentsToday || 0,
      sub: "Students who logged or updated attendance today",
      icon: CheckSquare,
      href: "/admin/attendance",
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Admin Dashboard Overview
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Central management console for AIIMS Patna MBBS 2024
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-2 block"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {card.value}
              </p>
              <p className="text-[11px] text-slate-400 leading-snug">
                {card.sub}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Management Action Center */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Management Controls
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/admin/import"
            className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-blue-600 text-white flex-shrink-0 shadow-xs">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                <span>Timetable PDF Importer</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload official AIIMS Patna PDF, preview parsed rows, and publish to schedule.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/schedule"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <span>Schedule & Classes</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add single sessions, edit timings, modify faculty, or cancel classes.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/curriculum"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <span>Curriculum & Topics</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage academic subjects, syllabus units, and topic checklists.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/batches"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <span>Batch Configuration</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Reconfigure roll number ranges for Batch A, Batch B, and Batch C.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/exams"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <span>Exam Countdowns</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure Pre-Prof exam dates and countdown banner display.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/students"
            className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition flex items-start gap-3 group"
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                <span>Student Directory</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review onboarded students and override batch assignments.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
