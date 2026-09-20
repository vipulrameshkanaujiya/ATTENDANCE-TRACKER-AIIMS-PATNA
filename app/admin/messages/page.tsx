import { createAdminClient } from "@/lib/supabase/admin";
import { MessagesManager } from "@/components/admin/MessagesManager";
import { requireAdmin } from "@/lib/auth/session";

export const metadata = { title: "Messages | Admin" };

export default async function AdminMessagesPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: students }, { data: messages }] = await Promise.all([
    supabase.from("users").select("id, roll_number, full_name").eq("is_onboarded", true).order("roll_number"),
    supabase.from("admin_messages").select("*, to_user:users(id, roll_number, full_name)").order("created_at", { ascending: false })
  ]);

  return <MessagesManager students={students || []} messages={messages || []} />;
}
