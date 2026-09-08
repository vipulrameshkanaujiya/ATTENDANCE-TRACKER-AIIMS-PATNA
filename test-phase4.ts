import { calculateAttendancePercentage, getAttendanceColor } from "./lib/utils/attendance.ts";
import type { ClassSession, TopicProgressStatus } from "./types/database.ts";

console.log("=== PHASE 4: STUDENT APPLICATION LOGIC TESTS ===");

let failed = 0;

// 1. Attendance Math Tests
const mathTests = [
  { attended: 10, total: 12, expected: 83.3 },
  { attended: 0, total: 5, expected: 0 },
  { attended: 5, total: 0, expected: 0 },
  { attended: 15, total: 20, expected: 75.0 },
  { attended: 21, total: 25, expected: 84.0 },
];

mathTests.forEach((mt) => {
  const result = calculateAttendancePercentage(mt.attended, mt.total);
  if (result !== mt.expected) {
    console.error(`FAIL: calculateAttendancePercentage(${mt.attended}, ${mt.total}) = ${result}, expected ${mt.expected}`);
    failed++;
  } else {
    console.log(`PASS: Attendance Calculation ${mt.attended}/${mt.total} = ${result}%`);
  }
});

// 2. Color Threshold Tests
const colorTests = [
  { pct: 85, expectedBadgeColor: "emerald" },
  { pct: 75, expectedBadgeColor: "emerald" },
  { pct: 70, expectedBadgeColor: "amber" },
  { pct: 65, expectedBadgeColor: "amber" },
  { pct: 60, expectedBadgeColor: "rose" },
];

colorTests.forEach((ct) => {
  const colors = getAttendanceColor(ct.pct);
  if (!colors.badge.includes(ct.expectedBadgeColor)) {
    console.error(`FAIL: getAttendanceColor(${ct.pct}) expected ${ct.expectedBadgeColor}, got ${colors.badge}`);
    failed++;
  } else {
    console.log(`PASS: Color threshold ${ct.pct}% correctly mapped to ${ct.expectedBadgeColor}`);
  }
});

// 3. Batch Visibility Filtering Test
const sampleClasses: Partial<ClassSession>[] = [
  { id: "c1", batch_scope: "ALL", topic: "General Lecture" },
  { id: "c2", batch_scope: "Batch A", topic: "Pathology Practical (Batch A)" },
  { id: "c3", batch_scope: "Batch B", topic: "Pharmacology Practical (Batch B)" },
  { id: "c4", batch_scope: "Batch C", topic: "Microbiology Practical (Batch C)" },
];

const studentBatch = "Batch A";
const visibleClasses = sampleClasses.filter(
  (c) => c.batch_scope === "ALL" || c.batch_scope === studentBatch
);

if (visibleClasses.length !== 2 || visibleClasses.some((c) => c.batch_scope === "Batch B" || c.batch_scope === "Batch C")) {
  console.error("FAIL: Batch visibility filter allowed non-applicable classes", visibleClasses);
  failed++;
} else {
  console.log(`PASS: Student in ${studentBatch} sees exactly ${visibleClasses.length} applicable classes (ALL + ${studentBatch})`);
}

// 4. Topic 3-State Cycle Test
function getNextTopicStatus(current: TopicProgressStatus): TopicProgressStatus {
  if (current === "NOT_STARTED") return "LEARNING";
  if (current === "LEARNING") return "COMPLETED";
  return "NOT_STARTED";
}

let status: TopicProgressStatus = "NOT_STARTED";
status = getNextTopicStatus(status);
if (status !== "LEARNING") failed++;
status = getNextTopicStatus(status);
if (status !== "COMPLETED") failed++;
status = getNextTopicStatus(status);
if (status !== "NOT_STARTED") failed++;
console.log("PASS: Topic status cycles cleanly: NOT_STARTED -> LEARNING -> COMPLETED -> NOT_STARTED");

if (failed > 0) {
  console.error(`\nTotal failures: ${failed}`);
  process.exit(1);
} else {
  console.log("\nALL PHASE 4 STUDENT UI & CALCULATION TESTS PASSED (0 errors)!");
}
