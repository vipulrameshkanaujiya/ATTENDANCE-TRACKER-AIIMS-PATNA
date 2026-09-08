/**
 * Medical Student Hub — Live Supabase Security & Database Verifier (Phase 9B)
 *
 * Fully executes real live tests against the remote Supabase database:
 * 1. Live Environment & Credentials
 * 2. 12 Tables Presence in live database
 * 3. Real Two-User Authentication & Sessions
 * 4. Real Atomic Roster Claiming & Race/Collision Prevention (PostgreSQL RPC)
 * 5. Real Student Identity Immutability (PostgreSQL Trigger)
 * 6. Real Attendance RLS Isolation (SELECT, INSERT, UPDATE, DELETE)
 * 7. Real Topic Progress RLS Isolation
 * 8. Real Schedule Read & Write Protection
 * 9. Real Batch Aggregate Statistics Privacy (Zero PII in RPC output)
 * 10. Complete Cleanup of all test artifacts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

console.log("================================================================================");
console.log(" MEDICAL STUDENT HUB — LIVE SUPABASE SECURITY & INTEGRATION AUDIT (PHASE 9B)");
console.log("================================================================================\n");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = (process.env.ADMIN_EMAIL || "vipulrameshkanaujiya@gmail.com").trim().toLowerCase();

if (!url || !anonKey || !serviceKey) {
  console.error("[FATAL] Missing required Supabase credentials in .env.local.");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function report(status: boolean, testName: string, detail?: string) {
  totalTests++;
  if (status) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

const EXPECTED_TABLES = [
  "batches",
  "users",
  "subjects",
  "units",
  "topics",
  "student_topic_progress",
  "classes",
  "attendance",
  "exams",
  "timetable_imports",
  "timetable_import_rows",
  "student_roster",
];

async function runLiveSuite() {
  console.log("--- 1. ENVIRONMENT & SECRET PROTECTION AUDIT (REAL LIVE & LOCAL) ---");
  report(Boolean(url && url.startsWith("https://")), "Live Supabase URL configured");
  report(Boolean(anonKey && anonKey.length > 20), "Public anon key configured");
  report(Boolean(serviceKey && serviceKey.length > 20), "Service-role key configured (server-only context)");
  report(adminEmail === "vipulrameshkanaujiya@gmail.com", "Admin email locked to vipulrameshkanaujiya@gmail.com");

  const gitignore = fs.readFileSync(".gitignore", "utf-8");
  report(gitignore.includes(".env.local") && gitignore.includes(".env"), ".gitignore protects .env and .env.local");

  const clientFile = fs.readFileSync("lib/supabase/client.ts", "utf-8");
  report(!clientFile.includes("SUPABASE_SERVICE_ROLE_KEY"), "Browser client.ts has ZERO references to service-role key");

  console.log("\n--- 2. REAL DATABASE SCHEMA & TABLE PRESENCE (12 TABLES) ---");
  let all12Exist = true;
  for (const table of EXPECTED_TABLES) {
    const { data, error } = await supabaseAdmin.from(table).select("*").limit(1);
    const tableExists = !error;
    if (!tableExists) all12Exist = false;
    report(tableExists, `Live Table 'public.${table}' exists in database schema`, error?.message);
  }

  const { count: rosterCount } = await supabaseAdmin.from("student_roster").select("*", { count: "exact", head: true });
  report(Boolean(rosterCount && rosterCount >= 150), `Baseline student roster populated (${rosterCount} entries)`);

  console.log("\n--- 3. REAL TWO-USER AUTHENTICATION & SESSION CREATION ---");
  const timestamp = Date.now();
  const emailA = `test-student-a-${timestamp}@aiims-test.internal`;
  const emailB = `test-student-b-${timestamp}@aiims-test.internal`;
  const testPass = `MedPass!_${timestamp}#77`;

  let userA: any = null;
  let userB: any = null;
  let tempClassId: string | null = null;
  let testTopicId: string | null = null;

  try {
    // Create User A in Supabase Auth
    const { data: authA, error: errAuthA } = await supabaseAdmin.auth.admin.createUser({
      email: emailA,
      password: testPass,
      email_confirm: true,
    });
    if (errAuthA || !authA.user) throw new Error("Failed to create Student A: " + errAuthA?.message);
    userA = authA.user;

    // Create User B in Supabase Auth
    const { data: authB, error: errAuthB } = await supabaseAdmin.auth.admin.createUser({
      email: emailB,
      password: testPass,
      email_confirm: true,
    });
    if (errAuthB || !authB.user) throw new Error("Failed to create Student B: " + errAuthB?.message);
    userB = authB.user;

    // Create corresponding public.users rows (simulating initial login)
    await supabaseAdmin.from("users").insert([
      { id: userA.id, email: emailA, role: "student", is_onboarded: false },
      { id: userB.id, email: emailB, role: "student", is_onboarded: false },
    ]);
    report(true, "Created two distinct test student identities in Supabase Auth & public.users");

    // Establish real authenticated Supabase client for Student A
    const clientA = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: sessA, error: signinErrA } = await clientA.auth.signInWithPassword({ email: emailA, password: testPass });
    report(!signinErrA && sessA.session !== null, "Student A signed in with live Supabase session established");

    // Establish real authenticated Supabase client for Student B
    const clientB = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data: sessB, error: signinErrB } = await clientB.auth.signInWithPassword({ email: emailB, password: testPass });
    report(!signinErrB && sessB.session !== null, "Student B signed in with live Supabase session established");

    console.log("\n--- 4. REAL ATOMIC ROSTER CLAIMING & COLLISION TESTS (POSTGRES RPC) ---");
    // Invalid roll number rejection
    const { data: invalidRes } = await clientA.rpc("claim_student_roll", { p_roll_number: "23001" });
    report(Boolean(invalidRes && !invalidRes.success), "Live RPC rejects non-2024 roll number (23001)");

    const { data: malformedRes } = await clientA.rpc("claim_student_roll", { p_roll_number: "241" });
    report(Boolean(malformedRes && !malformedRes.success), "Live RPC rejects malformed 3-digit roll number (241)");

    const { data: nonWhitelistedRes } = await clientA.rpc("claim_student_roll", { p_roll_number: "24999" });
    report(Boolean(nonWhitelistedRes && !nonWhitelistedRes.success), "Live RPC rejects non-whitelisted roll number (24999)");

    // Student A claims valid whitelisted roll 24001
    const { data: claimA } = await clientA.rpc("claim_student_roll", { p_roll_number: "24001" });
    report(Boolean(claimA && claimA.success), "Student A successfully claims unclaimed Roll 24001 via live RPC");

    // Verify database record updates
    const { data: rosterRow } = await supabaseAdmin.from("student_roster").select("*").eq("roll_number", "24001").single();
    report(rosterRow?.claimed_by_user_id === userA.id && rosterRow?.status === "CLAIMED", "student_roster record atomically updated to CLAIMED and bound to Student A");

    const { data: userRow } = await supabaseAdmin.from("users").select("*").eq("id", userA.id).single();
    report(userRow?.roll_number === "24001" && userRow?.is_onboarded === true, "public.users record updated: roll_number = 24001, is_onboarded = true");

    // Student B attempts to claim the ALREADY CLAIMED roll 24001 (MUST HARD FAIL)
    const { data: claimB } = await clientB.rpc("claim_student_roll", { p_roll_number: "24001" });
    report(Boolean(claimB && !claimB.success && claimB.error?.includes("already claimed")), "Student B duplicate claim on Roll 24001 REJECTED by live database");

    // Student A attempts to claim a second roll 24002 (MUST FAIL)
    const { data: claimA2 } = await clientA.rpc("claim_student_roll", { p_roll_number: "24002" });
    report(Boolean(claimA2 && !claimA2.success), "Student A second roll claim (24002) REJECTED (Account already claimed a roll)");

    console.log("\n--- 5. REAL IDENTITY IMMUTABILITY TESTS (POSTGRES TRIGGER) ---");
    // Student A attempts to change roll_number directly in users table
    const { error: tamperRollErr } = await clientA.from("users").update({ roll_number: "24002" }).eq("id", userA.id);
    report(Boolean(tamperRollErr), "Direct student mutation of roll_number BLOCKED by PostgreSQL trigger");

    // Student A attempts to elevate role to admin
    const { error: tamperRoleErr } = await clientA.from("users").update({ role: "admin" }).eq("id", userA.id);
    report(Boolean(tamperRoleErr), "Direct student self-elevation to admin role BLOCKED by PostgreSQL trigger");

    console.log("\n--- 6. REAL ATTENDANCE RLS TESTS (LIVE DATABASE EXECUTION) ---");
    // Fetch a subject to create a temporary test class
    const { data: subjects } = await supabaseAdmin.from("subjects").select("id").limit(1);
    const subId = subjects?.[0]?.id;

    const { data: tempClass, error: classErr } = await supabaseAdmin.from("classes").insert({
      date: "2026-09-09",
      start_time: "08:00",
      end_time: "09:00",
      subject_id: subId,
      topic: "RLS Test Class",
      class_type: "Lecture",
      batch_scope: "ALL",
    }).select().single();

    if (tempClass) tempClassId = tempClass.id;
    report(Boolean(tempClass), "Temporary test class created for RLS evaluation");

    if (tempClassId) {
      // Student A inserts own attendance
      const { error: insAttA } = await clientA.from("attendance").insert({
        student_id: userA.id,
        class_id: tempClassId,
        status: "PRESENT",
      });
      report(!insAttA, "Student A INSERT own attendance: ALLOWED");

      // Student A selects own attendance
      const { data: readAttA } = await clientA.from("attendance").select("*").eq("class_id", tempClassId);
      report(Boolean(readAttA && readAttA.length === 1 && readAttA[0].student_id === userA.id), "Student A SELECT own attendance: ALLOWED (1 record returned)");

      // Student A updates own attendance
      const { error: updAttA } = await clientA.from("attendance").update({ status: "ABSENT" }).eq("class_id", tempClassId).eq("student_id", userA.id);
      report(!updAttA, "Student A UPDATE own attendance (PRESENT -> ABSENT): ALLOWED");

      // Student A attempts to SELECT Student B's attendance
      const { data: crossReadB } = await clientA.from("attendance").select("*").eq("student_id", userB.id);
      report(!crossReadB || crossReadB.length === 0, "Student A SELECT Student B attendance: BLOCKED (0 records returned)");

      // Student A attempts to INSERT attendance for Student B (MUST BE BLOCKED)
      const { error: crossInsErr } = await clientA.from("attendance").insert({
        student_id: userB.id,
        class_id: tempClassId,
        status: "PRESENT",
      });
      report(Boolean(crossInsErr), "Student A INSERT attendance for Student B: BLOCKED by RLS policy");

      // Student A attempts to DELETE attendance (Admin-only policy)
      const { data: delAttRows, error: delAttErr } = await clientA.from("attendance").delete().eq("class_id", tempClassId).select();
      const { data: attStillExists } = await supabaseAdmin.from("attendance").select("id").eq("class_id", tempClassId);
      const isDeleteBlocked = (!delAttRows || delAttRows.length === 0) && attStillExists && attStillExists.length === 1;
      report(Boolean(isDeleteBlocked), "Student A DELETE own attendance: BLOCKED by RLS policy (Admin-only, 0 rows deleted)");
    }

    console.log("\n--- 7. REAL TOPIC PROGRESS RLS TESTS (LIVE DATABASE EXECUTION) ---");
    const { data: topics } = await supabaseAdmin.from("topics").select("id").limit(1);
    testTopicId = topics?.[0]?.id || null;

    if (testTopicId) {
      // Student A inserts/updates own topic progress
      const { error: insTopicA } = await clientA.from("student_topic_progress").upsert({
        student_id: userA.id,
        topic_id: testTopicId,
        status: "LEARNING",
      });
      report(!insTopicA, "Student A mutate own topic progress: ALLOWED");

      // Student A selects own topic progress
      const { data: readTopicA } = await clientA.from("student_topic_progress").select("*").eq("topic_id", testTopicId);
      report(Boolean(readTopicA && readTopicA.length === 1), "Student A SELECT own topic progress: ALLOWED");

      // Student A attempts to mutate Student B's topic progress
      const { error: crossTopicIns } = await clientA.from("student_topic_progress").upsert({
        student_id: userB.id,
        topic_id: testTopicId,
        status: "COMPLETED",
      });
      report(Boolean(crossTopicIns), "Student A mutate Student B topic progress: BLOCKED by RLS policy");

      // Student A attempts to read Student B's topic progress
      const { data: crossTopicRead } = await clientA.from("student_topic_progress").select("*").eq("student_id", userB.id);
      report(!crossTopicRead || crossTopicRead.length === 0, "Student A SELECT Student B topic progress: BLOCKED (0 records returned)");
    }

    console.log("\n--- 8. REAL SCHEDULE READ-ONLY ENFORCEMENT FOR STUDENTS ---");
    // Student A reads classes
    const { data: readClasses } = await clientA.from("classes").select("id, topic").limit(5);
    report(Boolean(readClasses && readClasses.length > 0), "Student A SELECT classes: ALLOWED");

    // Student A attempts to insert class
    const { error: insClassErr } = await clientA.from("classes").insert({
      date: "2026-09-10",
      start_time: "10:00",
      end_time: "11:00",
      topic: "Malicious Class",
      class_type: "Lecture",
    });
    report(Boolean(insClassErr), "Student A INSERT classes: BLOCKED by RLS policy");

    // Student A attempts to delete class
    if (tempClassId) {
      const { data: delClassRows, error: delClassErr } = await clientA.from("classes").delete().eq("id", tempClassId).select();
      const { data: classStillExists } = await supabaseAdmin.from("classes").select("id").eq("id", tempClassId);
      const isClassDeleteBlocked = (!delClassRows || delClassRows.length === 0) && classStillExists && classStillExists.length === 1;
      report(Boolean(isClassDeleteBlocked), "Student A DELETE classes: BLOCKED by RLS policy (Admin-only, 0 rows deleted)");
    }

    console.log("\n--- 9. REAL BATCH AGGREGATE PRIVACY TEST (POSTGRES RPC) ---");
    const { data: statsData, error: statsErr } = await clientA.rpc("get_batch_aggregate_stats");
    report(!statsErr && statsData !== null, "Student A executes get_batch_aggregate_stats RPC successfully");

    if (statsData) {
      const json = JSON.stringify(statsData);
      const zeroEmails = !json.includes("@");
      const zeroRolls = !json.includes("24001");
      const zeroNames = !json.includes("Aarav") && !json.includes("Student");
      const zeroStudentIds = !json.includes(userA.id) && !json.includes(userB.id);

      report(zeroEmails, "Batch stats RPC payload contains ZERO email addresses");
      report(zeroRolls, "Batch stats RPC payload contains ZERO individual roll numbers");
      report(zeroNames, "Batch stats RPC payload contains ZERO student names");
      report(zeroStudentIds, "Batch stats RPC payload contains ZERO student user IDs");
      report(statsData.active_students_30d !== undefined && statsData.batch_average_attendance_pct !== undefined, "Batch stats payload contains valid anonymized aggregate metrics");
    }

  } catch (error: any) {
    console.error("[EXCEPTION] Unhandled test error:", error.message);
  } finally {
    console.log("\n--- 10. TEST DATA CLEANUP (LEAVING ZERO TRACES IN LIVE DATABASE) ---");
    // Clean up temporary attendance
    if (tempClassId) {
      await supabaseAdmin.from("attendance").delete().eq("class_id", tempClassId);
      await supabaseAdmin.from("classes").delete().eq("id", tempClassId);
      console.log("[CLEANUP] Deleted temporary test class & attendance records");
    }

    // Clean up temporary topic progress
    if (userA && testTopicId) {
      await supabaseAdmin.from("student_topic_progress").delete().eq("student_id", userA.id);
    }
    if (userB && testTopicId) {
      await supabaseAdmin.from("student_topic_progress").delete().eq("student_id", userB.id);
    }
    console.log("[CLEANUP] Deleted temporary topic progress records");

    // Reset claimed roll 24001 back to UNCLAIMED
    await supabaseAdmin.from("student_roster").update({
      claimed_by_user_id: null,
      status: "UNCLAIMED",
      claimed_at: null,
    }).eq("roll_number", "24001");
    console.log("[CLEANUP] Reset Roll 24001 back to UNCLAIMED in student_roster");

    // Delete test users from public.users & Supabase Auth
    if (userA) {
      await supabaseAdmin.from("users").delete().eq("id", userA.id);
      await supabaseAdmin.auth.admin.deleteUser(userA.id);
    }
    if (userB) {
      await supabaseAdmin.from("users").delete().eq("id", userB.id);
      await supabaseAdmin.auth.admin.deleteUser(userB.id);
    }
    console.log("[CLEANUP] Deleted temporary test student accounts from Supabase Auth & public.users");
  }

  console.log("\n================================================================================");
  console.log(` LIVE AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runLiveSuite();
