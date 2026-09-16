import { describe, expect, it } from "vitest";
import { simulateComposting } from "./composting";
import type { CompostingAssumptions, CompostingPolicyParameters } from "../types";
import { makeProfile } from "./test-fixtures";

function parameters(
  overrides: Partial<CompostingPolicyParameters> = {},
): CompostingPolicyParameters {
  return {
    scenario: "composting",
    currency: "USD",
    programFeeMonthly: 0,
    eligibleShare: 0.65,
    eligibleShareBasis: "PolicyPulse assumption for the demonstration.",
    acceptedMaterials: [],
    excludedMaterials: [],
    collectionFrequency: "Weekly (illustrative)",
    ...overrides,
  };
}

function assumptions(
  overrides: Partial<CompostingAssumptions> = {},
): CompostingAssumptions {
  return {
    scenario: "composting",
    participationRate: 0.7,
    whatIfEligibleShare: null,
    includeBinCost: false,
    binCost: 25,
    ...overrides,
  };
}

function run(profileOverrides = {}, assumptionOverrides = {}, parameterOverrides = {}) {
  return simulateComposting({
    policyId: "household-composting-program",
    policyTitle: "Household Organics Collection Programme",
    profile: makeProfile(profileOverrides),
    assumptions: assumptions(assumptionOverrides),
    parameters: parameters(parameterOverrides),
  });
}

describe("simulateComposting", () => {
  it("applies the documented formula: weekly × 52 ÷ 12 × participation × eligible share", () => {
    const result = run();

    // 12 × 52 ÷ 12 = 52 lb/month; 52 × 0.65 = 33.8 eligible; 33.8 × 0.7 = 23.66 diverted
    const diverted = result.metrics.find((m) => m.key === "food-waste-diverted")!;
    expect(diverted.simulatedMonthly).toBeCloseTo(23.66, 2);
    expect(result.headline.primaryImpactMonthly).toBeCloseTo(23.66, 2);
  });

  it("reports waste in pounds and never converts it to a count", () => {
    const result = run();
    const units = new Set(result.metrics.map((m) => m.unit));
    expect(units.has("lb")).toBe(true);
    expect(units.has("bags")).toBe(false);
  });

  it("keeps monthly and annual figures consistent", () => {
    const result = run();
    for (const metric of result.metrics) {
      expect(metric.simulatedAnnual).toBeCloseTo(metric.simulatedMonthly * 12, 2);
    }
    expect(result.headline.primaryImpactAnnual).toBeCloseTo(
      result.headline.primaryImpactMonthly * 12,
      2,
    );
  });

  it("handles zero participation: nothing is diverted and everything stays in general waste", () => {
    const result = run({}, { participationRate: 0 });
    const diverted = result.metrics.find((m) => m.key === "food-waste-diverted")!;
    const trash = result.metrics.find((m) => m.key === "trash-bound-food")!;

    expect(diverted.simulatedMonthly).toBe(0);
    expect(trash.simulatedMonthly).toBeCloseTo(52, 2);
    expect(result.warnings.some((w) => w.includes("0% participation"))).toBe(true);
  });

  it("handles full participation as an upper bound", () => {
    const result = run({}, { participationRate: 1 });
    const diverted = result.metrics.find((m) => m.key === "food-waste-diverted")!;

    expect(diverted.simulatedMonthly).toBeCloseTo(33.8, 2);
    expect(result.warnings.some((w) => w.includes("100% participation"))).toBe(true);
  });

  it("handles zero weekly food waste", () => {
    const result = run({ weeklyFoodWasteLb: 0 });
    expect(result.headline.primaryImpactMonthly).toBe(0);
    expect(result.warnings.some((w) => w.includes("0 lb"))).toBe(true);
  });

  it("treats negative food waste as zero", () => {
    const result = run({ weeklyFoodWasteLb: -20 });
    expect(result.headline.primaryImpactMonthly).toBe(0);
    expect(result.metrics.every((m) => m.simulatedMonthly >= 0)).toBe(true);
  });

  it("clamps an out-of-range participation rate", () => {
    expect(run({}, { participationRate: 2 }).headline.primaryImpactMonthly).toBeCloseTo(33.8, 2);
    expect(run({}, { participationRate: -1 }).headline.primaryImpactMonthly).toBe(0);
  });

  it("flags when composting is not available to the household", () => {
    const result = run({ compostingAvailable: "no" });
    expect(result.warnings.some((w) => w.includes("not available"))).toBe(true);
  });

  it("flags uncertainty when availability is unknown", () => {
    const result = run({ compostingAvailable: "unsure" });
    expect(result.warnings.some((w) => w.includes("unsure"))).toBe(true);
  });

  it("charges a programme fee only when the policy sets one", () => {
    const free = run();
    const paid = run({}, {}, { programFeeMonthly: 8 });

    expect(free.headline.monthlyCostChange).toBe(0);
    expect(paid.headline.monthlyCostChange).toBe(8);
    expect(paid.headline.annualCostChange).toBeCloseTo(96, 2);
  });

  it("records a zero baseline diversion explicitly", () => {
    const result = run();
    const diverted = result.metrics.find((m) => m.key === "food-waste-diverted")!;
    expect(diverted.baselineMonthly).toBe(0);
    expect(result.assumptionsUsed.some((a) => a.label === "Baseline diversion")).toBe(true);
  });
});
