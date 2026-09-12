import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BulkAttendanceClient } from "@/components/admin/BulkAttendanceClient";

export default async function AdminBulkAttendancePage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from("bulk_historical_attendance")
    .select("*")
    .order("roll_number", { ascending: true })
    .order("subject_code", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bulk Pre-September Attendance
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload official attendance records via CSV. Students will be prompted to verify and lock this data.
        </p>
      </div>

      <BulkAttendanceClient currentData={currentData || []} />
    </div>
  );
}
