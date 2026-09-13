import { HelpPageClient } from "@/components/student/HelpPageClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Help & About | BunkBuddy" };

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("users").select("roll_number, email").eq("id", user.id).single()
    : { data: null };

  let donations: any[] = [];
  let donationCount = 0;
  try {
    const [{ data: donData }, { count }] = await Promise.all([
      supabase
        .from("donations")
        .select("donor_name, amount, currency, message, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("is_public", true),
    ]);
    donations = donData || [];
    donationCount = count || 0;
  } catch {}

  return (
    <HelpPageClient
      profile={profile}
      donations={donations}
      donationCount={donationCount}
    />
  );
}
