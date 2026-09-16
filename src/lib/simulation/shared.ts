/**
 * Shared numeric helpers for the simulation engine.
 *
 * Everything in this module is pure and side-effect free. The engine never
 * reads from the DOM, storage, or the network, which is what makes every
 * formula directly unit-testable.
 */

/** Constrains a number to an inclusive range. Non-finite input → `min`. */
export function clamp(value: number, min: number, max: number): number {
  const n = toFiniteNumber(value, min);
  return Math.min(Math.max(n, min), max);
}

/** Guards against NaN / Infinity / undefined leaking into a calculation. */
export function toFiniteNumber(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Negative inputs are treated as zero — no formula here produces a debt. */
export function nonNegative(value: unknown): number {
  return Math.max(0, toFiniteNumber(value, 0));
}

/** Rounds for display only. All internal maths keeps full precision. */
export function roundTo(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round((toFiniteNumber(value) + Number.EPSILON) * factor) / factor;
}

/**
 * Monthly ↔ annual conversion.
 *
 * Both directions use the same factor so the two views can never disagree:
 * `annual = monthly × 12` and `monthly = annual ÷ 12`.
 */
export const MONTHS = 12;

export function toMonthly(weekly: number): number {
  return (nonNegative(weekly) * 52) / 12;
}

export function monthlyToAnnual(monthly: number): number {
  return toFiniteNumber(monthly) * MONTHS;
}

/** "1.5 × 4 = 6" — used to build readable substitution strings. */
export function substitution(parts: (string | number)[], operator = " × "): string {
  return parts.map((p) => (typeof p === "number" ? trimNumber(p) : p)).join(operator);
}

/** Compact number rendering for formula traces: 4, 0.6, 17.33. */
export function trimNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = roundTo(value, digits);
  return String(rounded);
}

/** True when two floats are effectively identical (used for change detection). */
export function approxEqual(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) < epsilon;
}

/** Sorted unique list, used for building tag/filter option sets. */
export function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
