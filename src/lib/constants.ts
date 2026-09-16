import type {
  HouseholdProfile,
  ProfileFieldMeta,
  SimulationAssumptionsByScenario,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Demonstration city                                                          */
/* -------------------------------------------------------------------------- */

/**
 * A deliberately fictional city. The postal code uses a reserved placeholder so
 * it can never resolve to a real place, and the name is not a real municipality.
 */
export const DEMO_CITY = {
  id: "cedar-hollow",
  name: "Cedar Hollow",
  fullName: "City of Cedar Hollow",
  region: "Demo State",
  postalCode: "00000",
  /** Shown wherever the demo city is named. */
  label: "Cedar Hollow (fictional demonstration city)",
  shortLabel: "Cedar Hollow · demo",
} as const;

/** Text used anywhere the app could be mistaken for a live service. */
export const DISCLAIMERS = {
  global:
    "PolicyPulse is running in demo mode. Every policy, date, cost, contact and story shown is fictional demonstration content, not a real ordinance and not legal advice.",
  policies:
    "Illustrative policy data. These are not real laws. Nothing here has been verified against an official source, and no deadline shown is a real deadline.",
  stories:
    "Fictional examples written for this demonstration. They do not represent any real person, household, or neighbourhood.",
  projections:
    "Estimates come only from the formulas shown in “How this is calculated”, applied to the assumptions listed alongside them. No emissions, health or temperature effects are modelled.",
  contacts:
    "Example contact details for the demonstration city only. They are not real addresses and messages sent to them go nowhere.",
  community:
    "Demo submissions are stored only in this browser on this device. Nothing is uploaded, published, or shared with anyone.",
} as const;

/* -------------------------------------------------------------------------- */
/* Household defaults                                                          */
/* -------------------------------------------------------------------------- */

export const DEFAULT_PROFILE: HouseholdProfile = {
  householdSize: 3,
  tenure: "renter",
  groceryTripsPerWeek: 2,
  bagsPerTrip: 3,
  weeklyFoodWasteLb: 12,
  compostingAvailable: "unsure",
};

/** Drives the household setup form — label + the reason the field exists. */
export const PROFILE_FIELDS: ProfileFieldMeta[] = [
  {
    key: "householdSize",
    label: "People in your household",
    help: "Used to scale waste estimates that are reported per person. It never changes a policy rule.",
    unit: "people",
  },
  {
    key: "tenure",
    label: "Renting or owning",
    help: "Changes which upgrades you can make yourself — for example whether you can set up a backyard compost pile.",
  },
  {
    key: "groceryTripsPerWeek",
    label: "Grocery trips per week",
    help: "Bag fees are charged per bag taken, so the number of trips is the main driver of your baseline bag count.",
    unit: "trips / week",
  },
  {
    key: "bagsPerTrip",
    label: "Disposable bags per trip",
    help: "Your current habit before any policy or behaviour change. This is the baseline the simulator compares against.",
    unit: "bags / trip",
  },
  {
    key: "weeklyFoodWasteLb",
    label: "Food waste per week",
    help: "Estimated pounds of food scraps your household throws away. Used to size the composting estimate.",
    unit: "lb / week",
  },
  {
    key: "compostingAvailable",
    label: "Composting service available?",
    help: "Determines whether a collection programme is even an option for you. “Not sure” keeps estimates neutral.",
  },
];

/* -------------------------------------------------------------------------- */
/* Illustrative default assumptions                                            */
/* -------------------------------------------------------------------------- */

/**
 * Every number below is an illustrative default, not a measurement. Each one is
 * surfaced in the simulator's assumption list with a `source: "illustrative"`
 * tag so the user can see exactly what was assumed and change it.
 */
export const DEFAULT_ASSUMPTIONS: SimulationAssumptionsByScenario = {
  "bag-fee": {
    scenario: "bag-fee",
    reusableBagAdoptionRate: 0.6,
    whatIfFeePerBag: null,
    includeReusableBagPurchaseCost: true,
    reusableBagSetCost: 12,
  },
  composting: {
    scenario: "composting",
    participationRate: 0.7,
    whatIfEligibleShare: null,
    includeBinCost: true,
    binCost: 25,
  },
  "recycling-incentive": {
    scenario: "recycling-incentive",
    captureRate: 0.8,
    whatIfRewardPerPound: null,
    contaminationRate: 0.1,
    weeklyRecyclablesPerPersonLb: 10,
  },
};

/** Shared by the "reset" controls so reset behaviour is identical everywhere. */
export const WEEKS_PER_YEAR = 52;
export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_MONTH = WEEKS_PER_YEAR / MONTHS_PER_YEAR; // 4.3333…

export const CURRENCY = "USD";

/* -------------------------------------------------------------------------- */
/* Simulator control bounds                                                    */
/* -------------------------------------------------------------------------- */

export const SLIDER_BOUNDS = {
  reusableBagAdoptionRate: { min: 0, max: 100, step: 1, suffix: "%" },
  whatIfFeePerBag: { min: 0, max: 100, step: 1, suffix: "¢" },
  reusableBagSetCost: { min: 0, max: 60, step: 1, suffix: "$" },
  participationRate: { min: 0, max: 100, step: 1, suffix: "%" },
  whatIfEligibleShare: { min: 0, max: 100, step: 1, suffix: "%" },
  binCost: { min: 0, max: 120, step: 1, suffix: "$" },
  captureRate: { min: 0, max: 100, step: 1, suffix: "%" },
  whatIfRewardPerPound: { min: 0, max: 50, step: 1, suffix: "¢" },
  contaminationRate: { min: 0, max: 100, step: 1, suffix: "%" },
  weeklyRecyclablesPerPersonLb: { min: 0, max: 40, step: 1, suffix: "lb" },
  householdSize: { min: 1, max: 12, step: 1, suffix: "" },
  groceryTripsPerWeek: { min: 0, max: 21, step: 1, suffix: "" },
  bagsPerTrip: { min: 0, max: 10, step: 1, suffix: "" },
  weeklyFoodWasteLb: { min: 0, max: 100, step: 1, suffix: "lb" },
} as const;

/* -------------------------------------------------------------------------- */
/* Storage                                                                     */
/* -------------------------------------------------------------------------- */

export const STORAGE_KEY = "policypulse.userdata.v1";
export const USER_DATA_VERSION = 1;

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

export const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: "overview", description: "Your household snapshot" },
  { href: "/policies", label: "Policy Explorer", icon: "policies", description: "Browse local policies" },
  { href: "/simulator", label: "Impact Simulator", icon: "simulator", description: "Model your own numbers" },
  { href: "/community", label: "Community", icon: "community", description: "How it lands for others" },
  { href: "/actions", label: "Action Center", icon: "actions", description: "What you can do next" },
] as const;

export type NavIcon = (typeof NAV_ITEMS)[number]["icon"];
