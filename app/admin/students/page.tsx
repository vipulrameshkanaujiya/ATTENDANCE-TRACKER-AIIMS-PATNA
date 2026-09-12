import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { addRosterStudentAction, resetStudentClaimAction, updateStudentBatchAction, bulkImportRosterAction } from "@/app/actions/admin";
import { Users, Hash, ShieldCheck, UserPlus, RotateCcw, FileText, AlertTriangle } from "lucide-react";
import { AdminHistoricalAttendanceModal } from "@/components/admin/AdminHistoricalAttendanceModal";
import { AdminAutoPresentToggle } from "@/components/admin/AdminAutoPresentToggle";
import { ChangeRollModal } from "@/components/admin/ChangeRollModal";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const supabase = await createClient();

  // Query batches for assignment dropdowns
  const { data: batches } = await supabase
    .from("batches")
    .select("*")
    .order("name", { ascending: true });

  // Query official student roster
  const { data: rosterEntries } = await supabase
    .from("student_roster")
    .select("*, batch:batches(*), claimed_user:users!claimed_by_user_id(id, email, full_name)")
    .order("roll_number", { ascending: true });

  // Query users directly as fallback/cross-check
  const { data: users } = await supabase
    .from("users")
    .select("*, batch:batches(*)")
    .order("roll_number", { ascending: true });

  const { data: autoPresentPrefs } = await supabase
    .from("student_auto_present_preferences")
    .select("*");

  const prefsMap = new Map(autoPresentPrefs?.map((p: any) => [p.student_id, p]) || []);

  const totalRoster = rosterEntries?.length || users?.length || 0;
  const claimedCount = rosterEntries
    ? rosterEntries.filter((r: any) => r.status === "CLAIMED").length
    : (users || []).filter((u: any) => u.is_onboarded).length;
  const unclaimedCount = totalRoster - claimedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Official Student Roster & Onboarding Control
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Pre-registered student roster for AIIMS Patna MBBS 2024. Only whitelisted roll numbers can be claimed.
          </p>
        </div>
      </div>

      {/* Baseline Roster Status Notice */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 space-y-1">
          <p>
            <strong>Roster Status:</strong> Seeded with {totalRoster} baseline development records (Rolls 24001–24150).
            Batch A (01–40), Batch B (41–80), and Batch C (81–150).
          </p>
          <p className="text-amber-800/90 text-[11px]">
            Use the forms below to add individual students or paste/import the official verified college roster.
          </p>
        </div>
      </div>


      {/* Roster Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Allowed Roster</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalRoster}</p>
          <p className="text-[11px] text-slate-400">MBBS Batch 2024 Whitelist</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Claimed & Active</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{claimedCount}</p>
          <p className="text-[11px] text-slate-400">Linked to verified Google accounts</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Unclaimed Slots</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{unclaimedCount}</p>
          <p className="text-[11px] text-slate-400">Awaiting student Google login</p>
        </div>
      </div>

      {/* Add Student to Roster Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Add Allowed Roll Number to Roster
          </h2>
        </div>

        <form action={addRosterStudentAction} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Roll Number (5 Digits)
            </label>
            <input
              type="text"
              name="roll_number"
              required
              maxLength={5}
              placeholder="24151"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Student Name (Optional)
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Batch Assignment
            </label>
            <select
              name="batch_id"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {(batches || []).map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs"
            >
              Whitelist Roll Number
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Roster Import / CSV Paste Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Bulk Roster Import (Paste CSV or Text)
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Paste roll numbers, names, and optional batches (one per line). Format: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700 font-mono">24001, Student Name, Batch A</code> or simply list roll numbers.
        </p>

        <form action={bulkImportRosterAction} className="space-y-3">
          <textarea
            name="roster_csv"
            rows={3}
            placeholder={`24001, Aarav Kumar, Batch A\n24002, Bhavya Singh, Batch A\n24041, Chetan Verma, Batch B`}
            required
            className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono"
          />
          <button
            type="submit"
            className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs"
          >
            Import Roster Entries
          </button>
        </form>
      </div>


      {/* Roster & Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Official Roster Entries ({rosterEntries?.length || users?.length || 0})
          </span>
          <span className="text-[11px] text-slate-400">
            Protected against cross-claiming & tampering
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student / Claim Details</th>
                <th className="p-3">Batch</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rosterEntries && rosterEntries.length > 0 ? (
                rosterEntries.map((r: any) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {r.roll_number}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">
                        {r.full_name || r.claimed_user?.full_name || "MBBS Student"}
                      </p>
                      {r.claimed_user?.email ? (
                        <p className="text-[11px] text-slate-400 font-mono">
                          Linked: {r.claimed_user.email}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">Unclaimed (Available)</p>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {r.batch?.name || "Auto-assigned"}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.status === "CLAIMED" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Claimed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Unclaimed
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === "CLAIMED" && (r.claimed_user?.id || r.claimed_by_user_id) && (
                          <>
                            <AdminAutoPresentToggle
                              studentId={r.claimed_user?.id || r.claimed_by_user_id}
                              isEnabled={!!prefsMap.get(r.claimed_user?.id || r.claimed_by_user_id)?.is_enabled}
                            />
                            <ChangeRollModal
                              studentId={r.claimed_user?.id || r.claimed_by_user_id}
                              currentRoll={r.roll_number}
                            />
                            <AdminHistoricalAttendanceModal
                              studentId={r.claimed_user?.id || r.claimed_by_user_id}
                              studentName={r.full_name || r.claimed_user?.full_name || "MBBS Student"}
                              rollNumber={r.roll_number}
                            />
                          </>
                        )}
                        {r.status === "CLAIMED" && (
                          <form action={resetStudentClaimAction.bind(null, r.id)} className="inline">
                            <button
                              type="submit"
                              title="Reset claim to allow student to re-link"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-[11px] font-semibold transition"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset Claim</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                (users || []).map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {s.roll_number || "Pending"}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{s.full_name || "MBBS Student"}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{s.email}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {s.batch?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-600 font-semibold">Active</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <AdminAutoPresentToggle
                          studentId={s.id}
                          isEnabled={!!prefsMap.get(s.id)?.is_enabled}
                        />
                        <ChangeRollModal
                          studentId={s.id}
                          currentRoll={s.roll_number}
                        />
                        <AdminHistoricalAttendanceModal
                          studentId={s.id}
                          studentName={s.full_name || "MBBS Student"}
                          rollNumber={s.roll_number || "Pending"}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

