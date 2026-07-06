/**
 * Formats an ISO timestamp as a German relative time string (e.g. "vor 5 Minuten").
 * Pure and presentation-only — shared by the content cards.
 */
export function formatRelativeTime(updatedAt: string): string {
  return new Intl.RelativeTimeFormat("de", { numeric: "auto" }).format(
    Math.round((new Date(updatedAt).getTime() - Date.now()) / 60000),
    "minute"
  );
}
