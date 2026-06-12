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
