import { describe, expect, it } from "vitest";
import {
  buildHouseholdImpact,
  buildImpactStatement,
  normaliseAssumptions,
  pickLeadingPolicy,
  runSimulation,
} from "./index";
import { roundTo } from "./shared";
import { POLICIES } from "../data/policies";
import { DEFAULT_ASSUMPTIONS } from "../constants";
import { makeProfile } from "./test-fixtures";
import type { Policy } from "../types";

describe("pickLeadingPolicy", () => {
  it("prefers in-effect over adopted over proposed", () => {
    const inEffect = pickLeadingPolicy(POLICIES, "bag-fee");
    expect(inEffect?.id).toBe("single-use-bag-fee");

    const composting = pickLeadingPolicy(POLICIES, "composting");
    expect(composting?.id).toBe("backyard-composter-rebate"); // in effect beats adopted
  });

  it("returns null when no policy uses the scenario", () => {
    const empty: Policy[] = [];
    expect(pickLeadingPolicy(empty, "bag-fee")).toBeNull();
  });
});

describe("buildHouseholdImpact", () => {
  it("produces one row per scenario and never double counts", () => {
    const summary = buildHouseholdImpact(POLICIES, makeProfile(), DEFAULT_ASSUMPTIONS);

    expect(summary.rows).toHaveLength(3);
    const ids = summary.rows.map((r) => r.policyId);
    expect(new Set(ids).size).toBe(ids.length);

    // Two bag-fee policies exist, but only the leading one is counted.
    expect(ids.filter((id) => id.includes("bag"))).toHaveLength(1);
  });

  it("separates proposed policies from binding ones", () => {
    const summary = buildHouseholdImpact(POLICIES, makeProfile(), DEFAULT_ASSUMPTIONS);
    const proposed = summary.rows.filter((r) => r.isPotential);

    // The recycling incentive is the only proposed scenario in the seed data.
    expect(proposed.map((r) => r.scenario)).toEqual(["recycling-incentive"]);

    // The headline figure must not include a policy that is not law yet.
    const bindingSum = summary.rows
      .filter((r) => !r.isPotential)
      .reduce((acc, r) => acc + r.monthlyCostChange, 0);
    expect(summary.bindingMonthlyCostChange).toBeCloseTo(bindingSum, 2);
  });

  it("states the non-additivity rule in its notes", () => {
    const summary = buildHouseholdImpact(POLICIES, makeProfile(), DEFAULT_ASSUMPTIONS);
    expect(summary.notes.join(" ")).toMatch(/not additive/i);
  });

  /*
   * Aggregates are sums of already-rounded rows, but the sum of rounded floats
   * is not itself a rounded float — 0.1 + 0.2 is 0.30000000000000004. These
   * totals are formatted and compared against zero, so a stray tail would show
   * up as a nonsense figure.
   *
   * This genuinely fires: with `roundTo` neutered, this sweep reports
   * `bindingMonthlyCostChange = 0.43333333333333335` at trips=1, bags=1,
   * adoption=0, and the row-sum comparison reports `-4.680000000000001`.
   * Verified by mutation.
   */
  it("keeps every aggregate as a clean 2dp value equal to the rounded sum of its rows", () => {
    const clean = (n: number) => Math.abs(n - Number(n.toFixed(2))) < 1e-9;

    for (const trips of [0, 1, 2, 3, 7, 13, 21]) {
      for (const bags of [0, 1, 3, 6, 10]) {
        for (const adoption of [0, 0.25, 0.6, 1]) {
          const profile = makeProfile({ groceryTripsPerWeek: trips, bagsPerTrip: bags });
          const assumptions = normaliseAssumptions({
            "bag-fee": { reusableBagAdoptionRate: adoption },
          } as never);
          const summary = buildHouseholdImpact(POLICIES, profile, assumptions);

          for (const [name, value] of [
            ["bindingMonthlyCostChange", summary.bindingMonthlyCostChange],
            ["bindingAnnualCostChange", summary.bindingAnnualCostChange],
            ["potentialMonthlyCostChange", summary.potentialMonthlyCostChange],
            ["potentialAnnualCostChange", summary.potentialAnnualCostChange],
            ["bagsAvoidedMonthly", summary.bagsAvoidedMonthly],
            ["wasteDivertedMonthlyLb", summary.wasteDivertedMonthlyLb],
            ["rewardEarnedMonthly", summary.rewardEarnedMonthly],
          ] as const) {
            expect(
              clean(value),
              `${name} = ${value} at trips=${trips} bags=${bags} adoption=${adoption}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it("reports aggregates that match a rounded sum of the same rows", () => {
    const summary = buildHouseholdImpact(POLICIES, makeProfile(), DEFAULT_ASSUMPTIONS);

    const sumOf = (rows: typeof summary.rows, pick: (r: (typeof rows)[number]) => number) =>
      Math.round(rows.reduce((acc, r) => acc + pick(r), 0) * 100) / 100;

    const binding = summary.rows.filter((r) => !r.isPotential);
    const potential = summary.rows.filter((r) => r.isPotential);

    expect(summary.bindingMonthlyCostChange).toBe(sumOf(binding, (r) => r.monthlyCostChange));
    expect(summary.bindingAnnualCostChange).toBe(sumOf(binding, (r) => r.annualCostChange));
    expect(summary.potentialMonthlyCostChange).toBe(sumOf(potential, (r) => r.monthlyCostChange));
    expect(summary.potentialAnnualCostChange).toBe(sumOf(potential, (r) => r.annualCostChange));
  });

  /*
   * The mechanism behind the aggregate rounding, tested where it can actually
   * fail. `roundTo` must collapse a raw floating-point tail; without it the
   * figure reaches the UI and the formatter prints the full tail.
   */
  it("rounds a raw sum that would otherwise carry a float tail", () => {
    // Real example of IEEE-754 summation error on 2dp inputs.
    const raw = 14.2 + 3.5 + -2.72; // 14.979999999999999
    expect(String(raw)).toContain("9999999");
    expect(roundTo(raw, 2)).toBe(14.98);
    expect(String(roundTo(raw, 2))).toBe("14.98");

    const raw2 = 0.73 + 19.01 + -10.66; // 9.080000000000002
    expect(String(raw2)).toContain("0000000002");
    expect(roundTo(raw2, 2)).toBe(9.08);

    // And the classic.
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
    expect(String(roundTo(0.1 + 0.2, 2))).toBe("0.3");
  });
});

describe("runSimulation", () => {
  it("dispatches to the right scenario for every seeded policy", () => {
    for (const policy of POLICIES) {
      const result = runSimulation(policy, makeProfile(), DEFAULT_ASSUMPTIONS);
      expect(result.scenario).toBe(policy.scenario);
      expect(result.policyId).toBe(policy.id);
      expect(result.metrics.length).toBeGreaterThan(0);
      expect(result.steps.length).toBeGreaterThan(0);
    }
  });

  it("produces identical output for identical inputs (pure function)", () => {
    const policy = POLICIES[0];
    const a = runSimulation(policy, makeProfile(), DEFAULT_ASSUMPTIONS);
    const b = runSimulation(policy, makeProfile(), DEFAULT_ASSUMPTIONS);
    expect(a).toEqual(b);
  });
});

describe("buildImpactStatement", () => {
  it("returns a household-specific sentence for every seeded policy", () => {
    for (const policy of POLICIES) {
      const statement = buildImpactStatement(policy, makeProfile(), DEFAULT_ASSUMPTIONS);
      expect(statement.length).toBeGreaterThan(20);
      expect(statement.toLowerCase()).toContain("household");
    }
  });
});

describe("normaliseAssumptions", () => {
  it("falls back to defaults for missing sections", () => {
    const normalised = normaliseAssumptions(null);
    expect(normalised).toEqual(DEFAULT_ASSUMPTIONS);
  });

  it("keeps stored values and fills the gaps", () => {
    const normalised = normaliseAssumptions({
      "bag-fee": { reusableBagAdoptionRate: 0.9 },
    } as never);

    expect(normalised["bag-fee"].reusableBagAdoptionRate).toBe(0.9);
    expect(normalised["bag-fee"].reusableBagSetCost).toBe(
      DEFAULT_ASSUMPTIONS["bag-fee"].reusableBagSetCost,
    );
    expect(normalised.composting).toEqual(DEFAULT_ASSUMPTIONS.composting);
  });
});
