import { describe, expect, it } from "vitest";
import {
  buildHouseholdImpact,
  buildImpactStatement,
  normaliseAssumptions,
  pickLeadingPolicy,
  runSimulation,
} from "./index";
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
