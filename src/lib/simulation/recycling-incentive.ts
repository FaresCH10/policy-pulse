import type {
  AssumptionNote,
  CalculationStep,
  HouseholdProfile,
  RecyclingAssumptions,
  RecyclingIncentivePolicyParameters,
  SimulationMetric,
  SimulationResult,
} from "../types";
import { formatCurrency, formatNumber, formatPercent, formatWeight } from "../format";
import {
  clamp,
  monthlyToAnnual,
  nonNegative,
  roundTo,
  toMonthly,
  trimNumber,
} from "./shared";

export interface RecyclingIncentiveInput {
  policyId: string;
  policyTitle: string;
  profile: HouseholdProfile;
  assumptions: RecyclingAssumptions;
  parameters: RecyclingIncentivePolicyParameters;
}

/**
 * Recycling incentive scenario.
 *
 * Formulas:
 *
 *   weekly recyclables   = household size × illustrative lb per person per week
 *   monthly recyclables  = weekly recyclables × 52 ÷ 12
 *   collected            = monthly recyclables × capture rate
 *   credited weight      = collected × (1 − contamination rate)
 *   reward               = credited weight × reward per lb   (capped if the policy caps it)
 *
 * Baseline = your recyclables captured at the programme's published
 * no-incentive assumption, with **no reward paid** — the reward is the thing
 * the programme adds. Simulated = your chosen capture rate, with the reward.
 *
 * No emissions or tonnage equivalents are produced.
 */
export function simulateRecyclingIncentive(
  input: RecyclingIncentiveInput,
): SimulationResult {
  const { profile, assumptions, parameters } = input;

  const householdSize = Math.max(1, nonNegative(profile.householdSize));
  const perPersonWeekly = nonNegative(assumptions.weeklyRecyclablesPerPersonLb);
  const captureRate = clamp(assumptions.captureRate, 0, 1);
  const contamination = clamp(assumptions.contaminationRate, 0, 1);
  const baselineCapture = clamp(parameters.baselineCaptureRate, 0, 1);

  const usesWhatIf = assumptions.whatIfRewardPerPound !== null;
  const rewardPerPound = nonNegative(
    usesWhatIf
      ? (assumptions.whatIfRewardPerPound as number)
      : parameters.rewardPerPound,
  );

  const weeklyRecyclables = householdSize * perPersonWeekly;
  const monthlyRecyclables = toMonthly(weeklyRecyclables);

  const baselineCollectedMonthly = monthlyRecyclables * baselineCapture;
  const simulatedCollectedMonthly = monthlyRecyclables * captureRate;

  const simulatedCreditedMonthly = simulatedCollectedMonthly * (1 - contamination);

  const uncappedRewardMonthly = simulatedCreditedMonthly * rewardPerPound;
  const cap = parameters.maxRewardPerHouseholdMonthly;
  const simulatedRewardMonthly =
    cap !== null && cap >= 0
      ? Math.min(uncappedRewardMonthly, cap)
      : uncappedRewardMonthly;
  const rewardWasCapped = cap !== null && uncappedRewardMonthly > cap + 1e-9;

  const baselineRewardMonthly = 0; // the reward does not exist before the programme
  const contaminationLossMonthly = simulatedCollectedMonthly - simulatedCreditedMonthly;

  const baselineCollectedAnnual = monthlyToAnnual(baselineCollectedMonthly);
  const simulatedCollectedAnnual = monthlyToAnnual(simulatedCollectedMonthly);
  const baselineRewardAnnual = monthlyToAnnual(baselineRewardMonthly);
  const simulatedRewardAnnual = monthlyToAnnual(simulatedRewardMonthly);

  // Household cost convention: the reward is income, so it reduces net cost.
  const baselineCostMonthly = -baselineRewardMonthly;
  const simulatedCostMonthly = -simulatedRewardMonthly;
  const monthlyCostChange = simulatedCostMonthly - baselineCostMonthly;
  const annualCostChange = monthlyToAnnual(monthlyCostChange);

  const oneTimeCost = 0;

  const metrics: SimulationMetric[] = [
    {
      key: "recyclables-collected",
      label: "Recyclables collected",
      unit: "lb",
      baselineMonthly: roundTo(baselineCollectedMonthly, 2),
      simulatedMonthly: roundTo(simulatedCollectedMonthly, 2),
      baselineAnnual: roundTo(baselineCollectedAnnual, 2),
      simulatedAnnual: roundTo(simulatedCollectedAnnual, 2),
      lowerIsBetter: false,
      description: "Material that reaches the recycling stream rather than general waste.",
      chartable: true,
    },
    {
      key: "reward-earned",
      label: "Incentive reward earned",
      unit: "usd",
      baselineMonthly: roundTo(baselineRewardMonthly, 2),
      simulatedMonthly: roundTo(simulatedRewardMonthly, 2),
      baselineAnnual: roundTo(baselineRewardAnnual, 2),
      simulatedAnnual: roundTo(simulatedRewardAnnual, 2),
      lowerIsBetter: false,
      description: "Paid out on credited weight, after contamination is removed.",
      chartable: true,
    },
    {
      key: "net-household-cost",
      label: "Net household cost",
      unit: "usd",
      baselineMonthly: roundTo(baselineCostMonthly, 2),
      simulatedMonthly: roundTo(simulatedCostMonthly, 2),
      baselineAnnual: roundTo(monthlyToAnnual(baselineCostMonthly), 2),
      simulatedAnnual: roundTo(monthlyToAnnual(simulatedCostMonthly), 2),
      lowerIsBetter: true,
      description: "Rewards are income, so they reduce this figure.",
      chartable: true,
    },
  ];

  const steps: CalculationStep[] = [
    {
      id: "weekly-recyclables",
      expression: "Weekly recyclables = household size × lb per person per week",
      substituted: `${trimNumber(householdSize)} people × ${trimNumber(perPersonWeekly)} lb`,
      result: formatWeight(weeklyRecyclables, 1),
      note: "The per-person figure is an illustrative default, not a measurement. Edit it to match your household.",
    },
    {
      id: "monthly-recyclables",
      expression: "Monthly recyclables = weekly recyclables × 52 ÷ 12",
      substituted: `${trimNumber(weeklyRecyclables)} lb × 52 ÷ 12`,
      result: formatWeight(monthlyRecyclables, 2),
    },
    {
      id: "baseline-collected",
      expression: "Baseline collected = monthly recyclables × programme baseline capture rate",
      substituted: `${trimNumber(monthlyRecyclables)} lb × ${trimNumber(baselineCapture)}`,
      result: formatWeight(baselineCollectedMonthly, 2),
      note: "The baseline assumes no reward is paid and no behaviour change occurs.",
    },
    {
      id: "simulated-collected",
      expression: "Collected = monthly recyclables × your capture rate",
      substituted: `${trimNumber(monthlyRecyclables)} lb × ${trimNumber(captureRate)}`,
      result: formatWeight(simulatedCollectedMonthly, 2),
    },
    {
      id: "credited",
      expression: "Credited weight = collected × (1 − contamination rate)",
      substituted: `${trimNumber(simulatedCollectedMonthly)} lb × (1 − ${trimNumber(contamination)})`,
      result: formatWeight(simulatedCreditedMonthly, 2),
      note: `Contaminated material is not credited: ${formatWeight(contaminationLossMonthly, 2)} per month in this estimate.`,
    },
    {
      id: "reward",
      expression: "Reward = credited weight × reward per lb",
      substituted: `${trimNumber(simulatedCreditedMonthly)} lb × $${trimNumber(rewardPerPound)}`,
      result: `${formatCurrency(simulatedRewardMonthly)} per month`,
      note: rewardWasCapped
        ? `Capped by the programme at ${formatCurrency(cap as number)} per household per month.`
        : undefined,
    },
    {
      id: "annual",
      expression: "Annual reward = monthly reward × 12",
      substituted: `${formatCurrency(simulatedRewardMonthly)} × 12`,
      result: `${formatCurrency(simulatedRewardAnnual)} per year`,
    },
  ];

  const assumptionsUsed: AssumptionNote[] = [
    {
      label: "Reward per pound used",
      value: `${formatCurrency(rewardPerPound)} / lb`,
      source: usesWhatIf ? "what-if" : "policy",
      note: usesWhatIf
        ? `Your what-if value. The policy's own reward is ${formatCurrency(parameters.rewardPerPound)} per lb. Changing this here does not change the policy.`
        : undefined,
    },
    {
      label: "Your capture rate",
      value: formatPercent(captureRate),
      source: "what-if",
      note: "Share of the recyclables you generate that actually reach the recycling stream.",
    },
    {
      label: "Programme baseline capture rate",
      value: formatPercent(baselineCapture),
      source: "policy",
      note: "The programme's own no-incentive assumption, used as the comparison baseline.",
    },
    {
      label: "Contamination rate",
      value: formatPercent(contamination),
      source: "illustrative",
      note: parameters.contaminationRule,
    },
    {
      label: "Recyclables per person per week",
      value: `${formatNumber(perPersonWeekly, 1)} lb`,
      source: "illustrative",
      note: "An illustrative default with no measured basis. Adjust it to reflect your household.",
    },
    {
      label: "Reward cap",
      value:
        parameters.maxRewardPerHouseholdMonthly === null
          ? "No cap"
          : `${formatCurrency(parameters.maxRewardPerHouseholdMonthly)} per month`,
      source: "policy",
    },
    {
      label: "Baseline reward",
      value: formatCurrency(0),
      source: "illustrative",
      note: "The baseline assumes the programme does not exist yet, so no reward is paid.",
    },
  ];

  const warnings: string[] = [];
  if (perPersonWeekly === 0) {
    warnings.push(
      "Recyclables per person per week is 0 lb, so there is nothing to collect or reward.",
    );
  }
  if (captureRate === 0) {
    warnings.push(
      "At a 0% capture rate nothing reaches the recycling stream, so no reward is earned.",
    );
  }
  if (captureRate === 1 && perPersonWeekly > 0) {
    warnings.push(
      "A 100% capture rate assumes every recyclable is correctly sorted. That is an upper bound, not a realistic average.",
    );
  }
  if (contamination === 1) {
    warnings.push(
      "A 100% contamination rate means no collected material is credited, so the reward is zero.",
    );
  } else if (contamination > 0.3) {
    warnings.push(
      `A ${formatPercent(contamination)} contamination rate removes ${formatWeight(contaminationLossMonthly, 1)} per month from your credited weight.`,
    );
  }
  if (rewardPerPound === 0) {
    warnings.push(
      "A reward of $0.00 per lb pays nothing. Collected material would still be recorded.",
    );
  }
  if (rewardWasCapped) {
    warnings.push(
      `The programme caps rewards at ${formatCurrency(cap as number)} per household per month, so this estimate is capped.`,
    );
  }
  if (captureRate < baselineCapture) {
    warnings.push(
      "Your capture rate is below the programme's baseline assumption, so the simulated outcome is worse than the baseline.",
    );
  }

  const narrative = buildNarrative({
    householdSize,
    perPersonWeekly,
    monthlyRecyclables,
    baselineCollectedMonthly,
    simulatedCollectedMonthly,
    simulatedCreditedMonthly,
    simulatedRewardMonthly,
    rewardPerPound,
    contamination,
  });

  return {
    scenario: "recycling-incentive",
    policyId: input.policyId,
    policyTitle: input.policyTitle,
    currency: parameters.currency,
    metrics,
    headline: {
      monthlyCostChange: roundTo(monthlyCostChange, 2),
      annualCostChange: roundTo(annualCostChange, 2),
      primaryImpactLabel: "Additional material collected",
      primaryImpactUnit: "lb",
      primaryImpactMonthly: roundTo(
        simulatedCollectedMonthly - baselineCollectedMonthly,
        2,
      ),
      primaryImpactAnnual: roundTo(
        simulatedCollectedAnnual - baselineCollectedAnnual,
        2,
      ),
      primaryImpactIsReduction: false,
    },
    oneTimeCost: roundTo(oneTimeCost, 2),
    netFirstYear: roundTo(annualCostChange + oneTimeCost, 2),
    steps,
    narrative,
    warnings,
    assumptionsUsed,
    usesWhatIf,
  };
}

function buildNarrative(v: {
  householdSize: number;
  perPersonWeekly: number;
  monthlyRecyclables: number;
  baselineCollectedMonthly: number;
  simulatedCollectedMonthly: number;
  simulatedCreditedMonthly: number;
  simulatedRewardMonthly: number;
  rewardPerPound: number;
  contamination: number;
}): string {
  if (v.perPersonWeekly === 0 || v.monthlyRecyclables === 0) {
    return "With no recyclables estimated, there is nothing to collect and no reward to earn. Set your household's recyclables per person per week in the simulator.";
  }

  const extra = v.simulatedCollectedMonthly - v.baselineCollectedMonthly;
  const extraClause =
    extra > 0.01
      ? ` That is ${formatWeight(extra, 1)} more than the programme's no-incentive baseline.`
      : extra < -0.01
        ? ` That is ${formatWeight(Math.abs(extra), 1)} less than the programme's no-incentive baseline.`
        : " That is the same as the programme's no-incentive baseline.";

  if (v.simulatedRewardMonthly <= 0.005) {
    return `Your household would have about ${formatWeight(v.simulatedCollectedMonthly, 1)} of recyclables collected each month, earning no reward at the current settings.${extraClause}`;
  }

  return `Your household would have about ${formatWeight(v.simulatedCollectedMonthly, 1)} of recyclables collected each month. After ${formatPercent(v.contamination)} contamination is removed, ${formatWeight(v.simulatedCreditedMonthly, 1)} is credited at ${formatCurrency(v.rewardPerPound)} per lb, earning roughly ${formatCurrency(v.simulatedRewardMonthly)} a month.${extraClause}`;
}
