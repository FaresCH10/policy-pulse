import type {
  HouseholdProfile,
  Policy,
  PolicyStatus,
  SimulationAssumptions,
  SimulationAssumptionsByScenario,
  SimulationResult,
  SimulationScenarioId,
} from "../types";
import { DEFAULT_ASSUMPTIONS } from "../constants";
import { formatBags, formatCurrency, formatWeight } from "../format";
import { simulateBagFee } from "./bag-fee";
import { simulateComposting } from "./composting";
import { simulateRecyclingIncentive } from "./recycling-incentive";

export { simulateBagFee } from "./bag-fee";
export { simulateComposting } from "./composting";
export { simulateRecyclingIncentive } from "./recycling-incentive";
export * from "./shared";

/* -------------------------------------------------------------------------- */
/* Scenario metadata                                                           */
/* -------------------------------------------------------------------------- */

export const SCENARIO_META: Record<
  SimulationScenarioId,
  { title: string; short: string; description: string; activity: string }
> = {
  "bag-fee": {
    title: "Single-use bag fee",
    short: "Bag fee",
    description:
      "A per-bag charge on disposable carryout bags. The lever you control is how often you bring your own bags.",
    activity: "grocery shopping",
  },
  composting: {
    title: "Household composting programme",
    short: "Composting",
    description:
      "A collection service for food scraps. The lever you control is how much of your eligible food waste you separate.",
    activity: "kitchen food waste",
  },
  "recycling-incentive": {
    title: "Recycling incentive programme",
    short: "Recycling reward",
    description:
      "A payment per pound of credited recyclable material. The lever you control is how much of what you generate actually gets sorted.",
    activity: "household recyclables",
  },
};

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Runs the simulation for a policy, using the stored assumptions for that
 * policy's scenario. Throws only when the policy's parameters do not match its
 * declared scenario — a data integrity problem that should fail loudly in
 * development rather than silently show wrong numbers.
 */
export function runSimulation(
  policy: Policy,
  profile: HouseholdProfile,
  assumptions: SimulationAssumptionsByScenario,
): SimulationResult {
  const params = policy.policyParameters;
  const base = { policyId: policy.id, policyTitle: policy.title, profile };

  switch (params.scenario) {
    case "bag-fee":
      return simulateBagFee({
        ...base,
        assumptions: assumptions["bag-fee"],
        parameters: params,
      });
    case "composting":
      return simulateComposting({
        ...base,
        assumptions: assumptions.composting,
        parameters: params,
      });
    case "recycling-incentive":
      return simulateRecyclingIncentive({
        ...base,
        assumptions: assumptions["recycling-incentive"],
        parameters: params,
      });
  }
}

/** Type-narrowing helper used by the simulator UI. */
export function assumptionsForScenario<S extends SimulationScenarioId>(
  assumptions: SimulationAssumptionsByScenario,
  scenario: S,
): SimulationAssumptionsByScenario[S] {
  return assumptions[scenario];
}

/**
 * Merges stored assumptions with defaults. Unknown or partial shapes from an
 * older storage version fall back to the illustrative defaults rather than
 * crashing the simulator.
 */
export function normaliseAssumptions(
  stored: Partial<SimulationAssumptionsByScenario> | null | undefined,
): SimulationAssumptionsByScenario {
  return {
    "bag-fee": { ...DEFAULT_ASSUMPTIONS["bag-fee"], ...(stored?.["bag-fee"] ?? {}) },
    composting: { ...DEFAULT_ASSUMPTIONS.composting, ...(stored?.composting ?? {}) },
    "recycling-incentive": {
      ...DEFAULT_ASSUMPTIONS["recycling-incentive"],
      ...(stored?.["recycling-incentive"] ?? {}),
    },
  };
}

/** True when the assumptions differ from the illustrative defaults. */
export function assumptionsDifferFromDefaults(
  assumptions: SimulationAssumptions,
  scenario: SimulationScenarioId,
): boolean {
  const defaults = DEFAULT_ASSUMPTIONS[scenario] as unknown as Record<string, unknown>;
  const current = assumptions as unknown as Record<string, unknown>;
  return Object.keys(defaults).some((key) => {
    if (key === "scenario") return false;
    return defaults[key] !== current[key];
  });
}

/* -------------------------------------------------------------------------- */
/* Household-level aggregation (Overview dashboard)                            */
/* -------------------------------------------------------------------------- */

const STATUS_WEIGHT: Record<PolicyStatus, number> = {
  "in-effect": 3,
  adopted: 2,
  proposed: 1,
};

/**
 * The "leading" policy for a scenario is the most binding one: in effect beats
 * adopted beats proposed.
 */
export function pickLeadingPolicy(
  policies: Policy[],
  scenario: SimulationScenarioId,
): Policy | null {
  const candidates = policies.filter((p) => p.scenario === scenario);
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => {
    const diff = STATUS_WEIGHT[b.status] - STATUS_WEIGHT[a.status];
    if (diff !== 0) return diff;
    return a.title.localeCompare(b.title);
  })[0];
}

export interface ScenarioImpactRow {
  scenario: SimulationScenarioId;
  policyId: string;
  policyTitle: string;
  status: PolicyStatus;
  /** Negative = the household saves money. */
  monthlyCostChange: number;
  annualCostChange: number;
  headlineLabel: string;
  headlineMonthly: number;
  headlineAnnual: number;
  headlineUnit: "bags" | "usd" | "lb" | "trips";
  headlineIsReduction: boolean;
  /** True when this row comes from a policy that is not yet in effect. */
  isPotential: boolean;
  isDemo: boolean;
}

export interface HouseholdImpactSummary {
  rows: ScenarioImpactRow[];
  /** Monthly cost change from in-effect + adopted policies only. */
  bindingMonthlyCostChange: number;
  bindingAnnualCostChange: number;
  /** Monthly cost change that *would* apply if proposed policies pass. */
  potentialMonthlyCostChange: number;
  potentialAnnualCostChange: number;
  bagsAvoidedMonthly: number;
  wasteDivertedMonthlyLb: number;
  rewardEarnedMonthly: number;
  notes: string[];
}

/**
 * Aggregates one simulation per scenario.
 *
 * Important integrity rule: policies are **not** additive. Two bag-fee policies
 * would charge the same shopping trips twice, so the dashboard uses a single
 * leading policy per scenario and says so. Proposed policies are reported
 * separately from binding ones.
 */
export function buildHouseholdImpact(
  policies: Policy[],
  profile: HouseholdProfile,
  assumptions: SimulationAssumptionsByScenario,
): HouseholdImpactSummary {
  const scenarios: SimulationScenarioId[] = [
    "bag-fee",
    "composting",
    "recycling-incentive",
  ];

  const rows: ScenarioImpactRow[] = [];

  for (const scenario of scenarios) {
    const policy = pickLeadingPolicy(policies, scenario);
    if (!policy) continue;
    const result = runSimulation(policy, profile, assumptions);
    rows.push({
      scenario,
      policyId: policy.id,
      policyTitle: policy.title,
      status: policy.status,
      monthlyCostChange: result.headline.monthlyCostChange,
      annualCostChange: result.headline.annualCostChange,
      headlineLabel: result.headline.primaryImpactLabel,
      headlineMonthly: result.headline.primaryImpactMonthly,
      headlineAnnual: result.headline.primaryImpactAnnual,
      headlineUnit: result.headline.primaryImpactUnit,
      headlineIsReduction: result.headline.primaryImpactIsReduction,
      isPotential: policy.status === "proposed",
      isDemo: policy.isDemo,
    });
  }

  const binding = rows.filter((r) => !r.isPotential);
  const potential = rows.filter((r) => r.isPotential);

  const sum = (list: ScenarioImpactRow[], pick: (r: ScenarioImpactRow) => number) =>
    list.reduce((acc, r) => acc + pick(r), 0);

  const bagsAvoidedMonthly = rows
    .filter((r) => r.scenario === "bag-fee" && !r.isPotential)
    .reduce((acc, r) => acc + r.headlineMonthly, 0);

  const wasteDivertedMonthlyLb = rows
    .filter((r) => r.scenario === "composting" && !r.isPotential)
    .reduce((acc, r) => acc + r.headlineMonthly, 0);

  const rewardEarnedMonthly = rows
    .filter((r) => r.scenario === "recycling-incentive" && !r.isPotential)
    .reduce((acc, r) => acc + Math.abs(Math.min(0, r.monthlyCostChange)), 0);

  const notes: string[] = [
    "One policy per scenario is counted. Policies that act on the same activity are not additive — two bag fees would charge the same shopping trips twice.",
    "Proposed policies are reported separately from adopted and in-effect ones, because they are not law yet.",
  ];

  return {
    rows,
    bindingMonthlyCostChange: sum(binding, (r) => r.monthlyCostChange),
    bindingAnnualCostChange: sum(binding, (r) => r.annualCostChange),
    potentialMonthlyCostChange: sum(potential, (r) => r.monthlyCostChange),
    potentialAnnualCostChange: sum(potential, (r) => r.annualCostChange),
    bagsAvoidedMonthly,
    wasteDivertedMonthlyLb,
    rewardEarnedMonthly,
    notes,
  };
}

/* -------------------------------------------------------------------------- */
/* Personalized impact statement (policy cards)                                */
/* -------------------------------------------------------------------------- */

/**
 * A one-sentence, household-specific impact statement for a policy card.
 * Returns an empty string when the household profile is not set up yet, so the
 * card can render its "add your details" prompt instead.
 */
export function buildImpactStatement(
  policy: Policy,
  profile: HouseholdProfile,
  assumptions: SimulationAssumptionsByScenario,
): string {
  let result: SimulationResult;
  try {
    result = runSimulation(policy, profile, assumptions);
  } catch {
    return "";
  }

  const cost = result.headline.monthlyCostChange;
  const costClause =
    Math.abs(cost) < 0.005
      ? "no change to your monthly costs"
      : cost < 0
        ? `about ${formatCurrency(Math.abs(cost))} a month back in your pocket`
        : `about ${formatCurrency(cost)} a month more`;

  switch (result.scenario) {
    case "bag-fee": {
      const bags = result.headline.primaryImpactMonthly;
      if (bags <= 0.005) {
        return `With your current habits this policy would cost you ${costClause} — you are already taking no disposable bags on these trips.`;
      }
      return `Based on your household: roughly ${formatBags(bags, 1)} avoided per month and ${costClause}.`;
    }
    case "composting": {
      const lb = result.headline.primaryImpactMonthly;
      if (lb <= 0.005) {
        return `Based on your household: this programme would divert no food waste at your current participation, with ${costClause}.`;
      }
      return `Based on your household: roughly ${formatWeight(lb, 1)} of food waste diverted per month, with ${costClause}.`;
    }
    case "recycling-incentive": {
      const extra = result.headline.primaryImpactMonthly;
      const reward = Math.abs(Math.min(0, cost));
      if (reward <= 0.005) {
        return `Based on your household: no reward earned at your current capture rate, and ${costClause}.`;
      }
      return `Based on your household: roughly ${formatCurrency(reward)} a month in rewards and ${formatWeight(Math.abs(extra), 1)} more material collected than the programme baseline.`;
    }
  }
}

/** Short label for the household-profile prompt when no profile exists. */
export function hasProfile(profile: HouseholdProfile | null | undefined): boolean {
  return Boolean(profile);
}
