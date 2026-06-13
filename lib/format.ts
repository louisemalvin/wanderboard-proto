// ------------------------------------------------------------------
// Formatting Utilities
// Named exports only — no default exports
// ------------------------------------------------------------------

/**
 * Format an ISO 8601 date string into a human-readable date.
 * Example: "2026-06-12T12:00:00.000Z" => "Jun 12, 2026"
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a duration in minutes into a human-readable string.
 * Examples:
 *   30  => "30 min"
 *   60  => "1 hr"
 *   90  => "1 hr 30 min"
 *   180 => "3 hr"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 0) {
    return "0 min";
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours} hr ${mins} min`;
  }
  if (hours > 0) {
    return `${hours} hr`;
  }
  return `${mins} min`;
}

/**
 * Convert a deterministic HH:mm value to minutes after midnight.
 * Returns null for malformed or out-of-range input.
 */
export function parseTimeToMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

/**
 * Format minutes after midnight as HH:mm without using the current clock or timezone.
 * Values wrap within a 24-hour day so shifted day-flow estimates remain deterministic.
 */
export function formatTimeFromMinutes(minutesAfterMidnight: number): string {
  const minutesInDay = 24 * 60;
  const normalized = ((Math.round(minutesAfterMidnight) % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Format an approximate itinerary marker. The leading ~ is intentional: these are
 * planning estimates, not appointments or live route-provider timestamps.
 */
export function formatApproximateTime(minutesAfterMidnight: number): string {
  return `~${formatTimeFromMinutes(minutesAfterMidnight)}`;
}

/**
 * Format a city and country into a location string.
 * Example: ("Tokyo", "Japan") => "Tokyo, Japan"
 */
export function formatLocation(city: string, country: string): string {
  return `${city}, ${country}`;
}

/**
 * Format a money range as a string with the given currency symbol.
 * Example: ({ currency: "USD", min: 10, max: 50 }) => "$10 – $50"
 */
export function formatMoneyRange(
  min: number,
  max: number,
  currency: string = "USD"
): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${min} – ${symbol}${max}`;
}

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    KRW: "₩",
    CNY: "¥",
  };
  return symbols[currency.toUpperCase()] ?? currency + " ";
}
