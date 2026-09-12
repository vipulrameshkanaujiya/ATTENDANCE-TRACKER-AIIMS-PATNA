import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("is_onboarded")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_onboarded) redirect("/home");

  return <OnboardingClient />;
}
