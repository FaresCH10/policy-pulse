import type { Policy } from "../types";

const ILLUSTRATIVE = "Illustrative demonstration policy — not a real ordinance.";

/**
 * Seeded policy records for the fictional City of Cedar Hollow.
 *
 * Rules followed here:
 *  - Every record is `isDemo: true` with an explicit `provenanceLabel`.
 *  - No record claims a real-world effect, deadline, or legal obligation.
 *  - `policyParameters` hold the numbers that come from the *policy text*.
 *    Anything the user is free to change lives in `SimulationAssumptions`.
 *  - `sourceIds` point at `sources.ts`, where real documents would be linked.
 *
 * To add a verified policy: set `isDemo: false`, attach a source with a real
 * `url` + `retrievedAt`, and write `provenanceLabel` to name the official
 * document and retrieval date.
 */
export const POLICIES: Policy[] = [
  /* ---------------------------------------------------------------------- */
  /* 1. Single-use bag fee                                                   */
  /* ---------------------------------------------------------------------- */
  {
    id: "single-use-bag-fee",
    title: "Single-Use Carryout Bag Fee",
    shortTitle: "Bag fee",
    category: "bags",
    status: "in-effect",
    jurisdictionId: "cedar-hollow",
    summary:
      "Grocery stores in Cedar Hollow charge 10 cents for each disposable carryout bag you take at checkout. Bags you bring yourself are not charged.",
    whatChanges: [
      "A 10-cent charge applies to each disposable plastic or paper carryout bag handed out at grocery and convenience stores.",
      "Produce bags, bulk-bin bags, and bags used for prescription medicine are not charged.",
      "Stores keep the money; it is not a city tax.",
      "The charge appears as a line item on your receipt.",
    ],
    whoIsAffected: [
      "Any household that shops at a grocery or convenience store inside the city.",
      "People who already bring their own bags are barely affected.",
      "Households that walk to the shops and buy only what they can carry may pay more per trip, because they tend to take a bag each time.",
    ],
    whatYouCanDo: [
      "Keep a set of reusable bags where you will actually see them before a trip.",
      "Ask for one fewer bag per trip instead of trying to change everything at once.",
      "Check whether any reusable-bag giveaway is running at your local store.",
    ],
    uncertainties: [
      "The 10-cent figure is an illustrative default for this demonstration, not a rate anyone has adopted.",
      "Smaller shops may or may not be covered — the fictional policy text exempts shops under 5,000 sq ft.",
      "The estimate assumes every charged bag is a bag you would otherwise have taken. In practice some bags get reused at home first.",
    ],
    keyDates: [
      {
        label: "Took effect",
        date: "2026-01-01",
        kind: "effective",
        note: "Illustrative date for the demonstration city.",
      },
      {
        label: "Scheduled review",
        date: "2028-01-01",
        kind: "review",
        note: "Fictional review date written into the demonstration policy.",
      },
    ],
    sourceIds: ["src-bag-fee", "src-methodology"],
    scenario: "bag-fee",
    policyParameters: {
      scenario: "bag-fee",
      currency: "USD",
      feePerBag: 0.1,
      appliesTo:
        "single-use plastic and paper carryout bags at grocery and convenience stores in the city",
      exemptions: [
        "Produce and bulk-bin bags",
        "Bags for prescription medicine",
        "Reusable bags (any material) brought by the customer",
      ],
      revenueUse: "Retained by the retailer (illustrative)",
    },
    tags: ["bags", "retail", "checkout charge", "in effect"],
    isDemo: true,
    provenanceLabel: ILLUSTRATIVE,
  },

  /* ---------------------------------------------------------------------- */
  /* 2. Bag charge expansion                                                 */
  /* ---------------------------------------------------------------------- */
  {
    id: "small-retailer-bag-charge",
    title: "Small-Retailer Bag Charge Expansion",
    shortTitle: "Bag charge expansion",
    category: "bags",
    status: "proposed",
    jurisdictionId: "cedar-hollow",
    summary:
      "A draft proposal that would extend the 10-cent bag charge to smaller shops — currently exempt — including corner stores and takeaway counters.",
    whatChanges: [
      "The existing 10-cent charge would apply to shops under 5,000 sq ft, which are currently exempt.",
      "Takeaway counters that hand out bags with food orders would be included.",
      "The charge per bag would stay at 10 cents.",
    ],
    whoIsAffected: [
      "Households that shop mainly at small corner stores rather than supermarkets.",
      "People buying a single item on the way home, who are the most likely to take one bag.",
      "Small retailers, who would need to change their checkout systems.",
    ],
    whatYouCanDo: [
      "Read the draft and decide whether you agree with the exemption threshold.",
      "Send a comment to the fictional public-works office if you want to register a view.",
      "Nothing is required of you today — this is a proposal, not a rule.",
    ],
    uncertainties: [
      "The proposal has not been adopted. Nothing here is currently required of any household.",
      "The comment deadline shown is invented for the demonstration and is not a real deadline.",
      "If adopted, the charge would still be 10 cents per bag, so the maths is identical to the existing policy — only the set of covered shops would grow.",
    ],
    keyDates: [
      {
        label: "Public comment closes",
        date: "2026-10-23",
        kind: "comment",
        note: "Fictional deadline for the demonstration city.",
      },
      {
        label: "Expected council decision",
        date: "2026-12-01",
        kind: "decision",
        note: "Fictional decision date. No decision is actually scheduled.",
      },
    ],
    sourceIds: ["src-bag-expansion", "src-methodology"],
    scenario: "bag-fee",
    policyParameters: {
      scenario: "bag-fee",
      currency: "USD",
      feePerBag: 0.1,
      appliesTo:
        "single-use carryout bags at retail shops under 5,000 sq ft, including takeaway counters",
      exemptions: [
        "Produce and bulk-bin bags",
        "Bags for prescription medicine",
        "Shops over 5,000 sq ft (already covered by the existing policy)",
      ],
      revenueUse: "Retained by the retailer (illustrative)",
    },
    tags: ["bags", "proposal", "small business", "comment period"],
    isDemo: true,
    provenanceLabel: ILLUSTRATIVE,
  },

  /* ---------------------------------------------------------------------- */
  /* 3. Household composting programme                                       */
  /* ---------------------------------------------------------------------- */
  {
    id: "household-composting-program",
    title: "Household Organics Collection Programme",
    shortTitle: "Composting programme",
    category: "organics",
    status: "adopted",
    jurisdictionId: "cedar-hollow",
    summary:
      "An adopted programme that will collect food scraps from households every week and turn them into compost. It is scheduled to start in March 2027 and there is no household charge in this demonstration.",
    whatChanges: [
      "A separate weekly collection of food scraps, starting with single-family homes and buildings up to four units.",
      "Households receive one kitchen caddy and one kerbside bin.",
      "Collected material is composted rather than landfilled.",
      "General waste collection frequency does not change in this demonstration.",
    ],
    whoIsAffected: [
      "Single-family households and small apartment buildings in the city.",
      "Larger apartment buildings are not included in the first phase, so many renters would not be covered at the start.",
      "Households without outdoor storage space may find the kerbside bin awkward to keep.",
    ],
    whatYouCanDo: [
      "Check whether your building is in the first phase.",
      "Line your kitchen caddy with paper or a certified compostable liner to keep it clean.",
      "Keep a list of accepted and excluded materials on the fridge.",
    ],
    uncertainties: [
      "The programme has been adopted but has not started. No household is required to do anything yet.",
      "The eligible share used in the estimate (65%) is a PolicyPulse assumption, not a figure from the policy text.",
      "Food waste estimates are self-reported and vary a lot week to week.",
      "This model does not estimate landfill tonnage, methane, or emissions of any kind. It reports pounds diverted and nothing more.",
    ],
    keyDates: [
      {
        label: "Household enrolment opens",
        date: "2026-11-02",
        kind: "enrollment",
        note: "Fictional enrolment window for the demonstration city.",
      },
      {
        label: "Collection starts",
        date: "2027-03-01",
        kind: "effective",
        note: "Fictional start date. No service actually begins.",
      },
    ],
    sourceIds: ["src-compost-program", "src-methodology"],
    scenario: "composting",
    policyParameters: {
      scenario: "composting",
      currency: "USD",
      programFeeMonthly: 0,
      eligibleShare: 0.65,
      eligibleShareBasis:
        "PolicyPulse assumption: the programme accepts food scraps only, so it excludes other compostable material such as yard waste, paper towels and certified compostable packaging. The policy text does not publish an eligible share.",
      acceptedMaterials: [
        "Fruit and vegetable scraps",
        "Coffee grounds and tea leaves",
        "Eggshells",
        "Bread and grain scraps",
        "Small amounts of cooked food (per the illustrative policy text)",
      ],
      excludedMaterials: [
        "Yard waste and branches (collected separately)",
        "Paper towels and napkins",
        "Certified compostable packaging",
        "Pet waste",
        "Any plastic, including “compostable” plastic unless listed",
      ],
      collectionFrequency: "Weekly, on the same day as general waste (illustrative)",
    },
    tags: ["organics", "food waste", "collection", "adopted"],
    isDemo: true,
    provenanceLabel: ILLUSTRATIVE,
  },

  /* ---------------------------------------------------------------------- */
  /* 4. Backyard composter rebate                                            */
  /* ---------------------------------------------------------------------- */
  {
    id: "backyard-composter-rebate",
    title: "Backyard Composter Rebate",
    shortTitle: "Composter rebate",
    category: "organics",
    status: "in-effect",
    jurisdictionId: "meadow-county",
    summary:
      "Meadow County refunds part of the cost of a home compost bin for households with outdoor space. You buy the bin, send in the receipt, and get a fixed amount back.",
    whatChanges: [
      "A fixed rebate is paid towards the purchase of a home compost bin.",
      "You must have outdoor space and keep the receipt.",
      "The rebate is capped per household per year in this demonstration.",
      "Renters can apply if they have permission to compost on the property.",
    ],
    whoIsAffected: [
      "Homeowners with a yard are the most likely to be able to use it.",
      "Renters with a balcony or shared yard may qualify but need the property owner's agreement.",
      "Households in apartments without outdoor space generally cannot use this route.",
    ],
    whatYouCanDo: [
      "Measure the space you actually have before choosing a bin size.",
      "Ask your landlord in writing if you rent and want to compost outside.",
      "Keep the receipt and the bin's packaging until the rebate is confirmed.",
    ],
    uncertainties: [
      "The rebate amount is an illustrative default for this demonstration.",
      "Whether a given household qualifies depends on rules the demonstration does not fully specify.",
      "This policy is modelled with the same diversion formula as the collection programme, even though a backyard bin behaves differently from a kerbside service. Treat the estimate as an approximation.",
    ],
    keyDates: [
      {
        label: "Took effect",
        date: "2026-06-15",
        kind: "effective",
        note: "Illustrative date for the fictional Meadow County.",
      },
      {
        label: "Programme year ends",
        date: "2027-06-30",
        kind: "review",
        note: "Fictional end-of-year date.",
      },
    ],
    sourceIds: ["src-compost-rebate", "src-methodology"],
    scenario: "composting",
    policyParameters: {
      scenario: "composting",
      currency: "USD",
      programFeeMonthly: 0,
      eligibleShare: 0.6,
      eligibleShareBasis:
        "PolicyPulse assumption: a backyard bin typically takes a narrower range of material than a municipal service, so the eligible share is set slightly lower than the collection programme's.",
      acceptedMaterials: [
        "Fruit and vegetable scraps",
        "Coffee grounds and tea leaves",
        "Eggshells",
        "Small quantities of yard trimmings",
      ],
      excludedMaterials: [
        "Cooked food and oils",
        "Dairy and meat",
        "Pet waste",
        "Certified compostable packaging",
      ],
      collectionFrequency:
        "Not applicable — the household manages the bin (illustrative)",
    },
    tags: ["organics", "rebate", "homeowner", "in effect"],
    isDemo: true,
    provenanceLabel: ILLUSTRATIVE,
  },

  /* ---------------------------------------------------------------------- */
  /* 5. Recycling incentive programme                                        */
  /* ---------------------------------------------------------------------- */
  {
    id: "recycling-incentive-program",
    title: "Recycling Incentive Programme",
    shortTitle: "Recycling incentive",
    category: "recycling",
    status: "proposed",
    jurisdictionId: "cedar-hollow",
    summary:
      "A draft proposal to pay households a small amount per pound of recyclable material that is actually collected and accepted — with no payment for loads that are too contaminated.",
    whatChanges: [
      "Households would earn a per-pound reward on credited recyclable material.",
      "Material rejected for contamination would not be credited.",
      "Rewards would be capped per household per month.",
      "Sorting rules would not change — only the payment would be new.",
    ],
    whoIsAffected: [
      "Households that already recycle consistently would earn the most, because their material is already being collected.",
      "Households that put recyclables in the general waste bin would need to change a habit to earn anything.",
      "Renters in buildings without individual recycling collection may not be able to take part.",
    ],
    whatYouCanDo: [
      "Learn your local sorting rules — contamination is the main thing that reduces a reward.",
      "Rinse containers; food residue is a common cause of rejected loads.",
      "Ask your building manager whether individual households would be credited.",
    ],
    uncertainties: [
      "This is a proposal, not a rule. No reward is being paid.",
      "The reward rate, monthly cap and contamination rule are all invented for the demonstration.",
      "The estimate uses an illustrative generation rate of 10 lb of recyclables per person per week because no measured figure is available. Change it in the simulator if you have a better number.",
      "This model does not estimate emissions avoided or tonnage diverted from landfill.",
    ],
    keyDates: [
      {
        label: "Public comment closes",
        date: "2026-10-09",
        kind: "comment",
        note: "Fictional deadline for the demonstration city.",
      },
      {
        label: "Expected council decision",
        date: "2026-11-10",
        kind: "decision",
        note: "Fictional decision date. Nothing is actually scheduled.",
      },
    ],
    sourceIds: ["src-recycling-incentive", "src-methodology"],
    scenario: "recycling-incentive",
    policyParameters: {
      scenario: "recycling-incentive",
      currency: "USD",
      rewardPerPound: 0.05,
      baselineCaptureRate: 0.55,
      maxRewardPerHouseholdMonthly: 12,
      creditedMaterials: [
        "Aluminium and steel cans",
        "Glass bottles and jars",
        "Paper and cardboard",
        "Rigid plastic containers (#1, #2, #5)",
      ],
      contaminationRule:
        "Material in a load with visible contamination is not credited (illustrative rule).",
    },
    tags: ["recycling", "incentive", "proposal", "comment period"],
    isDemo: true,
    provenanceLabel: ILLUSTRATIVE,
  },
];

export function getPolicyById(id: string): Policy | undefined {
  return POLICIES.find((p) => p.id === id);
}
