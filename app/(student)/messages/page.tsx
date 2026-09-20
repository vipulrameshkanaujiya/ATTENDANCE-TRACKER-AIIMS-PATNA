import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "@/components/student/InboxClient";

export const metadata = { title: "Messages | BunkBuddy" };

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: messages } = await supabase
    .from("admin_messages")
    .select("*")
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false });

  return <InboxClient messages={messages || []} />;
}
