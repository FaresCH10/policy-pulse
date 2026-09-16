import type { PolicyCategory, PolicyStatus, SimulationScenarioId } from "./types";

/**
 * Presentation labels for enum values.
 *
 * Kept in a dependency-free module so client components can import them without
 * pulling the seed data or the provider into the browser bundle.
 */

export const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  bags: "Bags & checkout",
  organics: "Food & organics",
  recycling: "Recycling",
};

export const CATEGORY_SHORT: Record<PolicyCategory, string> = {
  bags: "Bags",
  organics: "Organics",
  recycling: "Recycling",
};

export const STATUS_LABELS: Record<PolicyStatus, string> = {
  "in-effect": "In effect",
  adopted: "Adopted",
  proposed: "Proposed",
};

export const SCENARIO_LABELS: Record<SimulationScenarioId, string> = {
  "bag-fee": "Bag fee",
  composting: "Composting",
  "recycling-incentive": "Recycling reward",
};

export const TENURE_LABELS = {
  renter: "Renting",
  homeowner: "Homeowner",
} as const;

export const COMPOSTING_AVAILABILITY_LABELS = {
  yes: "Yes, available",
  no: "No, not available",
  unsure: "Not sure",
} as const;

/** Grouped export, for callers that want one import for all label maps. */
export const POLICY_LABELS = {
  status: STATUS_LABELS,
  category: CATEGORY_LABELS,
  categoryShort: CATEGORY_SHORT,
  scenario: SCENARIO_LABELS,
} as const;
