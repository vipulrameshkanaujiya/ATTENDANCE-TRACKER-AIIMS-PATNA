/**
 * Calculates attendance percentage according to:
 * attended applicable sessions / total applicable sessions * 100
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (!total || total <= 0) return 0;
  const pct = (attended / total) * 100;
  return Math.round(pct * 10) / 10;
}

/**
 * Formats a percentage nicely with 1 decimal place (e.g., "84.5%" or "84%")
 */
export function formatPercentage(pct: number): string {
  if (isNaN(pct)) return "0%";
  return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(1)}%`;
}

/**
 * Returns color tokens according to medical standard thresholds
 * >= 75%: Emerald
 * >= 65% & < 75%: Amber
 * < 65%: Rose
 */
export function getAttendanceColor(pct: number): {
  badge: string;
  bar: string;
  text: string;
} {
  if (pct >= 75) {
    return {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      bar: "bg-emerald-500",
      text: "text-emerald-700",
    };
  }
  if (pct >= 65) {
    return {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      bar: "bg-amber-500",
      text: "text-amber-700",
    };
  }
  return {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
    text: "text-rose-700",
  };
}

/**
 * Specifically targeted subjects requiring Theory vs Practical split:
 * - Pathology (PATH)
 * - Pharmacology (PHARMA)
 * - Microbiology (MICRO)
 * - Forensic Medicine & Toxicology (FMT)
 * - Community & Family Medicine (CFM)
 */
export const SPLIT_SUBJECT_CODES = ["PATH", "PHARMA", "MICRO", "FMT", "CFM"] as const;

/**
 * Theory Attendance: Lecture, SDL, Integration, Tutorial
 */
export const THEORY_CLASS_TYPES = ["Lecture", "SDL", "Integration", "Tutorial"] as const;

/**
 * Practical Attendance: Practical
 */
export const PRACTICAL_CLASS_TYPES = ["Practical"] as const;

export function isTheoryClass(classType?: string | null): boolean {
  if (!classType) return false;
  return (THEORY_CLASS_TYPES as readonly string[]).includes(classType);
}

export function isPracticalClass(classType?: string | null): boolean {
  if (!classType) return false;
  return (PRACTICAL_CLASS_TYPES as readonly string[]).includes(classType);
}

export function isSplitSubject(subjectCode?: string | null, subjectName?: string | null): boolean {
  if (!subjectCode && !subjectName) return false;
  const code = (subjectCode || "").trim().toUpperCase();
  const name = (subjectName || "").trim().toLowerCase();

  if ((SPLIT_SUBJECT_CODES as readonly string[]).includes(code)) return true;

  if (
    name.includes("pathology") ||
    name.includes("pharmacology") ||
    name.includes("microbiology") ||
    name.includes("forensic") ||
    name.includes("fmt") ||
    name.includes("community") ||
    name.includes("cfm")
  ) {
    return true;
  }
  return false;
}

export interface AttendanceBucket {
  attended: number;
  total: number;
  percentage: number;
}

export interface SubjectAttendanceBreakdown {
  id: string;
  name: string;
  code: string;
  color: string;
  is_split: boolean;
  attended: number;
  total: number;
  percentage: number;
  theory?: AttendanceBucket;
  practical?: AttendanceBucket;
}

/**
 * Computes individual subject breakdown with theory/practical separation for the 5 target subjects.
 */
export function buildSubjectAttendanceBreakdown(
  subjects: Array<{ id: string; name: string; code: string; color_code?: string; display_order?: number }>,
  records: Array<{
    status: string;
    class?: {
      subject_id?: string | null;
      class_type?: string | null;
    } | null;
  }>
): Record<string, SubjectAttendanceBreakdown> {
  const map: Record<string, SubjectAttendanceBreakdown> = {};

  (subjects || []).forEach((s) => {
    const isSplit = isSplitSubject(s.code, s.name);
    map[s.id] = {
      id: s.id,
      name: s.name,
      code: s.code,
      color: s.color_code || "#2563EB",
      is_split: isSplit,
      attended: 0,
      total: 0,
      percentage: 0,
      ...(isSplit
        ? {
            theory: { attended: 0, total: 0, percentage: 0 },
            practical: { attended: 0, total: 0, percentage: 0 },
          }
        : {}),
    };
  });

  (records || []).forEach((r) => {
    const subId = r.class?.subject_id;
    if (!subId || !map[subId]) return;

    const sub = map[subId];
    const isPresent = r.status === "PRESENT";
    const classType = r.class?.class_type;

    sub.total += 1;
    if (isPresent) sub.attended += 1;

    if (sub.is_split) {
      if (isTheoryClass(classType) && sub.theory) {
        sub.theory.total += 1;
        if (isPresent) sub.theory.attended += 1;
      } else if (isPracticalClass(classType) && sub.practical) {
        sub.practical.total += 1;
        if (isPresent) sub.practical.attended += 1;
      }
    }
  });

  Object.values(map).forEach((sub) => {
    sub.percentage = sub.total > 0 ? Math.round((sub.attended / sub.total) * 100) : 0;
    if (sub.is_split) {
      if (sub.theory) {
        sub.theory.percentage =
          sub.theory.total > 0
            ? Math.round((sub.theory.attended / sub.theory.total) * 100)
            : 0;
      }
      if (sub.practical) {
        sub.practical.percentage =
          sub.practical.total > 0
            ? Math.round((sub.practical.attended / sub.practical.total) * 100)
            : 0;
      }
    }
  });

  return map;
}

