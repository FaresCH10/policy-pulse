import type {
  BagFeeAssumptions,
  BagFeePolicyParameters,
  HouseholdProfile,
} from "../types";

export function makeProfile(overrides: Partial<HouseholdProfile> = {}): HouseholdProfile {
  return {
    householdSize: 3,
    tenure: "renter",
    groceryTripsPerWeek: 4,
    bagsPerTrip: 3,
    weeklyFoodWasteLb: 12,
    compostingAvailable: "unsure",
    ...overrides,
  };
}

export function makeBagFeeParameters(
  overrides: Partial<BagFeePolicyParameters> = {},
): BagFeePolicyParameters {
  return {
    scenario: "bag-fee",
    currency: "USD",
    feePerBag: 0.1,
    appliesTo: "single-use carryout bags",
    exemptions: [],
    revenueUse: "Retained by the retailer (illustrative)",
    ...overrides,
  };
}

export function makeBagFeeAssumptions(
  overrides: Partial<BagFeeAssumptions> = {},
): BagFeeAssumptions {
  return {
    scenario: "bag-fee",
    reusableBagAdoptionRate: 0.5,
    whatIfFeePerBag: null,
    includeReusableBagPurchaseCost: false,
    reusableBagSetCost: 12,
    ...overrides,
  };
}
