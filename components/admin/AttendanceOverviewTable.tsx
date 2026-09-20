"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, Filter, ChevronRight, X, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

interface SubjectBreakdown {
  name?: string;
  attended?: number;
  total?: number;
  percentage?: number;
  need?: number;
  predicted_future?: number;
  theory?: SubjectBreakdown;
  practical?: SubjectBreakdown;
}

interface StudentRow {
  id: string;
  roll_number: string;
  full_name: string | null;
  batch_id: string | null;
  overall_attendance_pct: number;
  classes_needed_total: number;
  classes_predicted_total: number;
  per_subject: Record<string, SubjectBreakdown>;
  last_seen_at?: string | null;
}

export function AttendanceOverviewTable({ students }: { students: StudentRow[] }) {
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("roll");
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);

  const filtered = useMemo(() => {
    let list = [...students];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(s =>
        (s.roll_number || "").toLowerCase().includes(s) ||
        (s.full_name || "").toLowerCase().includes(s)
      );
    }
    if (batchFilter !== "ALL") {
      list = list.filter(s => s.batch_id === batchFilter);
    }
    // Sort
    if (sortBy === "roll") list.sort((a,b) => a.roll_number.localeCompare(b.roll_number));
    if (sortBy === "attendance") list.sort((a,b) => b.overall_attendance_pct - a.overall_attendance_pct);
    if (sortBy === "need") list.sort((a,b) => b.classes_needed_total - a.classes_needed_total);
    return list;
  }, [students, search, batchFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by roll or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-white dark:bg-[#1A1510] text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <select
          value={batchFilter}
          onChange={e => setBatchFilter(e.target.value)}
          className="px-4 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-white dark:bg-[#1A1510] text-text"
        >
          <option value="ALL">All Batches</option>
          <option value="Batch A">Batch A</option>
          <option value="Batch B">Batch B</option>
          <option value="Batch C">Batch C</option>
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-4 py-2 text-sm rounded-xl border border-[#EDE5D9] dark:border-[#2A2018] bg-white dark:bg-[#1A1510] text-text"
        >
          <option value="roll">Sort: Roll Number</option>
          <option value="attendance">Sort: Highest Attendance</option>
          <option value="need">Sort: Most Classes Needed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#EDE5D9] dark:border-[#2A2018] bg-white dark:bg-[#1A1510] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F2ECE3] dark:bg-[#241C14] text-[#6B6259] dark:text-[#A89E92]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Roll</th>
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-center font-semibold">Attendance</th>
              <th className="px-4 py-3 text-center font-semibold">To Reach 76%</th>
              <th className="px-4 py-3 text-right font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE5D9] dark:divide-[#2A2018]">
            {filtered.map(s => {
              const pct = s.overall_attendance_pct;
              const pctColor = pct >= 76 ? "text-[#16A34A]" : pct >= 70 ? "text-[#F59E0B]" : "text-[#DC2626]";
              return (
                <tr key={s.id} className="hover:bg-[#FAF7F2] dark:hover:bg-[#241C14]">
                  <td className="px-4 py-3 font-mono font-bold text-text">{s.roll_number}</td>
                  <td className="px-4 py-3 text-text">{s.full_name || "—"}</td>
                  <td className={`px-4 py-3 text-center font-bold ${pctColor}`}>
                    {pct.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs font-semibold text-text-muted">
                      Need {s.classes_needed_total} of {s.classes_predicted_total}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedStudent(s)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                  No students match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <StudentDetailModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
}

function StudentDetailModal({ student, onClose }: { student: StudentRow; onClose: () => void }) {
  // Handle Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const pct = student.overall_attendance_pct || 0;
  const pctColor = pct >= 76 ? "text-[#16A34A]" : pct >= 70 ? "text-[#F59E0B]" : "text-[#DC2626]";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FAF7F2] dark:bg-[#1A1510] rounded-2xl border border-[#EDE5D9] dark:border-[#2A2018] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#FAF7F2] dark:bg-[#1A1510] border-b border-[#EDE5D9] dark:border-[#2A2018] p-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#1A1613] dark:text-[#F5F1EB]">
              {student.full_name || "Unknown"}
            </h2>
            <p className="text-xs font-mono text-[#6B6259] dark:text-[#A89E92] mt-0.5">
              Roll {student.roll_number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#F2ECE3] dark:hover:bg-[#241C14] transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-[#6B6259] dark:text-[#A89E92]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6">

          {/* Overall summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-[#241C14] border border-[#EDE5D9] dark:border-[#2A2018]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6259] dark:text-[#A89E92]">
                Overall Attendance
              </p>
              <p className={`text-3xl font-black mt-1 ${pctColor}`}>
                {pct.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#241C14] border border-[#EDE5D9] dark:border-[#2A2018]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6259] dark:text-[#A89E92]">
                To Reach 76%
              </p>
              <p className="text-3xl font-black mt-1 text-accent">
                {student.classes_needed_total || 0}
              </p>
              <p className="text-[10px] text-[#6B6259] dark:text-[#A89E92] mt-0.5">
                of {student.classes_predicted_total || 0} remaining classes
              </p>
            </div>
          </div>

          {/* Subject-wise breakdown */}
          <div>
            <h3 className="text-sm font-bold text-[#1A1613] dark:text-[#F5F1EB] mb-3">
              Subject-Wise Breakdown
            </h3>
            <div className="space-y-2">
              {student.per_subject && Object.keys(student.per_subject).length > 0 ? (
                Object.entries(student.per_subject).map(([subjectCode, data]) => (
                  <SubjectRow key={subjectCode} subjectCode={subjectCode} data={data} />
                ))
              ) : (
                <p className="text-xs text-[#6B6259] dark:text-[#A89E92] italic p-3 text-center">
                  No subject data available
                </p>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="pt-4 border-t border-[#EDE5D9] dark:border-[#2A2018] flex items-center justify-between text-[10px] text-[#6B6259] dark:text-[#A89E92]">
            <span>Last seen: {student.last_seen_at ? new Date(student.last_seen_at).toLocaleString() : "Never"}</span>
            <span>Batch: {student.batch_id ? student.batch_id : "Unassigned"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubjectRow({ subjectCode, data }: { subjectCode: string; data: SubjectBreakdown }) {
  const hasSplit = !!(data.theory || data.practical);
  const combined = data.percentage || 0;
  const pctColor = combined >= 76 ? "text-[#16A34A]" : combined >= 70 ? "text-[#F59E0B]" : "text-[#DC2626]";

  return (
    <div className="p-3 rounded-xl bg-white dark:bg-[#241C14] border border-[#EDE5D9] dark:border-[#2A2018]">
      {/* Subject header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[#1A1613] dark:text-[#F5F1EB]">
          {data.name || subjectCode}
        </span>
        <span className={`text-sm font-bold ${pctColor}`}>
          {combined.toFixed(1)}%
        </span>
      </div>

      {/* Theory + Practical split */}
      {hasSplit ? (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* Theory */}
          <div className="p-2.5 rounded-lg bg-[#F2ECE3] dark:bg-[#0F0C09]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6259] dark:text-[#A89E92]">
              Theory
            </p>
            <p className="text-sm font-bold text-[#1A1613] dark:text-[#F5F1EB] mt-1">
              {data.theory?.attended ?? 0} / {data.theory?.total ?? 0}
            </p>
            <p className="text-[10px] text-[#6B6259] dark:text-[#A89E92]">
              {data.theory?.percentage != null ? `${data.theory.percentage.toFixed(1)}%` : "—"}
            </p>
            {/* Path to 76 for theory */}
            {data.theory?.need != null && (
              <p className="text-[10px] font-semibold text-accent mt-1">
                Need {data.theory.need} of {data.theory.predicted_future || 0}
              </p>
            )}
          </div>

          {/* Practical */}
          <div className="p-2.5 rounded-lg bg-[#F2ECE3] dark:bg-[#0F0C09]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6259] dark:text-[#A89E92]">
              Practical
            </p>
            <p className="text-sm font-bold text-[#1A1613] dark:text-[#F5F1EB] mt-1">
              {data.practical?.attended ?? 0} / {data.practical?.total ?? 0}
            </p>
            <p className="text-[10px] text-[#6B6259] dark:text-[#A89E92]">
              {data.practical?.percentage != null ? `${data.practical.percentage.toFixed(1)}%` : "—"}
            </p>
            {data.practical?.need != null && (
              <p className="text-[10px] font-semibold text-accent mt-1">
                Need {data.practical.need} of {data.practical.predicted_future || 0}
              </p>
            )}
          </div>
        </div>
      ) : (
        // Non-split subjects (no theory/practical split)
        <div className="flex items-center justify-between text-xs text-[#6B6259] dark:text-[#A89E92]">
          <span>{data.attended ?? 0} attended / {data.total ?? 0} total</span>
          {data.need != null && (
            <span className="font-semibold text-accent">
              Need {data.need} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
