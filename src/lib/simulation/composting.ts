import type {
  AssumptionNote,
  CalculationStep,
  CompostingAssumptions,
  CompostingPolicyParameters,
  HouseholdProfile,
  SimulationMetric,
  SimulationResult,
} from "../types";
import { formatCurrency, formatPercent, formatWeight } from "../format";
import {
  clamp,
  monthlyToAnnual,
  nonNegative,
  roundTo,
  toMonthly,
  trimNumber,
} from "./shared";

export interface CompostingInput {
  policyId: string;
  policyTitle: string;
  profile: HouseholdProfile;
  assumptions: CompostingAssumptions;
  parameters: CompostingPolicyParameters;
}

/**
 * Household composting programme scenario.
 *
 * Formula:
 *
 *   monthly food waste = weekly food waste × 52 ÷ 12
 *   eligible waste     = monthly food waste × eligible share
 *   waste diverted     = eligible waste × participation rate
 *
 * Equivalent to the published form:
 *   weekly food waste × 52 ÷ 12 × participation rate × eligible share
 *
 * Waste quantities stay in pounds. They are never converted into bin counts,
 * bag counts, or tonnage, because no documented conversion factor is supplied
 * with the demonstration data.
 */
export function simulateComposting(input: CompostingInput): SimulationResult {
  const { profile, assumptions, parameters } = input;

  const weeklyFoodWaste = nonNegative(profile.weeklyFoodWasteLb);
  const participation = clamp(assumptions.participationRate, 0, 1);
  const usesWhatIf = assumptions.whatIfEligibleShare !== null;
  const eligibleShare = clamp(
    usesWhatIf ? (assumptions.whatIfEligibleShare as number) : parameters.eligibleShare,
    0,
    1,
  );

  const monthlyFoodWaste = toMonthly(weeklyFoodWaste);
  const eligibleMonthly = monthlyFoodWaste * eligibleShare;
  const divertedMonthly = eligibleMonthly * participation;
  const trashBoundMonthly = monthlyFoodWaste - divertedMonthly;

  const monthlyFoodWasteAnnual = monthlyToAnnual(monthlyFoodWaste);
  const divertedAnnual = monthlyToAnnual(divertedMonthly);
  const trashBoundAnnual = monthlyToAnnual(trashBoundMonthly);

  // Baseline: the programme does not exist yet, so nothing is diverted.
  const programFeeMonthly = nonNegative(parameters.programFeeMonthly);
  const baselineCostMonthly = 0;
  const simulatedCostMonthly = programFeeMonthly;
  const monthlyCostChange = simulatedCostMonthly - baselineCostMonthly;
  const annualCostChange = monthlyToAnnual(monthlyCostChange);

  const oneTimeCost = assumptions.includeBinCost ? nonNegative(assumptions.binCost) : 0;

  const metrics: SimulationMetric[] = [
    {
      key: "food-waste-diverted",
      label: "Food waste diverted",
      unit: "lb",
      baselineMonthly: roundTo(0, 2),
      simulatedMonthly: roundTo(divertedMonthly, 2),
      baselineAnnual: roundTo(0, 2),
      simulatedAnnual: roundTo(divertedAnnual, 2),
      lowerIsBetter: false,
      description: "Pounds kept out of the general waste stream by the programme.",
      chartable: true,
    },
    {
      key: "trash-bound-food",
      label: "Food waste still going to general waste",
      unit: "lb",
      baselineMonthly: roundTo(monthlyFoodWaste, 2),
      simulatedMonthly: roundTo(trashBoundMonthly, 2),
      baselineAnnual: roundTo(monthlyFoodWasteAnnual, 2),
      simulatedAnnual: roundTo(trashBoundAnnual, 2),
      lowerIsBetter: true,
      description: "The share that stays in your rubbish bin.",
      chartable: true,
    },
    {
      key: "program-cost",
      label: "Programme charge",
      unit: "usd",
      baselineMonthly: roundTo(baselineCostMonthly, 2),
      simulatedMonthly: roundTo(simulatedCostMonthly, 2),
      baselineAnnual: roundTo(baselineCostMonthly * 12, 2),
      simulatedAnnual: roundTo(simulatedCostMonthly * 12, 2),
      lowerIsBetter: true,
      description:
        programFeeMonthly === 0
          ? "The demonstration programme charges no household fee."
          : "The recurring charge the programme sets.",
      chartable: true,
    },
  ];

  const steps: CalculationStep[] = [
    {
      id: "monthly-waste",
      expression: "Monthly food waste = weekly food waste × 52 ÷ 12",
      substituted: `${trimNumber(weeklyFoodWaste)} lb × 52 ÷ 12`,
      result: formatWeight(monthlyFoodWaste, 2),
      note: "Assumes a steady 52-week year with no seasonal variation.",
    },
    {
      id: "eligible",
      expression: "Eligible waste = monthly food waste × eligible share",
      substituted: `${trimNumber(monthlyFoodWaste)} lb × ${trimNumber(eligibleShare)}`,
      result: formatWeight(eligibleMonthly, 2),
      note: parameters.eligibleShareBasis,
    },
    {
      id: "diverted",
      expression: "Waste diverted = eligible waste × participation rate",
      substituted: `${trimNumber(eligibleMonthly)} lb × ${trimNumber(participation)}`,
      result: formatWeight(divertedMonthly, 2),
      note: "Equivalent to weekly food waste × 52 ÷ 12 × participation × eligible share.",
    },
    {
      id: "trash-bound",
      expression: "Still to general waste = monthly food waste − waste diverted",
      substituted: `${trimNumber(monthlyFoodWaste)} lb − ${trimNumber(divertedMonthly)} lb`,
      result: formatWeight(trashBoundMonthly, 2),
    },
    {
      id: "annual",
      expression: "Annual values = monthly values × 12",
      substituted: `${trimNumber(divertedMonthly)} lb × 12`,
      result: `${formatWeight(divertedAnnual, 1)} diverted per year`,
    },
  ];

  if (oneTimeCost > 0) {
    steps.push({
      id: "one-time",
      expression: "Net first year = programme charges − one-time bin cost",
      substituted: `${formatCurrency(annualCostChange)} − ${formatCurrency(oneTimeCost)}`,
      result: formatCurrency(annualCostChange - oneTimeCost),
      note: "One-time costs are kept out of the monthly figures.",
    });
  }

  const assumptionsUsed: AssumptionNote[] = [
    {
      label: "Eligible share of food waste",
      value: formatPercent(eligibleShare),
      source: usesWhatIf ? "what-if" : "policy",
      note: usesWhatIf
        ? `Your what-if value. The policy's own eligible share is ${formatPercent(parameters.eligibleShare)}.`
        : parameters.eligibleShareBasis,
    },
    {
      label: "Participation rate",
      value: formatPercent(participation),
      source: "what-if",
      note: "Share of your eligible food waste you actually separate and set out.",
    },
    {
      label: "Weekly food waste",
      value: formatWeight(weeklyFoodWaste, 1),
      source: "household",
      note: "A self-reported estimate, not a measurement.",
    },
    {
      label: "Programme charge",
      value: formatCurrency(programFeeMonthly),
      source: "policy",
    },
    {
      label: "Collection frequency",
      value: parameters.collectionFrequency,
      source: "policy",
    },
    {
      label: "Baseline diversion",
      value: "0 lb",
      source: "illustrative",
      note: "The baseline assumes the programme does not exist yet and nothing is diverted.",
    },
  ];

  if (oneTimeCost > 0) {
    assumptionsUsed.push({
      label: "One-time bin / caddy cost",
      value: formatCurrency(oneTimeCost),
      source: "illustrative",
      note: "An illustrative default you can edit or switch off. Not a policy requirement.",
    });
  }

  const warnings: string[] = [];
  if (weeklyFoodWaste === 0) {
    warnings.push(
      "You entered 0 lb of weekly food waste, so there is nothing for the programme to divert.",
    );
  }
  if (participation === 0) {
    warnings.push(
      "At 0% participation nothing is diverted — this is the “no behaviour change” case.",
    );
  }
  if (participation === 1 && weeklyFoodWaste > 0) {
    warnings.push(
      "At 100% participation every eligible pound is diverted. This is the maximum the formula can produce.",
    );
  }
  if (eligibleShare === 0) {
    warnings.push(
      "An eligible share of 0% means none of your food waste qualifies for the programme.",
    );
  }
  if (profile.compostingAvailable === "no") {
    warnings.push(
      "You told us composting is not available where you live, so this scenario may not be an option for you yet. The estimate still shows what the programme would do if it reached you.",
    );
  }
  if (profile.compostingAvailable === "unsure") {
    warnings.push(
      "You were unsure whether composting is available to you. Check your local service before relying on this estimate.",
    );
  }
  if (participation > 0 && participation < 1 && weeklyFoodWaste > 0) {
    warnings.push(
      "Real participation varies week to week. A single rate is a simplification.",
    );
  }

  const narrative = buildNarrative({
    weeklyFoodWaste,
    participation,
    eligibleShare,
    divertedMonthly,
    trashBoundMonthly,
    monthlyFoodWaste,
  });

  return {
    scenario: "composting",
    policyId: input.policyId,
    policyTitle: input.policyTitle,
    currency: parameters.currency,
    metrics,
    headline: {
      monthlyCostChange: roundTo(monthlyCostChange, 2),
      annualCostChange: roundTo(annualCostChange, 2),
      primaryImpactLabel: "Food waste diverted",
      primaryImpactUnit: "lb",
      primaryImpactMonthly: roundTo(divertedMonthly, 2),
      primaryImpactAnnual: roundTo(divertedAnnual, 2),
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
  weeklyFoodWaste: number;
  participation: number;
  eligibleShare: number;
  divertedMonthly: number;
  trashBoundMonthly: number;
  monthlyFoodWaste: number;
}): string {
  if (v.weeklyFoodWaste === 0) {
    return "With no weekly food waste entered, there is nothing to divert. Add an estimate in your household profile to see the programme's potential effect.";
  }
  if (v.divertedMonthly <= 0.005) {
    return `At ${formatPercent(v.participation)} participation, nothing is diverted, so all ${formatWeight(v.monthlyFoodWaste, 1)} of your monthly food waste stays in general waste. Raise the participation slider to see the change.`;
  }
  return `With ${formatPercent(v.participation)} participation and ${formatPercent(v.eligibleShare)} of your food waste eligible, you would divert about ${formatWeight(v.divertedMonthly, 1)} per month (${formatWeight(v.divertedMonthly * 12, 0)} a year), leaving roughly ${formatWeight(v.trashBoundMonthly, 1)} a month in general waste.`;
}
