import { createAdminClient } from "@/lib/supabase/admin";
import { AccessControlTable } from "@/components/admin/AccessControlTable";

export const metadata = { title: "Access Control | Admin" };

export default async function AccessControlPage() {
  const supabase = createAdminClient();

  // Fetch blocked rows
  const { data: blockedList } = await supabase
    .from("access_control")
    .select("*, blocked_by_user:users!access_control_blocked_by_fkey(email)")
    .eq("is_blocked", true)
    .order("blocked_at", { ascending: false });

  // Fetch all students to allow force logout / block from a list
  const { data: usersList } = await supabase
    .from("users")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Access Control</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage user access, block accounts, force logouts, and permanently remove students.
        </p>
      </div>

      <AccessControlTable 
        initialBlocked={blockedList || []} 
        allUsers={usersList || []} 
      />
    </div>
  );
}
