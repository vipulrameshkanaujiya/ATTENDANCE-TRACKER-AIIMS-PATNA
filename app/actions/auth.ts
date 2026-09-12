"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { isValidRollNumber, resolveBatchForRoll } from "@/lib/utils/batch";
import { Batch } from "@/types/database";
import { redirect } from "next/navigation";

export interface OnboardingResult {
  success: boolean;
  error?: string;
}

export async function completeOnboarding(formData: FormData): Promise<OnboardingResult> {
  const rollNumber = formData.get("roll_number")?.toString().trim() || "";
  console.log(`[Onboarding] Initiating roll claim for roll: "${rollNumber}"`);

  if (!/^2[1-4]\d{3}$/.test(rollNumber)) {
    console.warn(`[Onboarding] Invalid roll number format rejected: "${rollNumber}"`);
    return {
      success: false,
      error: "Invalid roll number format. Must be 5 digits (e.g., 24001, 22064).",
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    console.warn("[Onboarding] Authentication required: no user session detected");
    return { success: false, error: "Authentication required. Please sign in again." };
  }
  console.log(`[Onboarding] Authenticated user: id=${user.id}, email=${user.email}`);

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // 0. Check block status
  const { data: isBlocked } = await adminSupabase.rpc("is_user_blocked", {
    p_user_id: user.id,
    p_email: user.email || ""
  });

  if (isBlocked) {
    await supabase.auth.signOut();
    redirect("/blocked");
  }

  // 1. Guard against tampering: Check if current account is already onboarded
  const { data: userProfile } = await supabase
    .from("users")
    .select("is_onboarded, roll_number")
    .eq("id", user.id)
    .maybeSingle();

  if (userProfile?.is_onboarded) {
    return {
      success: false,
      error: "Already onboarded.",
    };
  }

  // 2. Guard: Check if this user ID already holds a claim on another roster entry
  const { data: userRosterClaim } = await supabase
    .from("student_roster")
    .select("roll_number")
    .eq("claimed_by_user_id", user.id)
    .maybeSingle();

  if (userRosterClaim && userRosterClaim.roll_number !== rollNumber) {
    console.warn(`[Onboarding] Account ${user.id} already holds claim on roll ${userRosterClaim.roll_number}`);
    return {
      success: false,
      error: `This Google account is already linked to roll number ${userRosterClaim.roll_number}.`,
    };
  }

  let claimSuccess = false;
  let resolvedBatchId: string | null = null;
  let studentFullName: string | null = null;

  // 3. Attempt atomic database-level claim via claim_student_roll RPC
  try {
    console.log(`[Onboarding] Calling claim_student_roll RPC for roll ${rollNumber}...`);
    const { data: rpcResult, error: rpcError } = await supabase.rpc("claim_student_roll", {
      p_roll_number: rollNumber,
    });

    if (rpcError) {
      console.warn("[Onboarding] RPC claim_student_roll returned error:", rpcError.message);
    } else if (rpcResult) {
      console.log("[Onboarding] RPC claim_student_roll output:", rpcResult);
      if (!rpcResult.success) {
        return {
          success: false,
          error: rpcResult.error || "Failed to claim student roll number.",
        };
      }
      claimSuccess = true;
      resolvedBatchId = rpcResult.batch_id || null;
    }
  } catch (rpcEx: any) {
    console.error("[Onboarding] RPC invocation error:", rpcEx?.message || rpcEx);
  }

  // 4. Application-level fallback validation against student_roster if RPC didn't claim
  if (!claimSuccess) {
    console.log(`[Onboarding] Executing application-level roster claim for roll ${rollNumber}...`);
    const { data: rosterEntry, error: rosterError } = await supabase
      .from("student_roster")
      .select("id, roll_number, batch_id, status, claimed_by_user_id, full_name")
      .eq("roll_number", rollNumber)
      .maybeSingle();

    if (!rosterEntry) {
      console.warn(`[Onboarding] Roll ${rollNumber} not found on official batch roster`);
      return {
        success: false,
        error: `Roll number ${rollNumber} is not found on the official batch roster. Please contact the administrator.`,
      };
    }

    if (rosterEntry.status === "DISABLED") {
      console.warn(`[Onboarding] Roll ${rollNumber} is disabled by administrator`);
      return {
        success: false,
        error: `Roll number ${rollNumber} has been disabled by the administrator.`,
      };
    }

    if (rosterEntry.status === "CLAIMED" || rosterEntry.claimed_by_user_id) {
      if (rosterEntry.claimed_by_user_id !== user.id) {
        console.warn(`[Onboarding] Roll ${rollNumber} is already claimed by ${rosterEntry.claimed_by_user_id}`);
        return {
          success: false,
          error: `Roll number ${rollNumber} is already claimed by another student account.`,
        };
      }
    }

    // Resolve batch if not set in roster
    resolvedBatchId = rosterEntry.batch_id;
    studentFullName = rosterEntry.full_name;

    if (!resolvedBatchId) {
      const { data: batches } = await supabase
        .from("batches")
        .select("*")
        .order("roll_min", { ascending: true });

      if (batches && batches.length > 0) {
        const matched = resolveBatchForRoll(rollNumber, batches as Batch[]);
        if (matched) {
          resolvedBatchId = matched.id;
        }
      }
    }

    // Update student_roster atomically via admin client
    const { error: claimErr } = await adminSupabase
      .from("student_roster")
      .update({
        claimed_by_user_id: user.id,
        status: "CLAIMED",
        batch_id: resolvedBatchId,
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", rosterEntry.id);

    if (claimErr) {
      console.error("[Onboarding] Failed to update roster record:", claimErr.message);
      return {
        success: false,
        error: "Failed to claim roster record: " + claimErr.message,
      };
    }
  }

  // 5. Query roster to ensure batch and name details are resolved
  if (!resolvedBatchId || !studentFullName) {
    const { data: rRow } = await adminSupabase
      .from("student_roster")
      .select("batch_id, full_name")
      .eq("roll_number", rollNumber)
      .maybeSingle();

    if (rRow) {
      resolvedBatchId = resolvedBatchId || rRow.batch_id;
      studentFullName = studentFullName || rRow.full_name;
    }
  }

  if (!resolvedBatchId) {
    const { data: batches } = await adminSupabase
      .from("batches")
      .select("*")
      .order("roll_min", { ascending: true });

    if (batches && batches.length > 0) {
      const matched = resolveBatchForRoll(rollNumber, batches as Batch[]);
      if (matched) {
        resolvedBatchId = matched.id;
      }
    }
  }

  // 6. Guarantee public.users profile row is created/updated and marked is_onboarded = true
  console.log(`[Onboarding] Synchronizing public.users profile for user ${user.id} with roll ${rollNumber}...`);
  const { error: profileUpsertError } = await adminSupabase
    .from("users")
    .upsert({
      id: user.id,
      email: user.email?.trim().toLowerCase() || "",
      role: "student",
      roll_number: rollNumber,
      batch_id: resolvedBatchId,
      is_onboarded: true,
      full_name: studentFullName || user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

  if (profileUpsertError) {
    console.error("[Onboarding] Error syncing public.users profile:", profileUpsertError.message);
    return {
      success: false,
      error: "Failed to update profile record: " + profileUpsertError.message,
    };
  }

  console.log(`[Onboarding] Onboarding completed successfully for user ${user.id} -> roll ${rollNumber}. Redirecting to /home.`);
  redirect("/home");
}


export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
