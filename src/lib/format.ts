import { CURRENCY } from "./constants";

/* -------------------------------------------------------------------------- */
/* Number + unit formatting                                                    */
/* -------------------------------------------------------------------------- */

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number, opts?: { whole?: boolean }): string {
  if (!Number.isFinite(value)) return "—";
  return opts?.whole
    ? wholeCurrencyFormatter.format(value)
    : currencyFormatter.format(value);
}

/**
 * Signed currency, e.g. "−$3.20" / "+$1.05". Uses a real minus sign.
 *
 * The sign is decided by the value **as displayed**, not as passed. A raw
 * −0.001 formats to "$0.00", and prefixing a minus would show a sign on an
 * amount the reader sees as zero — a saving that does not exist.
 *
 * The question "does this display as zero?" is answered by the same formatter
 * that produces the digits, rather than by a parallel `Math.round`. The two do
 * not always agree: `Math.round` breaks ties toward +∞ (so −0.005 rounds to −0)
 * while `Intl` rounds half away from zero (so −0.005 displays as −$0.01). Asking
 * the formatter removes that discrepancy by construction.
 */
export function formatSignedCurrency(value: number, opts?: { whole?: boolean }): string {
  if (!Number.isFinite(value)) return "—";

  const magnitude = formatCurrency(Math.abs(value), opts);
  // Zero is written the same way regardless of sign, so compare against it.
  const zero = formatCurrency(0, opts);
  if (magnitude === zero) return zero;

  return value < 0 ? `\u2212${magnitude}` : `+${magnitude}`;
}

export function formatNumber(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatPercent(fraction: number, digits = 0): string {
  if (!Number.isFinite(fraction)) return "—";
  return `${formatNumber(fraction * 100, digits)}%`;
}

export function formatWeight(lb: number, digits = 1): string {
  if (!Number.isFinite(lb)) return "—";
  return `${formatNumber(lb, digits)} lb`;
}

export function formatBags(bags: number, digits = 1): string {
  if (!Number.isFinite(bags)) return "—";
  return `${formatNumber(bags, digits)} ${Math.abs(bags) === 1 ? "bag" : "bags"}`;
}

/** Formats a metric value according to its unit. */
export function formatByUnit(
  value: number,
  unit: "bags" | "usd" | "lb" | "trips",
  digits?: number,
): string {
  switch (unit) {
    case "usd":
      return formatCurrency(value, { whole: digits === 0 });
    case "bags":
      return formatBags(value, digits ?? 1);
    case "lb":
      return formatWeight(value, digits ?? 1);
    case "trips":
      return `${formatNumber(value, digits ?? 1)} ${Math.abs(value) === 1 ? "trip" : "trips"}`;
  }
}

/** Short unit suffix, for chart axes and inline labels. */
export function unitSuffix(unit: "bags" | "usd" | "lb" | "trips"): string {
  switch (unit) {
    case "usd":
      return "$";
    case "bags":
      return "bags";
    case "lb":
      return "lb";
    case "trips":
      return "trips";
  }
}

/**
 * Compact axis label: $1.2k / 1.2k / 12.
 *
 * The sign leads the currency symbol ("−$1.5k", not "$-1.5k") so axis labels
 * read the same way as every other figure in the app. Charts currently plot
 * non-negative magnitudes only, but a negative axis is one data change away.
 */
export function formatAxisValue(value: number, unit: "bags" | "usd" | "lb" | "trips"): string {
  const negative = value < 0;
  const abs = Math.abs(value);
  const prefix = negative ? "\u2212" : "";
  const symbol = unit === "usd" ? "$" : "";
  if (abs >= 1000) return `${prefix}${symbol}${formatNumber(abs / 1000, 1)}k`;
  if (abs >= 10) return `${prefix}${symbol}${formatNumber(abs, 0)}`;
  return `${prefix}${symbol}${formatNumber(abs, 1)}`;
}

/* -------------------------------------------------------------------------- */
/* Date formatting                                                             */
/* -------------------------------------------------------------------------- */

/** Parses an ISO date-only string as UTC so time zones cannot shift the day. */
export function parseIsoDate(iso: string): Date {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return new Date(dateOnly ? `${iso}T00:00:00Z` : iso);
}

export function formatDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function formatLongDate(iso: string): string {
  const d = parseIsoDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function daysUntil(iso: string, from: Date = new Date()): number {
  const target = parseIsoDate(iso);
  if (Number.isNaN(target.getTime())) return Number.NaN;
  const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  return Math.round((target.getTime() - start) / 86_400_000);
}

/** "in 12 days" / "today" / "14 days ago". */
export function formatRelativeDays(iso: string, from: Date = new Date()): string {
  const days = daysUntil(iso, from);
  if (!Number.isFinite(days)) return "date unknown";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return `in ${days} days`;
  return `${Math.abs(days)} days ago`;
}

/** ISO date string for "today" in UTC — stable across server and client. */
export function todayIso(from: Date = new Date()): string {
  return from.toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Text helpers                                                                */
/* -------------------------------------------------------------------------- */

/** Trims and collapses whitespace without touching internal punctuation. */
export function normaliseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function pluralise(count: number, singular: string, plural?: string): string {
  const p = plural ?? `${singular}s`;
  return Math.abs(count) === 1 ? singular : p;
}

/** Counts words — used for story validation feedback. */
export function wordCount(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}
