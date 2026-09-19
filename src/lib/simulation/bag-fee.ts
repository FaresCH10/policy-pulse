import type {
  AssumptionNote,
  BagFeeAssumptions,
  BagFeePolicyParameters,
  CalculationStep,
  HouseholdProfile,
  SimulationMetric,
  SimulationResult,
} from "../types";
import { formatBags, formatCurrency, formatNumber, formatPercent } from "../format";
import {
  clamp,
  monthlyToAnnual,
  nonNegative,
  roundTo,
  toMonthly,
  trimNumber,
} from "./shared";

export interface BagFeeInput {
  policyId: string;
  policyTitle: string;
  profile: HouseholdProfile;
  assumptions: BagFeeAssumptions;
  parameters: BagFeePolicyParameters;
}

/**
 * Single-use bag fee scenario.
 *
 * Formulas (documented in the README and shown to the user in the simulator):
 *
 *   monthly trips        = weekly trips × 52 ÷ 12
 *   baseline bags        = monthly trips × bags per trip
 *   remaining bags       = baseline bags × (1 − reusable-bag adoption rate)
 *   fee paid             = remaining bags × fee per bag
 *   baseline fee cost    = baseline bags × fee per bag
 *   fees avoided         = baseline fee cost − fee paid
 *   bags avoided         = baseline bags − remaining bags
 *   annual values        = monthly values × 12
 *
 * Nothing else is inferred. No emissions, health, or waste-tonnage conversion
 * is applied anywhere in this module.
 */
export function simulateBagFee(input: BagFeeInput): SimulationResult {
  const { profile, assumptions, parameters } = input;

  const weeklyTrips = nonNegative(profile.groceryTripsPerWeek);
  const bagsPerTrip = nonNegative(profile.bagsPerTrip);
  const adoption = clamp(assumptions.reusableBagAdoptionRate, 0, 1);
  const usesWhatIf = assumptions.whatIfFeePerBag !== null;
  const effectiveFee = nonNegative(
    usesWhatIf ? (assumptions.whatIfFeePerBag as number) : parameters.feePerBag,
  );

  const monthlyTrips = toMonthly(weeklyTrips);
  const baselineBagsMonthly = monthlyTrips * bagsPerTrip;
  const remainingBagsMonthly = baselineBagsMonthly * (1 - adoption);
  const baselineFeeCostMonthly = baselineBagsMonthly * effectiveFee;
  const feeCostMonthly = remainingBagsMonthly * effectiveFee;
  const feesAvoidedMonthly = baselineFeeCostMonthly - feeCostMonthly;
  const bagsAvoidedMonthly = baselineBagsMonthly - remainingBagsMonthly;

  const baselineBagsAnnual = monthlyToAnnual(baselineBagsMonthly);
  const remainingBagsAnnual = monthlyToAnnual(remainingBagsMonthly);
  const baselineFeeCostAnnual = monthlyToAnnual(baselineFeeCostMonthly);
  const feeCostAnnual = monthlyToAnnual(feeCostMonthly);
  const feesAvoidedAnnual = monthlyToAnnual(feesAvoidedMonthly);
  const bagsAvoidedAnnual = monthlyToAnnual(bagsAvoidedMonthly);

  const oneTimeCost = assumptions.includeReusableBagPurchaseCost
    ? nonNegative(assumptions.reusableBagSetCost)
    : 0;

  const monthlyCostChange = feeCostMonthly - baselineFeeCostMonthly; // negative = saving
  const annualCostChange = monthlyToAnnual(monthlyCostChange);

  const metrics: SimulationMetric[] = [
    {
      key: "disposable-bags",
      label: "Disposable bags taken",
      unit: "bags",
      baselineMonthly: roundTo(baselineBagsMonthly, 2),
      simulatedMonthly: roundTo(remainingBagsMonthly, 2),
      baselineAnnual: roundTo(baselineBagsAnnual, 2),
      simulatedAnnual: roundTo(remainingBagsAnnual, 2),
      lowerIsBetter: true,
      description: "Fewer bags is the goal of the policy.",
      chartable: true,
    },
    {
      key: "bag-fee-cost",
      label: "Bag fee paid",
      unit: "usd",
      baselineMonthly: roundTo(baselineFeeCostMonthly, 2),
      simulatedMonthly: roundTo(feeCostMonthly, 2),
      baselineAnnual: roundTo(baselineFeeCostAnnual, 2),
      simulatedAnnual: roundTo(feeCostAnnual, 2),
      lowerIsBetter: true,
      description: "What the fee would cost you at this level of adoption.",
      chartable: true,
    },
  ];

  const steps: CalculationStep[] = [
    {
      id: "trips",
      expression: "Monthly shopping trips = weekly trips × 52 ÷ 12",
      substituted: `${trimNumber(weeklyTrips)} × 52 ÷ 12`,
      result: `${formatNumber(monthlyTrips, 2)} trips`,
      note: "52 weeks divided by 12 months converts a weekly habit into a monthly figure.",
    },
    {
      id: "baseline-bags",
      expression: "Baseline monthly bags = monthly trips × bags per trip",
      substituted: `${trimNumber(monthlyTrips)} × ${trimNumber(bagsPerTrip)}`,
      result: formatBags(baselineBagsMonthly, 2),
    },
    {
      id: "remaining-bags",
      expression: "Remaining bags = baseline bags × (1 − adoption rate)",
      substituted: `${trimNumber(baselineBagsMonthly)} × (1 − ${trimNumber(adoption)})`,
      result: formatBags(remainingBagsMonthly, 2),
      note: "Fractional bags are a normal artefact of applying a rate to a count. Treat the figure as an average, not a whole number of bags.",
    },
    {
      id: "baseline-cost",
      expression: "Baseline fee cost = baseline bags × fee per bag",
      substituted: `${trimNumber(baselineBagsMonthly)} × $${trimNumber(effectiveFee)}`,
      result: formatCurrency(baselineFeeCostMonthly),
    },
    {
      id: "simulated-cost",
      expression: "Fee paid = remaining bags × fee per bag",
      substituted: `${trimNumber(remainingBagsMonthly)} × $${trimNumber(effectiveFee)}`,
      result: formatCurrency(feeCostMonthly),
    },
    {
      id: "fees-avoided",
      expression: "Fees avoided = baseline fee cost − fee paid",
      substituted: `${formatCurrency(baselineFeeCostMonthly)} − ${formatCurrency(feeCostMonthly)}`,
      result: formatCurrency(feesAvoidedMonthly),
    },
    {
      id: "bags-avoided",
      expression: "Bags avoided = baseline bags − remaining bags",
      substituted: `${trimNumber(baselineBagsMonthly)} − ${trimNumber(remainingBagsMonthly)}`,
      result: formatBags(bagsAvoidedMonthly, 2),
    },
    {
      id: "annual",
      expression: "Annual values = monthly values × 12",
      substituted: `${formatCurrency(feesAvoidedMonthly)} × 12`,
      result: `${formatCurrency(feesAvoidedAnnual)} avoided per year`,
    },
  ];

  if (oneTimeCost > 0) {
    steps.push({
      id: "one-time",
      expression: "Net first-year cost change = annual cost change + one-time reusable bag cost",
      substituted: `${formatCurrency(annualCostChange)} + ${formatCurrency(oneTimeCost)}`,
      result: formatCurrency(annualCostChange + oneTimeCost),
      note: "One-time costs are deliberately kept out of the monthly figures.",
    });
  }

  const assumptionsUsed: AssumptionNote[] = [
    {
      label: "Fee per bag used",
      value: `${formatCurrency(effectiveFee)} per bag`,
      source: usesWhatIf ? "what-if" : "policy",
      note: usesWhatIf
        ? `Your what-if value. The policy's own fee is ${formatCurrency(parameters.feePerBag)}. Changing this here does not change the policy.`
        : `Set by the policy: ${parameters.appliesTo}.`,
    },
    {
      label: "Reusable-bag adoption rate",
      value: formatPercent(adoption),
      source: "what-if",
      note: "Share of your shopping trips where you bring your own bags.",
    },
    {
      label: "Grocery trips per week",
      value: `${formatNumber(weeklyTrips, 1)} trips`,
      source: "household",
    },
    {
      label: "Disposable bags per trip",
      value: `${formatNumber(bagsPerTrip, 1)} bags`,
      source: "household",
    },
    {
      label: "Weekly → monthly conversion",
      value: "× 52 ÷ 12",
      source: "illustrative",
      note: "Assumes a 52-week year. No seasonal variation is modelled.",
    },
  ];

  if (oneTimeCost > 0) {
    assumptionsUsed.push({
      label: "One-time reusable bag cost",
      value: formatCurrency(oneTimeCost),
      source: "illustrative",
      note: "An illustrative default you can edit or switch off. It is not a policy requirement.",
    });
  }

  const warnings: string[] = [];
  if (weeklyTrips === 0) {
    warnings.push(
      "You entered 0 grocery trips per week, so there is nothing for this policy to charge and nothing to avoid.",
    );
  }
  if (bagsPerTrip === 0 && weeklyTrips > 0) {
    warnings.push(
      "You entered 0 disposable bags per trip, so the fee has no baseline to reduce.",
    );
  }
  if (effectiveFee === 0) {
    warnings.push(
      "A fee of $0.00 raises no money. Bag reductions would still happen if habits change, but the cost line stays at zero.",
    );
  }
  if (adoption === 0 && baselineBagsMonthly > 0) {
    warnings.push(
      "At 0% adoption nothing changes from the baseline — this is the “no behaviour change” case.",
    );
  }
  if (adoption === 1 && baselineBagsMonthly > 0) {
    warnings.push(
      "At 100% adoption every disposable bag is avoided. This is the maximum this policy can achieve.",
    );
  }
  if (adoption > 0 && adoption < 1 && baselineBagsMonthly > 0) {
    warnings.push(
      "Adoption is applied evenly across all trips. Real households tend to be inconsistent.",
    );
  }

  const narrative = buildNarrative({
    weeklyTrips,
    bagsPerTrip,
    adoption,
    effectiveFee,
    baselineBagsMonthly,
    remainingBagsMonthly,
    baselineFeeCostMonthly,
    feeCostMonthly,
    feesAvoidedMonthly,
    bagsAvoidedMonthly,
  });

  return {
    scenario: "bag-fee",
    policyId: input.policyId,
    policyTitle: input.policyTitle,
    currency: parameters.currency,
    metrics,
    headline: {
      monthlyCostChange: roundTo(monthlyCostChange, 2),
      annualCostChange: roundTo(annualCostChange, 2),
      primaryImpactLabel: "Bags avoided",
      primaryImpactUnit: "bags",
      primaryImpactMonthly: roundTo(bagsAvoidedMonthly, 2),
      primaryImpactAnnual: roundTo(bagsAvoidedAnnual, 2),
      primaryImpactIsReduction: true,
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
  weeklyTrips: number;
  bagsPerTrip: number;
  adoption: number;
  effectiveFee: number;
  baselineBagsMonthly: number;
  remainingBagsMonthly: number;
  baselineFeeCostMonthly: number;
  feeCostMonthly: number;
  feesAvoidedMonthly: number;
  bagsAvoidedMonthly: number;
}): string {
  if (v.weeklyTrips === 0) {
    return "With no grocery trips entered, this policy has nothing to charge and nothing to avoid. Add your weekly trips in the household profile to see an estimate.";
  }
  if (v.baselineBagsMonthly === 0) {
    return "Your household takes no disposable bags on these trips, so the fee never applies to you. That is already the outcome the policy is aiming for.";
  }

  const bagClause =
    v.bagsAvoidedMonthly > 0
      ? `and take about ${formatBags(v.bagsAvoidedMonthly, 1)} fewer per month`
      : "with no change in bag use";

  if (v.feesAvoidedMonthly <= 0.005) {
    return `At a fee of ${formatCurrency(v.effectiveFee)} per bag and ${formatPercent(v.adoption)} adoption, you would pay roughly ${formatCurrency(v.feeCostMonthly)} a month in bag fees — the same as the baseline, ${bagClause}. Move the adoption slider to see what changes.`;
  }

  return `At a fee of ${formatCurrency(v.effectiveFee)} per bag with ${formatPercent(v.adoption)} of trips using reusable bags, you would pay about ${formatCurrency(v.feeCostMonthly)} a month instead of ${formatCurrency(v.baselineFeeCostMonthly)} — roughly ${formatCurrency(v.feesAvoidedMonthly)} less, ${bagClause}.`;
}
