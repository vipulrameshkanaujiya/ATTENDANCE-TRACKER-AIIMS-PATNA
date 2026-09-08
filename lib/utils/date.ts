/**
 * Timezone-aware date utilities for Medical Student Hub / Attendance Tracker
 * Canonical timezone: Asia/Kolkata (IST, UTC+05:30)
 */

export const INSTITUTION_TIMEZONE = "Asia/Kolkata";

/**
 * Returns the current date in YYYY-MM-DD format according to IST
 */
export function getTodayDateString(d: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: INSTITUTION_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}

/**
 * Returns current time in HH:mm:ss format according to IST
 */
export function getCurrentTimeString(d: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: INSTITUTION_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(d);
    const getP = (type: string) => parts.find((p) => p.type === type)?.value || "00";
    let hour = getP("hour");
    if (hour === "24") hour = "00";
    return `${hour}:${getP("minute")}:${getP("second")}`;
  } catch {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
}

/**
 * Parses YYYY-MM-DD into a Date object at midday local time to prevent timezone day-shift
 */
export function parseDateString(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] || 2026;
  const m = (parts[1] || 1) - 1;
  const d = parts[2] || 1;
  return new Date(y, m, d, 12, 0, 0);
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDateToYYYYMMDD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string
 */
export function shiftDateString(dateStr: string, daysDelta: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + daysDelta);
  return formatDateToYYYYMMDD(d);
}

/**
 * Computes the start (Monday) and end (Sunday) of the week for a given YYYY-MM-DD
 */
export function getWeekRange(dateStr: string): { startOfWeek: string; endOfWeek: string; days: string[] } {
  const d = parseDateString(dateStr);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    days.push(formatDateToYYYYMMDD(day));
  }

  return {
    startOfWeek: days[0],
    endOfWeek: days[6],
    days,
  };
}

/**
 * Computes the start and end of the month for a given YYYY-MM-DD
 */
export function getMonthRange(dateStr: string): { startOfMonth: string; endOfMonth: string } {
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] || 2026;
  const m = parts[1] || 9;
  const startOfMonth = `${y}-${String(m).padStart(2, "0")}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const endOfMonth = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { startOfMonth, endOfMonth };
}

/**
 * Formats date string into readable user display
 */
export function formatReadableDate(dateStr: string, includeWeekday: boolean = true): string {
  const d = parseDateString(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: includeWeekday ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
