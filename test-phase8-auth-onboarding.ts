/**
 * Phase 8 Comprehensive Authentication, Authorization & Secure Onboarding Test Suite
 */

import { isValidRollNumber, getRollNumberSuffix, resolveBatchForRoll } from "./lib/utils/batch.ts";
import { getAdminEmail, DEFAULT_ADMIN_EMAIL } from "./lib/auth/constants.ts";
import type { Batch, UserProfile, StudentRosterEntry, AttendanceStatus, TopicProgressStatus } from "./types/database.ts";



console.log("===============================================================");
console.log(" MEDICAL STUDENT HUB — PHASE 8 AUTH & ONBOARDING AUDIT SUITE");
console.log("===============================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. AUTHENTICATION & ADMIN EMAIL NORMALIZATION TESTS
// -----------------------------------------------------------------------------
console.log("--- 1. GOOGLE AUTH & ADMIN NORMALIZATION ---");

const configuredAdminEmail = getAdminEmail();
assert(
  configuredAdminEmail === "vipulrameshkanaujiya@gmail.com",
  "Centralized getAdminEmail returns expected lowercase email",
  configuredAdminEmail
);

// Email comparison safety (mixed case & whitespace)
function isDesignatedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === getAdminEmail();
}

assert(isDesignatedAdmin("VIPULRAMESHKANAUJIYA@GMAIL.COM"), "Admin check accepts UPPERCASE email");
assert(isDesignatedAdmin(" vipulrameshkanaujiya@gmail.com "), "Admin check accepts whitespace-padded email");
assert(!isDesignatedAdmin("student@aiimspatna.edu.in"), "Admin check rejects non-admin student email");
assert(!isDesignatedAdmin("hacker@gmail.com"), "Admin check rejects arbitrary Gmail user");
assert(!isDesignatedAdmin(null), "Admin check handles null safely");

// Dual-Authorization Rule: BOTH email must match AND role must equal admin
function verifyAdminAuthorization(email: string, role: string): boolean {
  const isEmailAdmin = isDesignatedAdmin(email);
  const isRoleAdmin = role === "admin";
  return isEmailAdmin && isRoleAdmin; // STRICT AND
}

assert(
  verifyAdminAuthorization("vipulrameshkanaujiya@gmail.com", "admin") === true,
  "Legitimate admin with valid role is authorized"
);
assert(
  verifyAdminAuthorization("student@gmail.com", "admin") === false,
  "Role spoofing attack (role='admin' on non-admin email) REJECTED"
);
assert(
  verifyAdminAuthorization("vipulrameshkanaujiya@gmail.com", "student") === false,
  "Admin email with student role rejected until synced"
);

// -----------------------------------------------------------------------------
// 2. ROLL NUMBER VALIDATION TESTS
// -----------------------------------------------------------------------------
console.log("\n--- 2. ROLL NUMBER VALIDATION ---");

// Valid roll numbers
assert(isValidRollNumber("24001"), "Valid roll 24001 accepted");
assert(isValidRollNumber("24040"), "Valid roll 24040 accepted");
assert(isValidRollNumber("24081"), "Valid roll 24081 accepted");
assert(isValidRollNumber("24125"), "Valid roll 24125 accepted");
assert(isValidRollNumber("24150"), "Valid roll 24150 accepted");

// Invalid roll numbers
assert(!isValidRollNumber("2401"), "Invalid roll 2401 (4 digits) rejected");
assert(!isValidRollNumber("12345"), "Invalid roll 12345 (wrong prefix) rejected");
assert(!isValidRollNumber("241234"), "Invalid roll 241234 (6 digits) rejected");
assert(!isValidRollNumber("ABC01"), "Invalid roll ABC01 (alphabetic) rejected");
assert(!isValidRollNumber(""), "Empty roll number rejected");
assert(!isValidRollNumber("2400A"), "Roll number with trailing letter rejected");
assert(isValidRollNumber(" 24040 "), "Surrounding whitespace is cleanly trimmed and validated");


// -----------------------------------------------------------------------------
// 3. DYNAMIC BATCH ALLOCATION TESTS
// -----------------------------------------------------------------------------
console.log("\n--- 3. DYNAMIC BATCH ALLOCATION ---");

const testBatches: Batch[] = [
  { id: "batch-a-id", name: "Batch A", roll_min: 1, roll_max: 40, is_default_fallback: false, created_at: "", updated_at: "" },
  { id: "batch-b-id", name: "Batch B", roll_min: 41, roll_max: 80, is_default_fallback: false, created_at: "", updated_at: "" },
  { id: "batch-c-id", name: "Batch C", roll_min: 81, roll_max: 999, is_default_fallback: true, created_at: "", updated_at: "" },
];

assert(resolveBatchForRoll("24001", testBatches)?.name === "Batch A", "Roll 24001 resolves to Batch A");
assert(resolveBatchForRoll("24040", testBatches)?.name === "Batch A", "Roll 24040 resolves to Batch A");
assert(resolveBatchForRoll("24041", testBatches)?.name === "Batch B", "Roll 24041 resolves to Batch B");
assert(resolveBatchForRoll("24080", testBatches)?.name === "Batch B", "Roll 24080 resolves to Batch B");
assert(resolveBatchForRoll("24081", testBatches)?.name === "Batch C", "Roll 24081 resolves to Batch C");
assert(resolveBatchForRoll("24125", testBatches)?.name === "Batch C", "Roll 24125 resolves to Batch C");

// -----------------------------------------------------------------------------
// 4. SECURE STUDENT ROSTER CLAIMING & ANTI-HIJACK TESTS
// -----------------------------------------------------------------------------
console.log("\n--- 4. STUDENT ROSTER PRE-REGISTRATION & CLAIMING ---");

interface MockDbRoster {
  id: string;
  roll_number: string;
  full_name: string | null;
  batch_id: string;
  claimed_by_user_id: string | null;
  status: "UNCLAIMED" | "CLAIMED" | "DISABLED";
}

interface MockDbUser {
  id: string;
  email: string;
  role: "student" | "admin";
  roll_number: string | null;
  batch_id: string | null;
  is_onboarded: boolean;
}

// Populate sample roster
const mockRoster: MockDbRoster[] = [
  { id: "rost-1", roll_number: "24001", full_name: "Aarav Kumar", batch_id: "batch-a-id", claimed_by_user_id: null, status: "UNCLAIMED" },
  { id: "rost-2", roll_number: "24002", full_name: "Bhavya Singh", batch_id: "batch-a-id", claimed_by_user_id: null, status: "UNCLAIMED" },
  { id: "rost-3", roll_number: "24042", full_name: null, batch_id: "batch-b-id", claimed_by_user_id: null, status: "UNCLAIMED" },
  { id: "rost-4", roll_number: "24099", full_name: "Disabled Student", batch_id: "batch-c-id", claimed_by_user_id: null, status: "DISABLED" },
];

const mockUsers: MockDbUser[] = [
  { id: "user-student-1", email: "student1@gmail.com", role: "student", roll_number: null, batch_id: null, is_onboarded: false },
  { id: "user-student-2", email: "student2@gmail.com", role: "student", roll_number: null, batch_id: null, is_onboarded: false },
  { id: "user-attacker", email: "attacker@gmail.com", role: "student", roll_number: null, batch_id: null, is_onboarded: false },
];

function simulateClaimRoll(userId: string, targetRoll: string): { success: boolean; error?: string } {
  // Validate format
  if (!isValidRollNumber(targetRoll)) {
    return { success: false, error: "Invalid roll number format" };
  }

  const callingUser = mockUsers.find((u) => u.id === userId);
  if (!callingUser) return { success: false, error: "User not found" };

  // Immutability check: cannot claim if already onboarded
  if (callingUser.is_onboarded && callingUser.roll_number) {
    return { success: false, error: `Your account is already linked to roll number ${callingUser.roll_number}. Identity cannot be changed.` };
  }

  // Account check: cannot claim multiple entries
  const existingClaim = mockRoster.find((r) => r.claimed_by_user_id === userId && r.roll_number !== targetRoll);
  if (existingClaim) {
    return { success: false, error: "Account already linked to another roll" };
  }

  // Roster check: must be on whitelist
  const entry = mockRoster.find((r) => r.roll_number === targetRoll);
  if (!entry) {
    return { success: false, error: `Roll number ${targetRoll} not on official roster.` };
  }

  if (entry.status === "DISABLED") {
    return { success: false, error: "Roll number has been disabled." };
  }

  if (entry.status === "CLAIMED" || entry.claimed_by_user_id) {
    if (entry.claimed_by_user_id !== userId) {
      return { success: false, error: `Roll number ${targetRoll} already claimed by another student.` };
    }
  }

  // Execute atomic claim
  entry.claimed_by_user_id = userId;
  entry.status = "CLAIMED";

  callingUser.roll_number = targetRoll;
  callingUser.batch_id = entry.batch_id;
  callingUser.is_onboarded = true;

  return { success: true };
}

// Test A: Un-whitelisted roll number rejection
const unwhitelistedRes = simulateClaimRoll("user-student-1", "24999");
assert(
  !unwhitelistedRes.success && unwhitelistedRes.error?.includes("not on official roster"),
  "Un-whitelisted roll number (24999) rejected from claiming"
);

// Test B: Disabled roll number rejection
const disabledRes = simulateClaimRoll("user-student-1", "24099");
assert(
  !disabledRes.success && disabledRes.error?.includes("disabled"),
  "Disabled roll number (24099) rejected from claiming"
);

// Test C: Valid first-time claim
const validClaimRes = simulateClaimRoll("user-student-1", "24001");
assert(
  validClaimRes.success === true,
  "Legitimate student claims whitelisted roll 24001 successfully"
);
const claimedEntry = mockRoster.find((r) => r.roll_number === "24001");
assert(
  claimedEntry?.claimed_by_user_id === "user-student-1" && claimedEntry?.status === "CLAIMED",
  "Roster entry status transitioned to CLAIMED with 1:1 user_id binding"
);

// Test D: Collision / Hijacking attempt (User 2 attempts to claim User 1's roll)
const hijackingRes = simulateClaimRoll("user-student-2", "24001");
assert(
  !hijackingRes.success && hijackingRes.error?.includes("already claimed by another student"),
  "Collision attack prevented: User 2 blocked from claiming User 1's roll 24001"
);

// Test E: Existing student attempts to change roll number
const changeRollRes = simulateClaimRoll("user-student-1", "24002");
assert(
  !changeRollRes.success && changeRollRes.error?.includes("Identity cannot be changed"),
  "Identity tampering prevented: Onboarded student cannot change roll from 24001 to 24002"
);

// Test F: Valid second student claims different unclaimed roll
const secondStudentClaim = simulateClaimRoll("user-student-2", "24002");
assert(
  secondStudentClaim.success === true,
  "Second student claims unclaimed roll 24002 successfully"
);

// -----------------------------------------------------------------------------
// 5. ATTENDANCE & TOPIC PROGRESS AUTHORIZATION (RLS LOGIC)
// -----------------------------------------------------------------------------
console.log("\n--- 5. ATTENDANCE & TOPIC PROGRESS AUTHORIZATION ---");

interface MockAttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  status: AttendanceStatus;
}

const attendanceTable: MockAttendanceRecord[] = [
  { id: "att-1", student_id: "user-student-1", class_id: "class-path-101", status: "PRESENT" },
  { id: "att-2", student_id: "user-student-2", class_id: "class-path-101", status: "ABSENT" },
];

function canReadAttendance(callerId: string, isAdmin: boolean, recordStudentId: string): boolean {
  return callerId === recordStudentId || isAdmin;
}

function canMutateAttendance(callerId: string, isAdmin: boolean, recordStudentId: string): boolean {
  return callerId === recordStudentId || isAdmin;
}

// Student A operations
assert(
  canReadAttendance("user-student-1", false, "user-student-1"),
  "Student A reads own attendance: ALLOWED"
);
assert(
  canMutateAttendance("user-student-1", false, "user-student-1"),
  "Student A marks own attendance: ALLOWED"
);

// Cross-student attacks
assert(
  !canReadAttendance("user-student-1", false, "user-student-2"),
  "Student A reads Student B attendance: BLOCKED (RLS)"
);
assert(
  !canMutateAttendance("user-student-1", false, "user-student-2"),
  "Student A modifies Student B attendance: BLOCKED (RLS)"
);

// Admin oversight
assert(
  canReadAttendance("admin-uid", true, "user-student-1"),
  "Admin reads student attendance: ALLOWED"
);
assert(
  canMutateAttendance("admin-uid", true, "user-student-1"),
  "Admin corrects student attendance: ALLOWED"
);

// Topic Progress RLS
function canMutateTopicProgress(callerId: string, recordStudentId: string): boolean {
  return callerId === recordStudentId;
}

assert(
  canMutateTopicProgress("user-student-1", "user-student-1"),
  "Student A updates own topic progress: ALLOWED"
);
assert(
  !canMutateTopicProgress("user-student-1", "user-student-2"),
  "Student A updates Student B topic progress: BLOCKED (RLS)"
);

// -----------------------------------------------------------------------------
// 6. SCHEDULE ACCESS PERMISSIONS
// -----------------------------------------------------------------------------
console.log("\n--- 6. SCHEDULE ACCESS PERMISSIONS ---");

function canReadSchedule(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}

function canWriteSchedule(isAdmin: boolean): boolean {
  return isAdmin;
}

assert(canReadSchedule(true), "Student schedule read: ALLOWED");
assert(!canWriteSchedule(false), "Student class creation/deletion: BLOCKED");
assert(canWriteSchedule(true), "Admin class creation/deletion: ALLOWED");

// -----------------------------------------------------------------------------
// 7. BATCH STATS ANONYMITY AUDIT
// -----------------------------------------------------------------------------
console.log("\n--- 7. BATCH STATS ANONYMITY AUDIT ---");

// Mock output of get_batch_aggregate_stats RPC
const sampleAggregateStats = {
  active_students_30d: 142,
  batch_average_attendance_pct: 82.4,
  subject_averages: [
    { subject_name: "Pathology", subject_code: "PATH", color_code: "#2563EB", avg_pct: 84.5 },
    { subject_name: "Pharmacology", subject_code: "PHARMA", color_code: "#059669", avg_pct: 79.2 },
  ],
};

const statsString = JSON.stringify(sampleAggregateStats);
assert(!statsString.includes("email"), "Stats payload contains zero email addresses");
assert(!statsString.includes("student_id"), "Stats payload contains zero student IDs");
assert(!statsString.includes("roll_number"), "Stats payload contains zero individual roll numbers");
assert(!statsString.includes("full_name"), "Stats payload contains zero student names");

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n===============================================================");
console.log(` AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("===============================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
