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
