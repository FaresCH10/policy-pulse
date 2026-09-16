import type {
  AssumptionOverrides,
  CircumstanceTag,
  CommunityStory,
  HouseholdProfile,
} from "../types";

/* -------------------------------------------------------------------------- */
/* Seeded fictional stories                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Every story below is `isDemo: true` and written for the hackathon. They are
 * deliberately about *circumstances* — storage, space, building type, budget —
 * rather than claims about groups of people.
 */
export const SEED_STORIES: CommunityStory[] = [
  {
    id: "story-renter-storage",
    policyId: "single-use-bag-fee",
    contextLabel: "Renter · 2-person household · small kitchen",
    contextTags: ["renter", "limited-storage", "apartment", "small-household"],
    headline: "Nowhere to keep reusable bags",
    body: "Our kitchen has one drawer and it is already full. I kept forgetting the reusable bags in the car, so I was paying the fee anyway for the first month. What worked was folding two flat bags into my coat pocket and leaving them there. I still take a bag when I do a big shop, and I have stopped feeling bad about it.",
    perspective: "challenge",
    householdSize: 2,
    tenure: "renter",
    createdAt: "2026-03-04",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-homeowner-yard",
    policyId: "backyard-composter-rebate",
    contextLabel: "Homeowner · 4-person household · back yard",
    contextTags: ["homeowner", "has-yard", "large-household"],
    headline: "The rebate made the decision easy",
    body: "We had talked about composting for two years and never got round to it. The rebate covered most of the bin, so we just bought one. The first month was messy — too wet, then too dry. Adding shredded cardboard fixed it. We now put out a noticeably lighter general waste bin, and the compost goes on the vegetable patch.",
    perspective: "positive",
    householdSize: 4,
    tenure: "homeowner",
    createdAt: "2026-07-19",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-walker-bags",
    policyId: "small-retailer-bag-charge",
    contextLabel: "Renter · walks to the shops · no car",
    contextTags: ["renter", "walking-only", "small-household", "apartment"],
    headline: "I can only carry so much",
    body: "I shop every other day on foot because I do not have a car. That is more trips than most people, so a per-bag charge lands harder on me than on someone doing one big weekly shop. A folding bag that clips to my keys solved most of it, but I would like to see the small shops offer a sturdy bag rather than only thin ones.",
    perspective: "challenge",
    householdSize: 1,
    tenure: "renter",
    createdAt: "2026-09-01",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-large-household-waste",
    policyId: "household-composting-program",
    contextLabel: "Homeowner · 6-person household",
    contextTags: ["homeowner", "large-household", "has-yard"],
    headline: "Our food waste is a lot more than I assumed",
    body: "Six of us, and the scraps add up fast. I guessed we produced maybe 10 lb a week and it was closer to 25. The kitchen caddy fills up in two days, which is fine, but the weekly kerbside bin is the real constraint. If the programme starts, I would want a bigger bin option from day one rather than having to ask later.",
    perspective: "suggestion",
    householdSize: 6,
    tenure: "homeowner",
    createdAt: "2026-08-27",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-no-collection",
    policyId: "household-composting-program",
    contextLabel: "Renter · apartment block · no collection",
    contextTags: ["renter", "no-collection", "apartment", "limited-storage"],
    headline: "My building is not in the first phase",
    body: "Our block has 40 units and we are not covered when the programme starts. So the estimate for me is basically zero, no matter what I do. The useful thing was finding that out early — I stopped planning around a service that is not coming to my building yet, and looked at the county rebate instead.",
    perspective: "challenge",
    householdSize: 3,
    tenure: "renter",
    createdAt: "2026-09-08",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-recycling-contamination",
    policyId: "recycling-incentive-program",
    contextLabel: "Homeowner · 3-person household",
    contextTags: ["homeowner", "small-household", "has-yard"],
    headline: "The cap matters more than the rate",
    body: "I ran the numbers with my own habits and the reward hit the monthly cap before I got anywhere near a high capture rate. That is not a complaint — it just means the interesting question is not the per-pound rate, it is whether the cap is set where the programme actually wants to encourage sorting.",
    perspective: "suggestion",
    householdSize: 3,
    tenure: "homeowner",
    createdAt: "2026-08-14",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-fixed-budget",
    policyId: "single-use-bag-fee",
    contextLabel: "Renter · 5-person household · fixed budget",
    contextTags: ["renter", "large-household", "fixed-budget", "car-dependent"],
    headline: "Small charges still add up",
    body: "It is ten cents. I know. But five of us and three trips a week and it shows up on the receipt every time. What changed for me was putting four bags in the boot of the car so I stop buying them at the till. The first two weeks were annoying and now it is automatic.",
    perspective: "challenge",
    householdSize: 5,
    tenure: "renter",
    createdAt: "2026-04-11",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
  {
    id: "story-first-month",
    policyId: "backyard-composter-rebate",
    contextLabel: "Homeowner · 2-person household · small yard",
    contextTags: ["homeowner", "has-yard", "small-household"],
    headline: "Start smaller than you think",
    body: "We bought the biggest bin we could find because it was the best value per litre. It took months to fill and turned into a soggy mess. A neighbour with a small bin had finished compost in eight weeks. If you have a small household, the bin size matters more than the rebate amount.",
    perspective: "suggestion",
    householdSize: 2,
    tenure: "homeowner",
    createdAt: "2026-06-02",
    isDemo: true,
    isUserSubmitted: false,
    authorLabel: "Fictional example",
  },
];

/* -------------------------------------------------------------------------- */
/* Scenario comparisons                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Practical circumstances, expressed as *inputs* rather than claims.
 *
 * Each archetype is a household profile plus the assumption overrides that its
 * circumstance implies. The Community page runs the real simulation engine on
 * each one, so the comparison shows what the formulas actually produce — never
 * an assertion about how a group of people behaves.
 */
export interface HouseholdArchetype {
  id: string;
  label: string;
  /** The practical constraint being tested. */
  constraint: string;
  tags: CircumstanceTag[];
  profile: HouseholdProfile;
  /** Applied on top of the illustrative defaults, for this scenario only. */
  assumptionOverrides: AssumptionOverrides;
  /** Which scenarios this archetype is most informative for. */
  scenarios: ("bag-fee" | "composting" | "recycling-incentive")[];
}

export const HOUSEHOLD_ARCHETYPES: HouseholdArchetype[] = [
  {
    id: "renter-limited-storage",
    label: "Renter, limited storage",
    constraint:
      "Two people in a small flat with no outdoor space and almost no kitchen storage.",
    tags: ["renter", "limited-storage", "apartment", "small-household"],
    profile: {
      householdSize: 2,
      tenure: "renter",
      groceryTripsPerWeek: 3,
      bagsPerTrip: 2,
      weeklyFoodWasteLb: 8,
      compostingAvailable: "no",
    },
    assumptionOverrides: {
      "bag-fee": { reusableBagAdoptionRate: 0.35 },
      composting: { participationRate: 0.2 },
    },
    scenarios: ["bag-fee", "composting"],
  },
  {
    id: "homeowner-with-yard",
    label: "Homeowner with a yard",
    constraint:
      "Four people, a back garden, and somewhere to keep a bin and a compost heap.",
    tags: ["homeowner", "has-yard", "large-household"],
    profile: {
      householdSize: 4,
      tenure: "homeowner",
      groceryTripsPerWeek: 2,
      bagsPerTrip: 4,
      weeklyFoodWasteLb: 18,
      compostingAvailable: "yes",
    },
    assumptionOverrides: {
      "bag-fee": { reusableBagAdoptionRate: 0.8 },
      composting: { participationRate: 0.85 },
    },
    scenarios: ["bag-fee", "composting"],
  },
  {
    id: "large-household",
    label: "Larger household",
    constraint: "Six people, which scales every count and every pound upward.",
    tags: ["large-household", "homeowner", "has-yard"],
    profile: {
      householdSize: 6,
      tenure: "homeowner",
      groceryTripsPerWeek: 4,
      bagsPerTrip: 5,
      weeklyFoodWasteLb: 28,
      compostingAvailable: "yes",
    },
    assumptionOverrides: {
      "bag-fee": { reusableBagAdoptionRate: 0.6 },
      composting: { participationRate: 0.7 },
    },
    scenarios: ["bag-fee", "composting", "recycling-incentive"],
  },
  {
    id: "no-convenient-collection",
    label: "No convenient collection",
    constraint:
      "Recycles and composts in principle, but has no kerbside service it can actually use.",
    tags: ["renter", "no-collection", "apartment", "car-dependent"],
    profile: {
      householdSize: 3,
      tenure: "renter",
      groceryTripsPerWeek: 1,
      bagsPerTrip: 4,
      weeklyFoodWasteLb: 12,
      compostingAvailable: "no",
    },
    assumptionOverrides: {
      composting: { participationRate: 0 },
      "recycling-incentive": { captureRate: 0.3 },
    },
    scenarios: ["composting", "recycling-incentive"],
  },
  {
    id: "walks-to-shops",
    label: "Shops on foot",
    constraint:
      "One person, no car, so more trips per week but fewer bags carried each time.",
    tags: ["walking-only", "small-household", "renter"],
    profile: {
      householdSize: 1,
      tenure: "renter",
      groceryTripsPerWeek: 4,
      bagsPerTrip: 1,
      weeklyFoodWasteLb: 5,
      compostingAvailable: "unsure",
    },
    assumptionOverrides: {
      "bag-fee": { reusableBagAdoptionRate: 0.5 },
    },
    scenarios: ["bag-fee"],
  },
];

export const PERSPECTIVE_LABELS: Record<
  CommunityStory["perspective"],
  { label: string; tone: string }
> = {
  positive: { label: "What worked", tone: "forest" },
  challenge: { label: "Where it is hard", tone: "clay" },
  suggestion: { label: "Suggestion", tone: "teal" },
};

export const CIRCUMSTANCE_LABELS: Record<CircumstanceTag, string> = {
  renter: "Renter",
  homeowner: "Homeowner",
  "limited-storage": "Limited storage",
  "has-yard": "Has outdoor space",
  "no-yard": "No outdoor space",
  "large-household": "Larger household",
  "small-household": "Smaller household",
  "no-collection": "No convenient collection",
  "walking-only": "Shops on foot",
  "car-dependent": "Depends on a car",
  apartment: "Apartment",
  "fixed-budget": "Fixed budget",
};
