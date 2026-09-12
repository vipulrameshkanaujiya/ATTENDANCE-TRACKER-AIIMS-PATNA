import type { Batch } from "../../types/database.ts";

/**
 * Validates whether a roll number conforms to the strict 5-digit format "2[1-4]___".
 * Example: 24001, 24040, 24080, 24123, 21114, 22064, 23033 are valid.
 */
export function isValidRollNumber(rollNumber: string): boolean {
  if (!rollNumber || typeof rollNumber !== "string") return false;
  return /^2[1-4]\d{3}$/.test(rollNumber.trim());
}

/**
 * Extracts the 3-digit suffix from the roll number as an integer.
 * e.g. "24042" -> 42
 */
export function getRollNumberSuffix(rollNumber: string): number | null {
  if (!isValidRollNumber(rollNumber)) return null;
  // Note: Only makes sense for 24xxx for range checking.
  const suffixStr = rollNumber.trim().substring(2);
  const parsed = parseInt(suffixStr, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Determines which batch a roll number belongs to based on the dynamic batches list.
 * Default standard batch mapping:
 * - Legacy (21xxx, 22xxx, 23xxx): Batch C
 * - Batch A: 1 to 40 (for 24xxx)
 * - Batch B: 41 to 80 (for 24xxx)
 * - Batch C: 81+ (or fallback)
 */
export function resolveBatchForRoll(rollNumber: string, batches: Batch[]): Batch | null {
  if (!isValidRollNumber(rollNumber) || !batches || batches.length === 0) return null;
  
  const roll = rollNumber.trim();
  
  // Legacy rolls -> Batch C
  if (roll.startsWith("21") || roll.startsWith("22") || roll.startsWith("23")) {
    const fallback = batches.find((b) => b.is_default_fallback);
    return fallback || null;
  }

  const suffix = getRollNumberSuffix(roll);
  if (suffix === null) return null;

  // Find explicit range match
  const matchedBatch = batches.find(
    (b) => suffix >= b.roll_min && suffix <= b.roll_max
  );
  if (matchedBatch) return matchedBatch;

  // Fallback to designated fallback batch (e.g. Batch C for 81 onwards + old students)
  const fallback = batches.find((b) => b.is_default_fallback);
  return fallback || null;
}
