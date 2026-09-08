import { isValidRollNumber, getRollNumberSuffix, resolveBatchForRoll } from "./lib/utils/batch.ts";
import type { Batch } from "./types/database.ts";

const mockBatches: Batch[] = [
  {
    id: "batch-a-uuid",
    name: "Batch A",
    roll_min: 1,
    roll_max: 40,
    is_default_fallback: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "batch-b-uuid",
    name: "Batch B",
    roll_min: 41,
    roll_max: 80,
    is_default_fallback: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "batch-c-uuid",
    name: "Batch C",
    roll_min: 81,
    roll_max: 999,
    is_default_fallback: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

console.log("=== PHASE 2: AUTH & ONBOARDING UNIT TESTS ===");

// 1. Roll Number Format Tests
const testCases = [
  { input: "24001", expected: true },
  { input: "24040", expected: true },
  { input: "24080", expected: true },
  { input: "24123", expected: true },
  { input: "23001", expected: false, reason: "Wrong year" },
  { input: "2401", expected: false, reason: "Too short (4 digits)" },
  { input: "240001", expected: false, reason: "Too long (6 digits)" },
  { input: "24ABC", expected: false, reason: "Alphanumeric" },
  { input: "", expected: false, reason: "Empty" },
];

let failed = 0;
testCases.forEach((tc) => {
  const result = isValidRollNumber(tc.input);
  if (result !== tc.expected) {
    console.error(`FAIL: isValidRollNumber("${tc.input}") = ${result}, expected ${tc.expected} (${tc.reason})`);
    failed++;
  } else {
    console.log(`PASS: isValidRollNumber("${tc.input}") = ${result}`);
  }
});

// 2. Batch Allocation Tests
const batchTests = [
  { roll: "24001", expectedBatch: "Batch A" },
  { roll: "24040", expectedBatch: "Batch A" },
  { roll: "24041", expectedBatch: "Batch B" },
  { roll: "24080", expectedBatch: "Batch B" },
  { roll: "24081", expectedBatch: "Batch C" },
  { roll: "24125", expectedBatch: "Batch C" },
];

batchTests.forEach((bt) => {
  const resolved = resolveBatchForRoll(bt.roll, mockBatches);
  if (resolved?.name !== bt.expectedBatch) {
    console.error(`FAIL: resolveBatchForRoll("${bt.roll}") = ${resolved?.name}, expected ${bt.expectedBatch}`);
    failed++;
  } else {
    console.log(`PASS: resolveBatchForRoll("${bt.roll}") = ${resolved?.name}`);
  }
});

// 3. Admin Detection Tests
const adminEmail = "vipulrameshkanaujiya@gmail.com";
const emailTests = [
  { email: "vipulrameshkanaujiya@gmail.com", expectedAdmin: true },
  { email: "VIPULRAMESHKANAUJIYA@GMAIL.COM", expectedAdmin: true },
  { email: "student24001@gmail.com", expectedAdmin: false },
  { email: "other.admin@gmail.com", expectedAdmin: false },
];

emailTests.forEach((et) => {
  const isAdmin = et.email.toLowerCase() === adminEmail.toLowerCase();
  if (isAdmin !== et.expectedAdmin) {
    console.error(`FAIL: Admin check for ${et.email} = ${isAdmin}, expected ${et.expectedAdmin}`);
    failed++;
  } else {
    console.log(`PASS: Admin check for ${et.email} = ${isAdmin ? "ADMIN" : "STUDENT"}`);
  }
});

if (failed > 0) {
  console.error(`\nTotal failures: ${failed}`);
  process.exit(1);
} else {
  console.log("\nALL PHASE 2 UNIT TESTS PASSED SUCCESSFULLY!");
}
