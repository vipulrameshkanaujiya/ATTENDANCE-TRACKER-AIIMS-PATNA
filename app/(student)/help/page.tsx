import { HelpPageClient } from "@/components/student/HelpPageClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Help & About | BunkBuddy" };

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("roll_number, email").eq("id", user.id).single()
    : { data: null };

  return <HelpPageClient profile={profile} />;
}
