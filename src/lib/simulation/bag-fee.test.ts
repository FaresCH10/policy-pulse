import { describe, expect, it } from "vitest";
import { simulateBagFee } from "./bag-fee";
import {
  makeBagFeeAssumptions,
  makeBagFeeParameters,
  makeProfile,
} from "./test-fixtures";

function run(
  profileOverrides = {},
  assumptionOverrides = {},
  parameterOverrides = {},
) {
  return simulateBagFee({
    policyId: "single-use-bag-fee",
    policyTitle: "Single-Use Carryout Bag Fee",
    profile: makeProfile(profileOverrides),
    assumptions: makeBagFeeAssumptions(assumptionOverrides),
    parameters: makeBagFeeParameters(parameterOverrides),
  });
}

describe("simulateBagFee", () => {
  it("applies the documented formulas", () => {
    const result = run();

    // monthly trips = 4 × 52 ÷ 12 = 17.333…
    // baseline bags = 17.333… × 3 = 52
    // remaining bags = 52 × (1 − 0.5) = 26
    // baseline cost = 52 × 0.10 = 5.20 ; fee paid = 26 × 0.10 = 2.60
    const bags = result.metrics.find((m) => m.key === "disposable-bags")!;
    const cost = result.metrics.find((m) => m.key === "bag-fee-cost")!;

    expect(bags.baselineMonthly).toBeCloseTo(52, 2);
    expect(bags.simulatedMonthly).toBeCloseTo(26, 2);
    expect(cost.baselineMonthly).toBeCloseTo(5.2, 2);
    expect(cost.simulatedMonthly).toBeCloseTo(2.6, 2);

    expect(result.headline.primaryImpactMonthly).toBeCloseTo(26, 2);
    expect(result.headline.monthlyCostChange).toBeCloseTo(-2.6, 2);
  });

  it("keeps monthly and annual figures consistent (annual = monthly × 12)", () => {
    const result = run();

    for (const metric of result.metrics) {
      expect(metric.baselineAnnual).toBeCloseTo(metric.baselineMonthly * 12, 2);
      expect(metric.simulatedAnnual).toBeCloseTo(metric.simulatedMonthly * 12, 2);
    }
    expect(result.headline.annualCostChange).toBeCloseTo(
      result.headline.monthlyCostChange * 12,
      2,
    );
    expect(result.headline.primaryImpactAnnual).toBeCloseTo(
      result.headline.primaryImpactMonthly * 12,
      2,
    );
  });

  it("handles zero grocery trips without producing NaN", () => {
    const result = run({ groceryTripsPerWeek: 0 });

    expect(result.metrics.every((m) => Number.isFinite(m.simulatedMonthly))).toBe(true);
    expect(result.headline.monthlyCostChange).toBe(0);
    expect(result.headline.primaryImpactMonthly).toBe(0);
    expect(result.warnings.some((w) => w.includes("0 grocery trips"))).toBe(true);
  });

  it("handles a zero fee: no cost, but bags are still avoided", () => {
    const result = run({}, { whatIfFeePerBag: 0 });
    const bags = result.metrics.find((m) => m.key === "disposable-bags")!;
    const cost = result.metrics.find((m) => m.key === "bag-fee-cost")!;

    expect(cost.baselineMonthly).toBe(0);
    expect(cost.simulatedMonthly).toBe(0);
    expect(result.headline.monthlyCostChange).toBe(0);
    expect(bags.simulatedMonthly).toBeCloseTo(26, 2);
    expect(result.warnings.some((w) => w.includes("$0.00"))).toBe(true);
  });

  it("handles zero adoption: nothing changes from the baseline", () => {
    const result = run({}, { reusableBagAdoptionRate: 0 });

    expect(result.headline.primaryImpactMonthly).toBe(0);
    expect(result.headline.monthlyCostChange).toBe(0);
    expect(result.warnings.some((w) => w.includes("0% adoption"))).toBe(true);
  });

  it("handles full adoption: every bag is avoided", () => {
    const result = run({}, { reusableBagAdoptionRate: 1 });
    const cost = result.metrics.find((m) => m.key === "bag-fee-cost")!;

    expect(result.headline.primaryImpactMonthly).toBeCloseTo(52, 2);
    expect(cost.simulatedMonthly).toBe(0);
    expect(result.headline.monthlyCostChange).toBeCloseTo(-5.2, 2);
    expect(result.warnings.some((w) => w.includes("100% adoption"))).toBe(true);
  });

  it("treats negative and non-finite inputs as zero rather than producing a negative fee", () => {
    const result = run({
      groceryTripsPerWeek: -5,
      bagsPerTrip: -2,
    });

    expect(result.metrics.every((m) => m.simulatedMonthly >= 0)).toBe(true);
    expect(result.metrics.every((m) => m.baselineMonthly >= 0)).toBe(true);
    expect(result.headline.monthlyCostChange).toBe(0);

    const nan = simulateBagFee({
      policyId: "x",
      policyTitle: "x",
      profile: makeProfile({ groceryTripsPerWeek: Number.NaN }),
      assumptions: makeBagFeeAssumptions(),
      parameters: makeBagFeeParameters(),
    });
    expect(nan.metrics.every((m) => Number.isFinite(m.simulatedMonthly))).toBe(true);
  });

  it("clamps an out-of-range adoption rate instead of extrapolating", () => {
    const above = run({}, { reusableBagAdoptionRate: 1.8 });
    const below = run({}, { reusableBagAdoptionRate: -0.4 });

    expect(above.headline.primaryImpactMonthly).toBeCloseTo(52, 2);
    expect(below.headline.primaryImpactMonthly).toBe(0);
  });

  it("uses the what-if fee for the estimate but reports the policy fee separately", () => {
    const result = run({}, { whatIfFeePerBag: 0.25 });
    const cost = result.metrics.find((m) => m.key === "bag-fee-cost")!;

    expect(result.usesWhatIf).toBe(true);
    expect(cost.baselineMonthly).toBeCloseTo(13, 2); // 52 × 0.25
    expect(
      result.assumptionsUsed.find((a) => a.label === "Fee per bag used")?.note,
    ).toContain("$0.10");
  });

  it("keeps one-time costs out of the monthly figures and in the first-year total", () => {
    const withCost = run({}, { includeReusableBagPurchaseCost: true, reusableBagSetCost: 12 });
    const without = run({}, { includeReusableBagPurchaseCost: false });

    expect(withCost.headline.monthlyCostChange).toBe(without.headline.monthlyCostChange);
    expect(withCost.oneTimeCost).toBe(12);
    // Annual saving of 31.20 minus a 12.00 outlay.
    expect(withCost.netFirstYear).toBeCloseTo(
      withCost.headline.annualCostChange + 12,
      2,
    );
    expect(without.oneTimeCost).toBe(0);
  });

  it("always produces a narrative and a full formula trace", () => {
    const result = run();

    expect(result.narrative.length).toBeGreaterThan(20);
    expect(result.steps.length).toBeGreaterThanOrEqual(8);
    expect(result.steps.every((s) => s.expression && s.substituted && s.result)).toBe(true);
  });
});
