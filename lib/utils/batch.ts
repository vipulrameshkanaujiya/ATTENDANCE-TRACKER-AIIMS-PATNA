import type { Batch } from "../../types/database.ts";

/**
 * Validates whether a roll number conforms to the strict 5-digit format "24___".
 * Example: 24001, 24040, 24080, 24123 are valid.
 */
export function isValidRollNumber(rollNumber: string): boolean {
  if (!rollNumber || typeof rollNumber !== "string") return false;
  return /^24[0-9]{3}$/.test(rollNumber.trim());
}

/**
 * Extracts the 3-digit suffix from the roll number as an integer.
 * e.g. "24042" -> 42
 */
export function getRollNumberSuffix(rollNumber: string): number | null {
  if (!isValidRollNumber(rollNumber)) return null;
  const suffixStr = rollNumber.trim().substring(2);
  const parsed = parseInt(suffixStr, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Determines which batch a roll number belongs to based on the dynamic batches list.
 * Default standard batch mapping:
 * - Batch A: 1 to 40
 * - Batch B: 41 to 80
 * - Batch C: 81+ (or fallback)
 */
export function resolveBatchForRoll(rollNumber: string, batches: Batch[]): Batch | null {
  const suffix = getRollNumberSuffix(rollNumber);
  if (suffix === null || !batches || batches.length === 0) return null;

  // Find explicit range match
  const matchedBatch = batches.find(
    (b) => suffix >= b.roll_min && suffix <= b.roll_max
  );
  if (matchedBatch) return matchedBatch;

  // Fallback to designated fallback batch (e.g. Batch C for 81 onwards + old students)
  const fallback = batches.find((b) => b.is_default_fallback);
  return fallback || null;
}
