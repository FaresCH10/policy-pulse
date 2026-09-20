import { describe, expect, it } from "vitest";
import {
  formatAxisValue,
  formatBags,
  formatByUnit,
  formatCurrency,
  formatRelativeDays,
  formatSignedCurrency,
  daysUntil,
  wordCount,
} from "./format";

/**
 * Formatting is the last thing between a number and the reader, so these tests
 * cover the boundaries where a formatting mistake becomes a *factual* mistake —
 * a minus sign on zero reads as a saving, a misplaced sign reads as a different
 * quantity.
 */
describe("formatSignedCurrency", () => {
  it("renders a real minus sign for negative values and a plus for positive", () => {
    expect(formatSignedCurrency(-2.6)).toBe("\u2212$2.60");
    expect(formatSignedCurrency(2.6)).toBe("+$2.60");
    expect(formatSignedCurrency(-12.5)).toBe("\u2212$12.50");
  });

  it("renders zero with no sign at all", () => {
    expect(formatSignedCurrency(0)).toBe("$0.00");
    expect(formatSignedCurrency(-0)).toBe("$0.00");
  });

  /*
   * The defect this guards: a raw value between -0.005 and 0 formats as "$0.00"
   * but used to keep its minus sign, so the tile read "−$0.00" — a minus sign on
   * an amount the reader sees as zero, which reads as a saving that does not
   * exist. Signing after rounding to the displayed precision is what prevents it.
   */
  it("never signs a value that displays as zero", () => {
    expect(formatSignedCurrency(-0.001)).toBe("$0.00");
    expect(formatSignedCurrency(-0.0049)).toBe("$0.00");
    expect(formatSignedCurrency(-1e-9)).toBe("$0.00");
    expect(formatSignedCurrency(-0.000001)).toBe("$0.00");
    // ...and the mirror case must not gain a plus sign either.
    expect(formatSignedCurrency(0.001)).toBe("$0.00");
    expect(formatSignedCurrency(1e-9)).toBe("$0.00");
  });

  /*
   * The sign must agree with the digits the formatter actually prints. These two
   * are the cases where a parallel `Math.round` would disagree with `Intl`:
   * `Math.round` breaks ties toward +∞ (−0.005 → −0) but `Intl` rounds half away
   * from zero, so −0.005 is displayed as −$0.01 and must therefore carry a sign.
   */
  it("signs a value by what the formatter displays, not by a parallel rounding", () => {
    expect(formatCurrency(Math.abs(-0.005))).toBe("$0.01");
    expect(formatSignedCurrency(-0.005)).toBe("\u2212$0.01");
    expect(formatSignedCurrency(-0.015)).toBe("\u2212$0.02");
    expect(formatSignedCurrency(-0.006)).toBe("\u2212$0.01");
    expect(formatSignedCurrency(0.005)).toBe("+$0.01");
  });

  it("applies the same zero rule in whole-dollar mode", () => {
    expect(formatSignedCurrency(-0.4, { whole: true })).toBe("$0");
    expect(formatSignedCurrency(-12.48, { whole: true })).toBe("\u2212$12");
    expect(formatSignedCurrency(0, { whole: true })).toBe("$0");
  });

  it("falls back to an em dash for values that are not finite", () => {
    expect(formatSignedCurrency(Number.NaN)).toBe("\u2014");
    expect(formatSignedCurrency(Number.POSITIVE_INFINITY)).toBe("\u2014");
    expect(formatSignedCurrency(Number.NEGATIVE_INFINITY)).toBe("\u2014");
  });
});

describe("formatAxisValue", () => {
  it("puts the sign before the currency symbol, not between them", () => {
    // "$-1.5k" tells the reader the wrong thing about which quantity this is.
    expect(formatAxisValue(-1500, "usd")).toBe("\u2212$1.5k");
    expect(formatAxisValue(-1000, "usd")).toBe("\u2212$1.0k");
    expect(formatAxisValue(-12, "usd")).toBe("\u2212$12");
    expect(formatAxisValue(-1.5, "usd")).toBe("\u2212$1.5");
  });

  it("leaves non-currency units with a leading sign only", () => {
    expect(formatAxisValue(-1500, "bags")).toBe("\u22121.5k");
    expect(formatAxisValue(-12, "lb")).toBe("\u221212");
  });

  it("formats positive values as before", () => {
    expect(formatAxisValue(0, "usd")).toBe("$0.0");
    expect(formatAxisValue(1.5, "usd")).toBe("$1.5");
    expect(formatAxisValue(12, "usd")).toBe("$12");
    expect(formatAxisValue(1000, "usd")).toBe("$1.0k");
    expect(formatAxisValue(1500, "usd")).toBe("$1.5k");
    expect(formatAxisValue(12, "bags")).toBe("12");
  });

  it("does not double the minus sign on small negatives", () => {
    expect(formatAxisValue(-0.5, "usd")).toBe("\u2212$0.5");
    expect(formatAxisValue(-0.5, "bags")).toBe("\u22120.5");
  });
});

describe("formatCurrency", () => {
  it("returns an em dash rather than NaN text", () => {
    expect(formatCurrency(Number.NaN)).toBe("\u2014");
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("\u2014");
  });

  it("formats to whole dollars when asked", () => {
    expect(formatCurrency(12.49, { whole: true })).toBe("$12");
    expect(formatCurrency(12.5, { whole: true })).toBe("$13");
  });
});

describe("pluralisation and units", () => {
  it("uses the singular only for exactly one", () => {
    expect(formatBags(1)).toBe("1.0 bag");
    expect(formatBags(0)).toBe("0.0 bags");
    expect(formatBags(1.04, 1)).toBe("1.0 bags");
    expect(formatBags(2)).toBe("2.0 bags");
  });

  it("treats negative one as singular", () => {
    expect(formatByUnit(-1, "trips")).toBe("-1.0 trip");
    expect(formatByUnit(1, "trips")).toBe("1.0 trip");
    expect(formatByUnit(2, "trips")).toBe("2.0 trips");
  });
});

describe("date helpers", () => {
  const from = new Date("2026-09-19T12:00:00Z");

  it("counts whole days in UTC so a time zone cannot shift the day", () => {
    expect(daysUntil("2026-09-19", from)).toBe(0);
    expect(daysUntil("2026-09-20", from)).toBe(1);
    expect(daysUntil("2026-09-18", from)).toBe(-1);
    expect(daysUntil("2026-09-21", from)).toBe(2);
  });

  it("reads an offset timestamp as the day it falls on", () => {
    // 00:30+03:00 on the 20th is 21:30Z on the 19th — one day ahead of `from`.
    expect(daysUntil("2026-09-20T00:30:00+03:00", from)).toBe(1);
  });

  it("labels today, tomorrow and yesterday", () => {
    expect(formatRelativeDays("2026-09-19", from)).toBe("today");
    expect(formatRelativeDays("2026-09-20", from)).toBe("tomorrow");
    expect(formatRelativeDays("2026-09-18", from)).toBe("yesterday");
    expect(formatRelativeDays("2026-09-21", from)).toBe("in 2 days");
    expect(formatRelativeDays("2026-09-14", from)).toBe("5 days ago");
  });

  it("says so rather than inventing a date it cannot parse", () => {
    expect(formatRelativeDays("not-a-date", from)).toBe("date unknown");
  });
});

describe("wordCount", () => {
  it("treats whitespace-only input as empty", () => {
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
    expect(wordCount("\n\t ")).toBe(0);
  });

  it("does not split on internal punctuation", () => {
    expect(wordCount("a-b c")).toBe(2);
    expect(wordCount("well-known, widely-cited policy")).toBe(3);
  });
});
