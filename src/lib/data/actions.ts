import type { ActionItem, OfficialContact } from "../types";

/**
 * Action Center content.
 *
 * All of it belongs to the fictional demonstration city. Email drafts are
 * templates the user edits and copies themselves — PolicyPulse never sends
 * anything, and no draft contains an address that could reach a real person.
 */
export const ACTION_ITEMS: ActionItem[] = [
  /* ---------------------------- Bag fee ---------------------------------- */
  {
    id: "bag-fee-checklist",
    policyId: "single-use-bag-fee",
    kind: "checklist",
    title: "Prepare for the bag fee",
    detail:
      "Small, concrete steps that reduce what you pay without changing where or when you shop.",
    isDemo: true,
  },
  {
    id: "bag-fee-questions",
    policyId: "single-use-bag-fee",
    kind: "question",
    title: "Questions worth asking the city",
    detail:
      "Useful if you want to understand how the charge is actually applied in your situation.",
    isDemo: true,
  },
  {
    id: "bag-fee-guide",
    policyId: "single-use-bag-fee",
    kind: "guide",
    title: "Getting started with reusable bags",
    detail:
      "A short guide aimed at people who have tried before and kept forgetting.",
    isDemo: true,
    steps: [
      {
        title: "Count what you actually need",
        detail:
          "One reusable bag usually holds about the same as two to three disposable ones. Most households need three or four, not ten.",
      },
      {
        title: "Store them where the trip starts, not where the shopping happens",
        detail:
          "A bag in the boot of a car, in a coat pocket, or hanging on the door handle gets used. A bag in a cupboard does not.",
      },
      {
        title: "Fold flat, do not roll",
        detail:
          "Flat-folded bags take a fraction of the space and survive being squashed. This matters most in small kitchens.",
      },
      {
        title: "Put them back the same day",
        detail:
          "Unpack the shopping and return the bags to their spot immediately. This is the step most people skip.",
      },
      {
        title: "Accept an imperfect record",
        detail:
          "Taking a bag occasionally does not undo the benefit. A partial change still reduces what you pay.",
      },
    ],
  },
  {
    id: "bag-fee-email",
    policyId: "single-use-bag-fee",
    kind: "email-draft",
    title: "Draft a comment in your own words",
    detail:
      "Edit this to say what you actually think, then copy it. PolicyPulse will not send it for you.",
    isDemo: true,
    emailTemplate: {
      subject: "Comment on the Single-Use Carryout Bag Fee",
      body: `Dear Cedar Hollow Public Works,

I live in {{jurisdictionName}} and I am writing about the Single-Use Carryout Bag Fee.

My household: {{householdContext}}.

What I have noticed: {{myPerspective}}

I would like to know how the charge applies to {{questionTopic}}.

Thank you for your time.

{{signature}}`,
      placeholders: [
        "jurisdictionName",
        "householdContext",
        "myPerspective",
        "questionTopic",
        "signature",
      ],
    },
  },

  /* --------------------------- Composting -------------------------------- */
  {
    id: "composting-checklist",
    policyId: "household-composting-program",
    kind: "checklist",
    title: "Prepare for the composting programme",
    detail:
      "What to sort out before collection starts, so the first week is not a scramble.",
    isDemo: true,
  },
  {
    id: "composting-questions",
    policyId: "household-composting-program",
    kind: "question",
    title: "Questions worth asking before enrolment",
    detail:
      "Especially useful if you rent, or live in a building with shared bins.",
    isDemo: true,
  },
  {
    id: "composting-guide",
    policyId: "household-composting-program",
    kind: "guide",
    title: "Getting started with a kitchen caddy",
    detail:
      "Practical steps for keeping food scraps out of the general waste bin.",
    isDemo: true,
    steps: [
      {
        title: "Pick the smallest caddy that lasts a week",
        detail:
          "A caddy that is too big sits half-full and starts to smell. Match it to how often you cook.",
      },
      {
        title: "Line it, or wash it — choose one",
        detail:
          "A paper liner or certified compostable liner keeps the caddy clean. If your programme does not accept liners, a quick rinse after each emptying works just as well.",
      },
      {
        title: "Keep a lid on it",
        detail:
          "Most complaints about food-waste collection are about smell and fruit flies. A lid solves both.",
      },
      {
        title: "Put the accepted-materials list on the fridge",
        detail:
          "Contamination is the main reason a collection gets rejected. Knowing what stays out is the whole game.",
      },
      {
        title: "Empty on a fixed day, not when it is full",
        detail:
          "A routine beats a full bin. Tie it to bin day so you never forget.",
      },
      {
        title: "If it goes wrong, change one thing",
        detail:
          "Too wet, too dry, too smelly — adjust one variable at a time and give it a week.",
      },
    ],
  },
  {
    id: "composting-email",
    policyId: "household-composting-program",
    kind: "email-draft",
    title: "Draft a comment in your own words",
    detail:
      "Useful for asking about phase coverage, bin sizes, or shared buildings.",
    isDemo: true,
    emailTemplate: {
      subject: "Question about the Household Organics Collection Programme",
      body: `Dear Cedar Hollow Public Works,

I live in {{jurisdictionName}} and I am writing about the Household Organics Collection Programme.

My household: {{householdContext}}.

What matters to me: {{myPerspective}}

Could you confirm how this applies to {{questionTopic}}?

Thank you for your time.

{{signature}}`,
      placeholders: [
        "jurisdictionName",
        "householdContext",
        "myPerspective",
        "questionTopic",
        "signature",
      ],
    },
  },

  /* -------------------------- Recycling ---------------------------------- */
  {
    id: "recycling-checklist",
    policyId: "recycling-incentive-program",
    kind: "checklist",
    title: "Prepare for the recycling incentive",
    detail:
      "Contamination is what reduces a reward, so most of this list is about sorting.",
    isDemo: true,
  },
  {
    id: "recycling-questions",
    policyId: "recycling-incentive-program",
    kind: "question",
    title: "Questions worth asking about the proposal",
    detail:
      "The cap and the contamination rule affect the outcome more than the headline rate.",
    isDemo: true,
  },
  {
    id: "recycling-guide",
    policyId: "recycling-incentive-program",
    kind: "guide",
    title: "Getting your recycling credited",
    detail:
      "How to avoid the mistakes that cause a load to be rejected.",
    isDemo: true,
    steps: [
      {
        title: "Rinse, do not scrub",
        detail:
          "A quick rinse removes the food residue that causes most rejections. It does not need to be spotless.",
      },
      {
        title: "Keep lids separate unless told otherwise",
        detail:
          "Lids are often a different material from the container. Follow your local rule rather than guessing.",
      },
      {
        title: "Never bag your recyclables",
        detail:
          "Material inside a plastic bag cannot be sorted and the whole bag is usually rejected.",
      },
      {
        title: "Flatten cardboard",
        detail:
          "It saves space in your bin and it is what sorting facilities expect.",
      },
      {
        title: "When in doubt, leave it out",
        detail:
          "One wrong item can reduce the value of a whole load. The general waste bin is the safer default for anything you are unsure about.",
      },
      {
        title: "Check the cap before optimising the rate",
        detail:
          "If the programme caps rewards per household, a higher capture rate may not change your payment. The simulator shows where the cap bites.",
      },
    ],
  },
  {
    id: "recycling-email",
    policyId: "recycling-incentive-program",
    kind: "email-draft",
    title: "Draft a comment on the proposal",
    detail:
      "Say what you think about the rate, the cap, or how shared buildings would be handled.",
    isDemo: true,
    emailTemplate: {
      subject: "Comment on the Recycling Incentive Programme proposal",
      body: `Dear Cedar Hollow Public Works,

I live in {{jurisdictionName}} and I am writing about the proposed Recycling Incentive Programme.

My household: {{householdContext}}.

My view: {{myPerspective}}

Before this is decided, I would like to understand {{questionTopic}}.

Thank you for your time.

{{signature}}`,
      placeholders: [
        "jurisdictionName",
        "householdContext",
        "myPerspective",
        "questionTopic",
        "signature",
      ],
    },
  },
];

/** Checklist lines, keyed by action item id. */
export const CHECKLIST_CONTENT: Record<string, { id: string; label: string; help?: string }[]> = {
  "bag-fee-checklist": [
    {
      id: "count-bags",
      label: "Count how many reusable bags you actually need",
      help: "One reusable bag holds roughly two to three disposable bags' worth.",
    },
    {
      id: "find-storage",
      label: "Choose a storage spot you pass on the way out",
      help: "Door handle, coat pocket, car boot — somewhere on the route, not in a cupboard.",
    },
    {
      id: "first-bag-set",
      label: "Put a starter set in place",
      help: "Two flat-foldable bags is enough to begin.",
    },
    {
      id: "review-receipt",
      label: "Check one receipt for the bag-fee line",
      help: "Seeing the actual charge is usually more motivating than the estimate.",
    },
    {
      id: "return-routine",
      label: "Return the bags the same day you unpack",
      help: "This is the step most people skip.",
    },
  ],
  "composting-checklist": [
    {
      id: "check-phase",
      label: "Check whether your address is in the first phase",
      help: "Larger apartment buildings are not included at the start in this demonstration.",
    },
    {
      id: "choose-caddy",
      label: "Choose a caddy size that lasts about a week",
      help: "Too big and it sits half-full; too small and you empty it daily.",
    },
    {
      id: "liners",
      label: "Decide on liners or a rinse routine",
      help: "Follow whatever your programme accepts — some do not take liners.",
    },
    {
      id: "print-list",
      label: "Put the accepted-materials list somewhere visible",
      help: "Contamination is the main reason collections get rejected.",
    },
    {
      id: "landlord",
      label: "If you rent, confirm who is responsible for the bin",
      help: "Shared buildings often need the owner to agree to a collection point.",
    },
    {
      id: "bin-day",
      label: "Tie emptying to your existing bin day",
      help: "A routine beats waiting for a full bin.",
    },
  ],
  "recycling-checklist": [
    {
      id: "sorting-rules",
      label: "Look up your local sorting rules",
      help: "Rules differ by material and by facility.",
    },
    {
      id: "rinse",
      label: "Start rinsing containers before they go in the bin",
      help: "Food residue is a common cause of rejected loads.",
    },
    {
      id: "no-bags",
      label: "Stop bagging recyclables",
      help: "Bagged material cannot be sorted and is usually rejected.",
    },
    {
      id: "flatten",
      label: "Flatten cardboard",
      help: "Saves bin space and matches what facilities expect.",
    },
    {
      id: "building-manager",
      label: "Ask your building manager how households would be credited",
      help: "Shared bins may not be attributable to individual units.",
    },
    {
      id: "check-cap",
      label: "Note the monthly reward cap",
      help: "The simulator shows whether the cap affects your estimate.",
    },
  ],
};

/** Neutral question prompts, per policy. */
export const QUESTION_CONTENT: Record<string, string[]> = {
  "bag-fee-questions": [
    "Does the charge apply to delivery orders and curbside pickup, or only in-store checkout?",
    "How is the charge handled for customers using a food-assistance programme?",
    "Which bag types are exempt, in plain language?",
    "Is there a reusable-bag giveaway or subsidy for households on a low income?",
    "How will the city report on whether the charge reduced bag use?",
  ],
  "composting-questions": [
    "Which addresses are included in the first phase, and when do later phases begin?",
    "What bin sizes are available for larger households?",
    "Are liners accepted, and if so, which ones?",
    "How are apartment buildings with shared bins handled?",
    "Who is responsible for cleaning the kerbside bin, the household or the city?",
    "What happens to a collection that contains excluded material?",
  ],
  "recycling-questions": [
    "Why is the reward capped per household per month, and at what level?",
    "How is contamination measured, and can a household appeal a rejected load?",
    "Would households in shared buildings receive individual credit?",
    "How would the per-pound rate be reviewed over time?",
    "What evidence supports the programme's baseline capture assumption?",
  ],
};

/* -------------------------------------------------------------------------- */
/* Contacts                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Demonstration contact details only.
 *
 * `verified: false` everywhere, and every value uses a reserved example domain
 * or a reserved 555 phone range so it cannot reach a real person. The UI is
 * required to label these as examples.
 */
export const OFFICIAL_CONTACTS: OfficialContact[] = [
  {
    id: "contact-public-works-web",
    policyId: "all",
    label: "Cedar Hollow Public Works — waste programmes",
    channel: "web",
    value: "https://cedar-hollow.example/waste",
    verified: false,
    isDemo: true,
    note: "Example web address for the fictional demonstration city. It does not resolve to a real site.",
  },
  {
    id: "contact-public-works-email",
    policyId: "all",
    label: "Waste programmes inbox",
    channel: "email",
    value: "waste@cedar-hollow.example",
    verified: false,
    isDemo: true,
    note: "Example address using a reserved domain. Mail sent here goes nowhere.",
  },
  {
    id: "contact-public-works-phone",
    policyId: "all",
    label: "Waste programmes phone line",
    channel: "phone",
    value: "1-555-0100",
    verified: false,
    isDemo: true,
    note: "Reserved 555 number for demonstration use. It is not a working phone line.",
  },
  {
    id: "contact-county-rebate",
    policyId: "backyard-composter-rebate",
    label: "Meadow County Waste Authority — rebate enquiries",
    channel: "web",
    value: "https://meadow-county.example/compost-rebate",
    verified: false,
    isDemo: true,
    note: "Example web address for the fictional county. Not a real rebate programme.",
  },
];

export function getActionItemsForPolicy(policyId: string): ActionItem[] {
  return ACTION_ITEMS.filter(
    (item) => item.policyId === policyId || item.policyId === "all",
  );
}

export function getChecklistLines(actionId: string) {
  return CHECKLIST_CONTENT[actionId] ?? [];
}

export function getQuestions(actionId: string): string[] {
  return QUESTION_CONTENT[actionId] ?? [];
}
