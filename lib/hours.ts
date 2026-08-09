import { DAY_LABELS, type OpeningHour } from "./types";

/** Formats "HH:MM:SS" -> "HH:MM" for display and <input type="time">. */
export function toHHMM(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

/** Sorts opening hours Sunday -> Saturday. */
export function sortByDay(hours: OpeningHour[]) {
  return [...hours].sort((a, b) => a.day_of_week - b.day_of_week);
}

export function dayLabel(dayOfWeek: number) {
  return DAY_LABELS[dayOfWeek] ?? "";
}

/**
 * Returns a short human-readable summary of today's hours for a restaurant,
 * e.g. "Open today · 18:00 - 23:00" or "Closed today".
 */
export function todaySummary(hours: OpeningHour[]) {
  const today = new Date().getDay();
  const entry = hours.find((h) => h.day_of_week === today);
  if (!entry || entry.is_closed || !entry.open_time || !entry.close_time) {
    return "Closed today";
  }
  return `Open today · ${toHHMM(entry.open_time)} – ${toHHMM(entry.close_time)}`;
}
