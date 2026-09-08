import fs from "fs";
import path from "path";

console.log("=== PHASE 3: DATABASE SCHEMA & SECURITY AUDIT ===");

const schemaPath = path.resolve("./supabase/schema.sql");
const schemaSql = fs.readFileSync(schemaPath, "utf-8");

const expectedTables = [
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
];

let failed = 0;

// 1. Check all 11 tables
expectedTables.forEach((table) => {
  const tableRegex = new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\s*\\(`, "i");
  if (tableRegex.test(schemaSql)) {
    console.log(`PASS: Table public.${table} defined.`);
  } else {
    console.error(`FAIL: Table public.${table} missing from schema.`);
    failed++;
  }
});

// 2. Check RLS enablement
expectedTables.forEach((table) => {
  const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`, "i");
  if (rlsRegex.test(schemaSql)) {
    console.log(`PASS: RLS enabled on public.${table}.`);
  } else {
    console.error(`FAIL: RLS missing on public.${table}.`);
    failed++;
  }
});

// 3. Check Key Constraints
const requiredConstraints = [
  { name: "Roll number format regex", pattern: /\^24\[0-9\]\{3\}\$/ },
  { name: "Attendance unique (student_id, class_id)", pattern: /UNIQUE\s*\(\s*student_id\s*,\s*class_id\s*\)/i },
  { name: "Topic progress unique (student_id, topic_id)", pattern: /UNIQUE\s*\(\s*student_id\s*,\s*topic_id\s*\)/i },
  { name: "Units unique (subject_id, unit_number)", pattern: /UNIQUE\s*\(\s*subject_id\s*,\s*unit_number\s*\)/i },
  { name: "is_admin() helper function", pattern: /FUNCTION public\.is_admin\(\)/i },
  { name: "get_batch_aggregate_stats() RPC", pattern: /FUNCTION public\.get_batch_aggregate_stats\(\)/i },
];

requiredConstraints.forEach((c) => {
  if (c.pattern.test(schemaSql)) {
    console.log(`PASS: Constraint/Function verified: ${c.name}`);
  } else {
    console.error(`FAIL: Missing constraint/function: ${c.name}`);
    failed++;
  }
});

// 4. Check Policies
const requiredPolicies = [
  "Attendance read own or admin",
  "Attendance insert own or admin",
  "Attendance update own or admin",
  "Attendance delete admin only",
  "Topic progress mutate own",
  "Users view own record or admin views all",
  "Classes admin write",
];

requiredPolicies.forEach((p) => {
  if (schemaSql.includes(p)) {
    console.log(`PASS: Security Policy verified: "${p}"`);
  } else {
    console.error(`FAIL: Security Policy missing: "${p}"`);
    failed++;
  }
});

if (failed > 0) {
  console.error(`\nTotal failures: ${failed}`);
  process.exit(1);
} else {
  console.log(`\nALL PHASE 3 DATABASE SCHEMA & SECURITY POLICIES VERIFIED (0 errors)!`);
}
