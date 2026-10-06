/**
 * Date formatting helpers.
 *
 * All formatting is done in UTC and derived from a fixed NOW anchor so the
 * static frontend renders identically on the server and the client (no
 * hydration mismatches, no ticking timers).
 */

/** Fixed "now" for the mock data. Monday, October 5, 2026, 12:00 UTC. */
export const NOW = new Date("2026-10-05T12:00:00.000Z");

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function toDate(input: Date | string): Date {
  return typeof input === "string" ? new Date(input) : input;
}

/** "Oct 5, 2026" */
export function formatDate(input: Date | string): string {
  const d = toDate(input);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** "Oct 5, 09:24" */
export function formatDateTime(input: Date | string): string {
  const d = toDate(input);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${hh}:${mm}`;
}

/** "Monday, October 5" (for dashboard headers) */
export function formatLongDay(input: Date | string): string {
  const d = toDate(input);
  return `${DAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * Relative time against the fixed NOW anchor: "just now", "5m ago",
 * "3h ago", "2d ago", falling back to an absolute date for anything older.
 */
export function formatRelativeTime(input: Date | string): string {
  const d = toDate(input);
  const diffMs = NOW.getTime() - d.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

/** "3h 12m" style duration between two dates (used for response times). */
export function formatDuration(from: Date | string, to: Date | string = NOW): string {
  const totalMinutes = Math.max(
    0,
    Math.floor((toDate(to).getTime() - toDate(from).getTime()) / 60_000),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/** Group key for day-separated activity feeds: "Today" | "Yesterday" | "Oct 2". */
export function formatDayGroup(input: Date | string): string {
  const d = toDate(input);
  const days = Math.floor((NOW.getTime() - d.getTime()) / 86_400_000);
  if (days < 1) return "Today";
  if (days < 2) return "Yesterday";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/**
 * Percent of an SLA window elapsed, from creation → deadline.
 * Values clamp to [0, 100]; deadlines in the past return 100.
 */
export function slaPercentUsed(
  createdAt: Date | string,
  slaDeadline: Date | string,
): number {
  const created = toDate(createdAt).getTime();
  const total = toDate(slaDeadline).getTime() - created;
  if (total <= 0) return 100;
  const used = NOW.getTime() - created;
  return Math.round((used / total) * 100);
}

/** Hours left until a deadline, e.g. "3h left" or "1d 4h left". */
export function formatTimeLeft(deadline: Date | string): string {
  const remainingMs = toDate(deadline).getTime() - NOW.getTime();
  if (remainingMs <= 0) return "Time exceeded";
  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  if (hours < 1) return `${minutes}m left`;
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h left`;
}
