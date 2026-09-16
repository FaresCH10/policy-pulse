import type { Jurisdiction } from "../types";
import { DEMO_CITY, DISCLAIMERS } from "../constants";

/**
 * Jurisdictions.
 *
 * All three are fictional. They exist to demonstrate that the data model
 * supports city, county and state levels — the same shape a real policy feed
 * would use. `hasVerifiedCoverage: false` tells the UI it must not imply live
 * coverage.
 */
export const JURISDICTIONS: Jurisdiction[] = [
  {
    id: "cedar-hollow",
    name: DEMO_CITY.fullName,
    level: "city",
    region: DEMO_CITY.region,
    country: "United States (fictional place)",
    postalCodes: [DEMO_CITY.postalCode],
    coverageNote:
      "The demonstration city. Policy content here is illustrative and written for this hackathon.",
    hasVerifiedCoverage: false,
    isDemo: true,
  },
  {
    id: "meadow-county",
    name: "Meadow County",
    level: "county",
    region: DEMO_CITY.region,
    country: "United States (fictional place)",
    postalCodes: [DEMO_CITY.postalCode, "00001"],
    coverageNote:
      "The fictional county that contains Cedar Hollow. Used to show county-level programmes such as rebates.",
    hasVerifiedCoverage: false,
    isDemo: true,
  },
  {
    id: "demo-state",
    name: "State of Demo",
    level: "state",
    region: DEMO_CITY.region,
    country: "United States (fictional place)",
    postalCodes: ["00000–00009"],
    coverageNote:
      "The fictional state. No state-level policies are seeded in this build; the jurisdiction is present so the model can hold them.",
    hasVerifiedCoverage: false,
    isDemo: true,
  },
];

export const DEMO_CITY_JURISDICTION_ID = "cedar-hollow";

/**
 * Resolves a free-text location query against the demonstration registry.
 *
 * Returns `null` when nothing matches. It deliberately never falls back to the
 * demo city — the caller must ask the user explicitly, so demo policies can
 * never be silently substituted for a real place.
 */
export function resolveDemoLocation(query: string): Jurisdiction | null {
  const normalised = query.trim().toLowerCase();
  if (!normalised) return null;

  const stripped = normalised.replace(/[.,]/g, "").replace(/\s+/g, " ");
  const acceptsDemo =
    stripped === "cedar hollow" ||
    stripped === "cedar hollow demo state" ||
    stripped === "city of cedar hollow" ||
    stripped === "cedar-hollow" ||
    stripped === DEMO_CITY.postalCode ||
    stripped === "demo";

  return acceptsDemo ? (JURISDICTIONS[0] ?? null) : null;
}

/** Copy shown when a location is outside the demonstration coverage area. */
export function unsupportedLocationNote(query: string): string {
  return `PolicyPulse has no verified policy coverage for “${query}”. This build ships with one fictional demonstration city only, and we will not show its policies as if they were yours. ${DISCLAIMERS.policies}`;
}
