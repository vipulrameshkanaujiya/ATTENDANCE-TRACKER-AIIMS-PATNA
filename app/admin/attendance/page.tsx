import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/session";
import { adminCorrectAttendanceAction } from "@/app/actions/admin";
import { AttendanceStatus } from "@/types/database";
import { CheckSquare, Check, X } from "lucide-react";

export default async function AdminAttendancePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: attendanceLogs } = await supabase
    .from("attendance")
    .select("*, student:users(roll_number, full_name, email), class:classes(*, subject:subjects(*))")
    .order("marked_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Attendance Oversight & Correction
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Review student logs and correct attendance records where appropriate
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Recent Attendance Records ({attendanceLogs?.length || 0})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Student Roll</th>
                <th className="p-3">Session & Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Recorded At</th>
                <th className="p-3 text-right">Admin Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(attendanceLogs || []).map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-900">
                    <div>{log.student?.roll_number || "Unset"}</div>
                    <div className="text-[10px] text-slate-400 font-sans font-normal">{log.student?.full_name || log.student?.email}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-blue-700">{log.class?.subject?.code || "MBBS"}</span>
                    <p className="font-medium text-slate-800">{log.class?.topic || "Session"}</p>
                    <p className="text-[11px] text-slate-400">{log.class?.date} · {log.class?.class_type}</p>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.status === "PRESENT" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(log.marked_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      <form action={adminCorrectAttendanceAction.bind(null, log.student_id, log.class_id, "PRESENT")}>
                        <button
                          type="submit"
                          disabled={log.status === "PRESENT"}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded border border-emerald-200 text-[11px] font-semibold disabled:opacity-30"
                        >
                          Mark Present
                        </button>
                      </form>
                      <form action={adminCorrectAttendanceAction.bind(null, log.student_id, log.class_id, "ABSENT")}>
                        <button
                          type="submit"
                          disabled={log.status === "ABSENT"}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded border border-rose-200 text-[11px] font-semibold disabled:opacity-30"
                        >
                          Mark Absent
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
