import { describe, expect, it } from "vitest";
import { simulateRecyclingIncentive } from "./recycling-incentive";
import type {
  RecyclingAssumptions,
  RecyclingIncentivePolicyParameters,
} from "../types";
import { makeProfile } from "./test-fixtures";

function parameters(
  overrides: Partial<RecyclingIncentivePolicyParameters> = {},
): RecyclingIncentivePolicyParameters {
  return {
    scenario: "recycling-incentive",
    currency: "USD",
    rewardPerPound: 0.05,
    baselineCaptureRate: 0.55,
    maxRewardPerHouseholdMonthly: 12,
    creditedMaterials: [],
    contaminationRule: "Contaminated loads are not credited (illustrative).",
    ...overrides,
  };
}

function assumptions(overrides: Partial<RecyclingAssumptions> = {}): RecyclingAssumptions {
  return {
    scenario: "recycling-incentive",
    captureRate: 0.8,
    whatIfRewardPerPound: null,
    contaminationRate: 0.1,
    weeklyRecyclablesPerPersonLb: 10,
    ...overrides,
  };
}

function run(profileOverrides = {}, assumptionOverrides = {}, parameterOverrides = {}) {
  return simulateRecyclingIncentive({
    policyId: "recycling-incentive-program",
    policyTitle: "Recycling Incentive Programme",
    profile: makeProfile(profileOverrides),
    assumptions: assumptions(assumptionOverrides),
    parameters: parameters(parameterOverrides),
  });
}

describe("simulateRecyclingIncentive", () => {
  it("applies the documented formulas", () => {
    const result = run();

    // 3 people × 10 lb = 30 lb/week → 30 × 52 ÷ 12 = 130 lb/month
    // baseline collected = 130 × 0.55 = 71.5 ; simulated = 130 × 0.8 = 104
    // credited = 104 × 0.9 = 93.6 ; reward = 93.6 × 0.05 = 4.68
    const collected = result.metrics.find((m) => m.key === "recyclables-collected")!;
    const reward = result.metrics.find((m) => m.key === "reward-earned")!;

    expect(collected.baselineMonthly).toBeCloseTo(71.5, 2);
    expect(collected.simulatedMonthly).toBeCloseTo(104, 2);
    expect(reward.simulatedMonthly).toBeCloseTo(4.68, 2);
    expect(result.headline.monthlyCostChange).toBeCloseTo(-4.68, 2);
  });

  it("keeps monthly and annual figures consistent", () => {
    const result = run();
    for (const metric of result.metrics) {
      expect(metric.simulatedAnnual).toBeCloseTo(metric.simulatedMonthly * 12, 2);
    }
  });

  it("pays nothing at a zero capture rate", () => {
    const result = run({}, { captureRate: 0 });
    const reward = result.metrics.find((m) => m.key === "reward-earned")!;

    expect(reward.simulatedMonthly).toBe(0);
    expect(result.headline.monthlyCostChange).toBe(0);
    expect(result.warnings.some((w) => w.includes("0% capture"))).toBe(true);
  });

  it("removes contaminated material from credited weight", () => {
    const clean = run({}, { contaminationRate: 0 });
    const dirty = run({}, { contaminationRate: 0.5 });

    const cleanReward = clean.metrics.find((m) => m.key === "reward-earned")!;
    const dirtyReward = dirty.metrics.find((m) => m.key === "reward-earned")!;

    expect(cleanReward.simulatedMonthly).toBeCloseTo(104 * 0.05, 2);
    expect(dirtyReward.simulatedMonthly).toBeCloseTo(104 * 0.5 * 0.05, 2);
  });

  it("pays nothing when the whole load is contaminated", () => {
    const result = run({}, { contaminationRate: 1 });
    const reward = result.metrics.find((m) => m.key === "reward-earned")!;

    expect(reward.simulatedMonthly).toBe(0);
    expect(result.warnings.some((w) => w.includes("100% contamination"))).toBe(true);
  });

  it("applies the monthly cap and says so", () => {
    const result = run({}, { weeklyRecyclablesPerPersonLb: 40, captureRate: 1 });
    const reward = result.metrics.find((m) => m.key === "reward-earned")!;

    expect(reward.simulatedMonthly).toBe(12); // capped
    expect(result.warnings.some((w) => w.includes("caps rewards"))).toBe(true);
  });

  it("does not cap when the policy sets no cap", () => {
    const result = run(
      {},
      { weeklyRecyclablesPerPersonLb: 40, captureRate: 1 },
      { maxRewardPerHouseholdMonthly: null },
    );
    const reward = result.metrics.find((m) => m.key === "reward-earned")!;

    // 3 × 40 = 120 lb/week → 520 lb/month × 1 × 0.9 × 0.05 = 23.40
    expect(reward.simulatedMonthly).toBeCloseTo(23.4, 2);
    expect(result.warnings.some((w) => w.includes("caps rewards"))).toBe(false);
  });

  it("treats negative inputs as zero", () => {
    const result = run(
      { householdSize: -3 },
      { weeklyRecyclablesPerPersonLb: -10, contaminationRate: -1 },
    );

    expect(result.metrics.every((m) => Number.isFinite(m.simulatedMonthly))).toBe(true);
    expect(result.metrics.every((m) => m.simulatedMonthly >= 0)).toBe(true);
    expect(result.headline.monthlyCostChange).toBe(0);
  });

  it("flags when the capture rate is worse than the programme baseline", () => {
    const result = run({}, { captureRate: 0.2 });
    expect(
      result.warnings.some((w) => w.includes("below the programme's baseline")),
    ).toBe(true);
  });

  it("reports the what-if reward rate without changing the policy rate", () => {
    const result = run({}, { whatIfRewardPerPound: 0.1 });

    expect(result.usesWhatIf).toBe(true);
    expect(
      result.assumptionsUsed.find((a) => a.label === "Reward per pound used")?.note,
    ).toContain("$0.05");
  });

  it("labels the per-person generation rate as illustrative", () => {
    const result = run();
    const note = result.assumptionsUsed.find(
      (a) => a.label === "Recyclables per person per week",
    );
    expect(note?.source).toBe("illustrative");
  });
});
