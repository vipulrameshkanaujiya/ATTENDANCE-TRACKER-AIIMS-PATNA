import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getAdminEmail } from "@/lib/auth/constants";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/home";

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError || !user) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_failed`);
    }

    const email = user.email?.trim().toLowerCase() || "";
    const adminEmail = getAdminEmail();
    const role = email === adminEmail ? "admin" : "student";


    // Use admin client to reliably create and synchronize public.users
    const adminSupabase = createAdminClient();
    const { data: existingUser } = await adminSupabase
      .from("users")
      .select("id, is_onboarded, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingUser) {
      // First-time user creation
      await adminSupabase.from("users").upsert({
        id: user.id,
        email: email,
        role: role,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        is_onboarded: role === "admin", // Admin is automatically onboarded
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

      if (role === "admin") {
        return NextResponse.redirect(`${requestUrl.origin}/admin`);
      }
      return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
    } else {
      // Existing user: ensure admin role is kept in sync with configured ADMIN_EMAIL
      if (email === adminEmail && existingUser.role !== "admin") {
        await adminSupabase.from("users").update({ role: "admin" }).eq("id", user.id);
      }

      if (existingUser.role === "admin" || (email === adminEmail)) {
        return NextResponse.redirect(`${requestUrl.origin}/admin`);
      }

      if (!existingUser.is_onboarded) {
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`);
}
