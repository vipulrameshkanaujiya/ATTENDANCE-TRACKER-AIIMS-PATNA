import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserProfile } from "@/types/database";
import { redirect } from "next/navigation";
import { getAdminEmail } from "./constants";

export { getAdminEmail };
export const ADMIN_EMAIL = getAdminEmail();


export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserProfile(userId?: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const targetId = userId || (await getCurrentUser())?.id;
  if (!targetId) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*, batch:batches(*)")
    .eq("id", targetId)
    .maybeSingle();

  if (data && data.is_onboarded) {
    return data as UserProfile;
  }

  // Self-healing check: If the user profile is missing or not marked onboarded,
  // check if this user holds a claim in student_roster
  try {
    const admin = createAdminClient();
    const { data: rosterClaim } = await admin
      .from("student_roster")
      .select("*, batch:batches(*)")
      .eq("claimed_by_user_id", targetId)
      .maybeSingle();

    if (rosterClaim && rosterClaim.status === "CLAIMED") {
      console.log(`[Self-Heal] Auto-repairing user profile for ${targetId} linked to roll ${rosterClaim.roll_number}`);
      const { data: authUser } = await admin.auth.admin.getUserById(targetId);
      const email = authUser?.user?.email?.trim().toLowerCase() || "";
      const adminEmail = getAdminEmail();
      const role = email === adminEmail ? "admin" : "student";

      const { data: healedUser, error: healErr } = await admin
        .from("users")
        .upsert({
          id: targetId,
          email: email,
          role: role,
          roll_number: rosterClaim.roll_number,
          batch_id: rosterClaim.batch_id,
          is_onboarded: true,
          full_name: rosterClaim.full_name || authUser?.user?.user_metadata?.full_name || authUser?.user?.user_metadata?.name || null,
          avatar_url: authUser?.user?.user_metadata?.avatar_url || authUser?.user?.user_metadata?.picture || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" })
        .select("*, batch:batches(*)")
        .single();

      if (!healErr && healedUser) {
        return healedUser as UserProfile;
      }
    }
  } catch (healEx) {
    console.error("[Self-Heal] Error attempting to auto-repair user profile:", healEx);
  }

  if (error || !data) return null;
  return data as UserProfile;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireOnboarded() {
  const user = await requireAuth();
  const profile = await getUserProfile(user.id);
  const adminEmail = getAdminEmail();

  if (!profile || !profile.is_onboarded) {
    // If admin is logging in, auto-onboard them as admin if needed
    if (user.email?.trim().toLowerCase() === adminEmail) {
      return { user, profile };
    }
    redirect("/onboarding");
  }

  return { user, profile };
}

export async function requireAdmin() {
  const { user, profile } = await requireOnboarded();
  const adminEmail = getAdminEmail();

  const isEmailAdmin = (user.email?.trim().toLowerCase() === adminEmail);
  const isRoleAdmin = profile?.role === "admin";

  // Strict dual-check: BOTH email and role must verify
  if (!isEmailAdmin || !isRoleAdmin) {
    redirect("/home?error=unauthorized_admin");
  }

  return { user, profile };
}

