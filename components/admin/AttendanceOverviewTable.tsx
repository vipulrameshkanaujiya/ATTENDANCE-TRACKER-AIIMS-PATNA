"use client";
import { useState, useMemo } from "react";
import { Search, Filter, ChevronRight } from "lucide-react";

export function AttendanceOverviewTable({ students }: { students: any[] }) {
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("roll");

  const filtered = useMemo(() => {
    let list = students;
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
                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
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
    </div>
  );
}
