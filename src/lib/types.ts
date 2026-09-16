/**
 * PolicyPulse — core domain types.
 *
 * Design rule: this file contains NO presentation logic, NO React, and NO I/O.
 * Every layer (data access, simulation engine, persistence, UI) depends on these
 * shapes, which is what allows the demo seed data to be swapped for a real
 * official policy feed later without touching the UI.
 */

/* -------------------------------------------------------------------------- */
/* Provenance                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Every record that a user could mistake for a real-world fact carries
 * provenance. `isDemo: true` means "fictional demonstration content".
 */
export interface Provenance {
  isDemo: boolean;
  /** Only ever set for records backed by a real, checkable document. */
  sourceUrl?: string;
  /** ISO-8601 date the source was retrieved (real sources only). */
  retrievedAt?: string;
}

/* -------------------------------------------------------------------------- */
/* Jurisdiction                                                                */
/* -------------------------------------------------------------------------- */

export type JurisdictionLevel = "city" | "county" | "state" | "federal";

export interface Jurisdiction extends Provenance {
  id: string;
  /** Display name, e.g. "City of Cedar Hollow". */
  name: string;
  level: JurisdictionLevel;
  region: string;
  country: string;
  /** Postal codes covered. Demo city uses a reserved placeholder code. */
  postalCodes: string[];
  /** Plain-language coverage statement shown in the UI. */
  coverageNote: string;
  /** True when PolicyPulse has verified, linkable policy data here. */
  hasVerifiedCoverage: boolean;
}

/* -------------------------------------------------------------------------- */
/* Source                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * - `official-document` / `official-page`: a real, linkable public source.
 * - `illustrative`: fictional demonstration data with no real counterpart.
 */
export type SourceKind = "official-document" | "official-page" | "illustrative";

export interface Source extends Provenance {
  id: string;
  kind: SourceKind;
  publisher: string;
  title: string;
  /** Required for real sources; omitted for illustrative data. */
  url?: string;
  publishedAt?: string;
  /** What this source is — and explicitly what it is not. */
  note: string;
  /**
   * Distinguishes binding legal text from an explanatory summary written for
   * this app. `legal-text` = the requirement itself.
   */
  contentRole: "legal-text" | "explanatory-summary" | "illustrative";
}

/* -------------------------------------------------------------------------- */
/* Policy                                                                      */
/* -------------------------------------------------------------------------- */

export type PolicyStatus = "proposed" | "adopted" | "in-effect";

export type PolicyCategory = "bags" | "organics" | "recycling";

export type SimulationScenarioId =
  | "bag-fee"
  | "composting"
  | "recycling-incentive";

export type PolicyDateKind =
  | "effective"
  | "decision"
  | "comment"
  | "enrollment"
  | "review";

export interface PolicyDate {
  label: string;
  /** ISO-8601 date. */
  date: string;
  kind: PolicyDateKind;
  note?: string;
}

/** Parameters that come from the policy text itself — the *actual* rule. */
export interface BagFeePolicyParameters {
  scenario: "bag-fee";
  currency: string;
  /** The fee the policy actually sets, per bag. */
  feePerBag: number;
  appliesTo: string;
  exemptions: string[];
  revenueUse: string;
}

export interface CompostingPolicyParameters {
  scenario: "composting";
  currency: string;
  /** Recurring program charge per household. 0 = no charge. */
  programFeeMonthly: number;
  /**
   * Share of a household's food waste that is eligible for the program
   * (e.g. excludes material the program does not accept). Documented in
   * `eligibleShareBasis` so the number is never a mystery.
   */
  eligibleShare: number;
  eligibleShareBasis: string;
  acceptedMaterials: string[];
  excludedMaterials: string[];
  collectionFrequency: string;
}

export interface RecyclingIncentivePolicyParameters {
  scenario: "recycling-incentive";
  currency: string;
  /** Reward paid per pound of credited recyclable material. */
  rewardPerPound: number;
  /** Program's own no-incentive participation assumption, 0..1. */
  baselineCaptureRate: number;
  /** Reward ceiling per household per month, or null when uncapped. */
  maxRewardPerHouseholdMonthly: number | null;
  creditedMaterials: string[];
  contaminationRule: string;
}

export type PolicyParameters =
  | BagFeePolicyParameters
  | CompostingPolicyParameters
  | RecyclingIncentivePolicyParameters;

export interface Policy extends Provenance {
  /** URL-safe stable identifier, also used as the route slug. */
  id: string;
  title: string;
  shortTitle: string;
  category: PolicyCategory;
  status: PolicyStatus;
  jurisdictionId: string;
  /** One or two plain-language sentences. No jargon. */
  summary: string;
  /** "What changes?" */
  whatChanges: string[];
  /** "Who is affected?" */
  whoIsAffected: string[];
  /** "What can I do?" — short bullets; Action Center holds the long form. */
  whatYouCanDo: string[];
  /** "What assumptions or uncertainties should I know?" */
  uncertainties: string[];
  keyDates: PolicyDate[];
  sourceIds: string[];
  /** Which simulator scenario this policy runs through. */
  scenario: SimulationScenarioId;
  policyParameters: PolicyParameters;
  tags: string[];
  /**
   * Text that makes clear what kind of content this is. Rendered verbatim so a
   * demo record can never masquerade as a real ordinance.
   */
  provenanceLabel: string;
}

/* -------------------------------------------------------------------------- */
/* Household                                                                   */
/* -------------------------------------------------------------------------- */

export type Tenure = "renter" | "homeowner";

/** Composting availability is tri-state: yes / no / not sure. */
export type TriState = "yes" | "no" | "unsure";

export interface HouseholdProfile {
  /** Number of people in the household, 1–12. */
  householdSize: number;
  tenure: Tenure;
  /** Grocery shopping trips per week, 0–21. */
  groceryTripsPerWeek: number;
  /** Disposable carryout bags taken per trip, 0–10. */
  bagsPerTrip: number;
  /** Estimated weekly food waste generated, in pounds, 0–100. */
  weeklyFoodWasteLb: number;
  /** Whether curbside/community composting is available to them. */
  compostingAvailable: TriState;
}

/** Why each field exists — shown next to the input in the UI. */
export interface ProfileFieldMeta {
  key: keyof HouseholdProfile;
  label: string;
  help: string;
  unit?: string;
}

/* -------------------------------------------------------------------------- */
/* Simulation                                                                  */
/* -------------------------------------------------------------------------- */

export interface BagFeeAssumptions {
  scenario: "bag-fee";
  /** Share of trips where the household brings its own bags, 0..1. */
  reusableBagAdoptionRate: number;
  /** Hypothetical fee used for "what-if" exploration. null = use the real fee. */
  whatIfFeePerBag: number | null;
  includeReusableBagPurchaseCost: boolean;
  /** Illustrative one-time cost of a reusable bag set. */
  reusableBagSetCost: number;
}

export interface CompostingAssumptions {
  scenario: "composting";
  /** Share of eligible food waste the household diverts, 0..1. */
  participationRate: number;
  /** Hypothetical eligible-share override. null = use the policy value. */
  whatIfEligibleShare: number | null;
  includeBinCost: boolean;
  /** Illustrative one-time cost of a kitchen caddy / bin. */
  binCost: number;
}

export interface RecyclingAssumptions {
  scenario: "recycling-incentive";
  /** Share of generated recyclables actually put in the recycling stream, 0..1. */
  captureRate: number;
  /** Hypothetical reward override. null = use the policy value. */
  whatIfRewardPerPound: number | null;
  /** Share of collected material rejected for contamination, 0..1. */
  contaminationRate: number;
  /** Illustrative generation rate used when no measured value exists. */
  weeklyRecyclablesPerPersonLb: number;
}

export type SimulationAssumptions =
  | BagFeeAssumptions
  | CompostingAssumptions
  | RecyclingAssumptions;

export type SimulationAssumptionsByScenario = {
  "bag-fee": BagFeeAssumptions;
  composting: CompostingAssumptions;
  "recycling-incentive": RecyclingAssumptions;
};

/** Deep-partial override map, used for household-archetype comparisons. */
export type AssumptionOverrides = {
  [K in SimulationScenarioId]?: Partial<SimulationAssumptionsByScenario[K]>;
};

export type MetricUnit = "bags" | "usd" | "lb" | "trips";

export interface SimulationMetric {
  key: string;
  label: string;
  unit: MetricUnit;
  baselineMonthly: number;
  simulatedMonthly: number;
  baselineAnnual: number;
  simulatedAnnual: number;
  /** True when a smaller number is the better outcome (bags, cost). */
  lowerIsBetter: boolean;
  /** Short plain-language gloss, e.g. "fewer bags is better". */
  description: string;
  /** Whether this metric is meaningful to chart (costs vs counts differ). */
  chartable: boolean;
}

/** One line of the visible calculation trace. */
export interface CalculationStep {
  id: string;
  /** Human-readable rule, e.g. "Monthly shopping trips = weekly trips × 52 ÷ 12". */
  expression: string;
  /** The same rule with the user's numbers substituted. */
  substituted: string;
  /** The computed value, pre-formatted. */
  result: string;
  note?: string;
}

export type AssumptionSource =
  | "policy"
  | "household"
  | "illustrative"
  | "what-if";

export interface AssumptionNote {
  label: string;
  value: string;
  source: AssumptionSource;
  note?: string;
}

export interface SimulationResult {
  scenario: SimulationScenarioId;
  policyId: string;
  policyTitle: string;
  currency: string;
  metrics: SimulationMetric[];
  headline: {
    /** Negative numbers are savings. */
    monthlyCostChange: number;
    annualCostChange: number;
    primaryImpactLabel: string;
    primaryImpactUnit: MetricUnit;
    primaryImpactMonthly: number;
    primaryImpactAnnual: number;
    /** true when the primary impact is a reduction (good). */
    primaryImpactIsReduction: boolean;
  };
  /** One-time costs (e.g. buying reusable bags), excluded from monthly figures. */
  oneTimeCost: number;
  /**
   * First-year change in household cost: `annualCostChange + oneTimeCost`.
   * A negative number means the household is better off over the year.
   */
  netFirstYear: number;
  steps: CalculationStep[];
  /** Plain-language sentence summarising the result. */
  narrative: string;
  /** Non-fatal data-quality notes, e.g. "zero trips — nothing to simulate". */
  warnings: string[];
  assumptionsUsed: AssumptionNote[];
  /** True when the user overrode a real policy value with a what-if value. */
  usesWhatIf: boolean;
}

/* -------------------------------------------------------------------------- */
/* Community                                                                   */
/* -------------------------------------------------------------------------- */

export type PerspectiveKind = "positive" | "challenge" | "suggestion";

/** Practical circumstances that change how a policy lands. */
export type CircumstanceTag =
  | "renter"
  | "homeowner"
  | "limited-storage"
  | "has-yard"
  | "no-yard"
  | "large-household"
  | "small-household"
  | "no-collection"
  | "walking-only"
  | "car-dependent"
  | "apartment"
  | "fixed-budget";

export interface CommunityStory {
  id: string;
  policyId: string;
  /** Short context label, e.g. "Renter, 2-person household". */
  contextLabel: string;
  contextTags: CircumstanceTag[];
  headline: string;
  body: string;
  perspective: PerspectiveKind;
  householdSize?: number;
  tenure?: Tenure;
  createdAt: string;
  /** Seeded fictional example written for the hackathon. */
  isDemo: boolean;
  /** Submitted by the current user; stored on this device only. */
  isUserSubmitted: boolean;
  authorLabel: string;
}

/* -------------------------------------------------------------------------- */
/* Action Center                                                               */
/* -------------------------------------------------------------------------- */

export type ActionKind = "checklist" | "question" | "guide" | "email-draft";

export interface ActionStep {
  title: string;
  detail: string;
}

export interface ActionItem extends Provenance {
  id: string;
  /** Policy this belongs to, or "all" for cross-policy actions. */
  policyId: string;
  kind: ActionKind;
  title: string;
  detail: string;
  /** Present for `guide` actions. */
  steps?: ActionStep[];
  /** Present for `email-draft` actions. */
  emailTemplate?: EmailTemplate;
}

export interface EmailTemplate {
  subject: string;
  /** Body with `{{placeholders}}` resolved at render time. */
  body: string;
  placeholders: string[];
}

export interface OfficialContact {
  id: string;
  policyId: string;
  label: string;
  channel: "web" | "email" | "phone" | "in-person";
  value: string;
  /** Only true when a real, checked official link is attached. */
  verified: boolean;
  isDemo: boolean;
  note: string;
}

/* -------------------------------------------------------------------------- */
/* Persistence                                                                 */
/* -------------------------------------------------------------------------- */

export type LocationResolution =
  | { status: "unset" }
  | { status: "demo"; query: string; jurisdictionId: string }
  | { status: "unsupported"; query: string; coverageNote: string };

export interface UserData {
  version: number;
  location: LocationResolution;
  profile: HouseholdProfile;
  assumptions: SimulationAssumptionsByScenario;
  /** Bookmarked policy ids. */
  bookmarks: string[];
  /** `${policyId}:${actionId}` → completed. */
  checklist: Record<string, boolean>;
  /** User-authored stories. Device-local only. */
  stories: CommunityStory[];
}

/* -------------------------------------------------------------------------- */
/* Policy provider (replaceable data-access interface)                         */
/* -------------------------------------------------------------------------- */

export interface PolicyQuery {
  status?: PolicyStatus[];
  category?: PolicyCategory[];
  text?: string;
  jurisdictionId?: string;
}

export interface PolicyProviderCapabilities {
  /** Can this provider serve verified data for an arbitrary user location? */
  supportsLocationLookup: boolean;
  /** Human-readable description shown in the data-status UI. */
  dataStatusLabel: string;
  isDemo: boolean;
}

/**
 * Swap `DemoPolicyProvider` for `HttpPolicyProvider` (or any other
 * implementation) without touching a single component.
 */
export interface PolicyProvider {
  readonly id: string;
  readonly capabilities: PolicyProviderCapabilities;
  listJurisdictions(): Promise<Jurisdiction[]>;
  getJurisdiction(id: string): Promise<Jurisdiction | null>;
  listPolicies(query?: PolicyQuery): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | null>;
  listSources(): Promise<Source[]>;
  getSources(ids: string[]): Promise<Source[]>;
}
