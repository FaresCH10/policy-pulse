import { z } from "zod";
import type { SimulationAssumptionsByScenario } from "./types";

/* -------------------------------------------------------------------------- */
/* Numeric coercion                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Form inputs hand us strings. This coercion rejects empty strings rather than
 * silently treating them as 0, so "I forgot to fill this in" never becomes a
 * valid answer.
 */
function numericField(
  opts: { min: number; max: number; label: string; integer?: boolean },
) {
  const { min, max, label, integer } = opts;
  return z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed === "") return undefined;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : Number.NaN;
      }
      return value;
    },
    z
      .number({
        required_error: `${label} is required.`,
        invalid_type_error: `${label} must be a number.`,
      })
      .refine((n) => Number.isFinite(n), `${label} must be a number.`)
      .refine((n) => !integer || Number.isInteger(n), `${label} must be a whole number.`)
      .refine((n) => n >= min, `${label} cannot be less than ${min}.`)
      .refine((n) => n <= max, `${label} cannot be more than ${max}.`),
  );
}

/* -------------------------------------------------------------------------- */
/* Household profile                                                           */
/* -------------------------------------------------------------------------- */

export const householdProfileSchema = z.object({
  householdSize: numericField({
    min: 1,
    max: 12,
    integer: true,
    label: "Household size",
  }),
  tenure: z.enum(["renter", "homeowner"], {
    required_error: "Choose whether you rent or own.",
    invalid_type_error: "Choose whether you rent or own.",
  }),
  groceryTripsPerWeek: numericField({
    min: 0,
    max: 21,
    label: "Grocery trips per week",
  }),
  bagsPerTrip: numericField({ min: 0, max: 10, label: "Bags per trip" }),
  weeklyFoodWasteLb: numericField({
    min: 0,
    max: 100,
    label: "Weekly food waste",
  }),
  compostingAvailable: z.enum(["yes", "no", "unsure"], {
    required_error: "Tell us whether composting is available.",
    invalid_type_error: "Tell us whether composting is available.",
  }),
});

export type HouseholdProfileInput = z.input<typeof householdProfileSchema>;
export type HouseholdProfileParsed = z.output<typeof householdProfileSchema>;

/* -------------------------------------------------------------------------- */
/* Community story                                                             */
/* -------------------------------------------------------------------------- */

export const STORY_LIMITS = {
  contextLabelMin: 3,
  contextLabelMax: 80,
  headlineMin: 4,
  headlineMax: 90,
  bodyMin: 20,
  bodyMax: 1200,
} as const;

export const storySubmissionSchema = z.object({
  policyId: z.string().min(1, "Choose which policy your story is about."),
  contextLabel: z
    .string()
    .trim()
    .min(
      STORY_LIMITS.contextLabelMin,
      `Add at least ${STORY_LIMITS.contextLabelMin} characters describing your household.`,
    )
    .max(
      STORY_LIMITS.contextLabelMax,
      `Keep the household description under ${STORY_LIMITS.contextLabelMax} characters.`,
    ),
  perspective: z.enum(["positive", "challenge", "suggestion"], {
    required_error: "Choose whether this is a positive impact, a challenge, or a suggestion.",
    invalid_type_error: "Choose whether this is a positive impact, a challenge, or a suggestion.",
  }),
  headline: z
    .string()
    .trim()
    .min(STORY_LIMITS.headlineMin, "Add a short headline.")
    .max(STORY_LIMITS.headlineMax, `Keep the headline under ${STORY_LIMITS.headlineMax} characters.`),
  body: z
    .string()
    .trim()
    .min(STORY_LIMITS.bodyMin, `Write at least ${STORY_LIMITS.bodyMin} characters.`)
    .max(STORY_LIMITS.bodyMax, `Keep the story under ${STORY_LIMITS.bodyMax} characters.`),
  householdSize: z
    .preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      numericField({ min: 1, max: 12, integer: true, label: "Household size" }).optional(),
    )
    .optional(),
  tenure: z.enum(["renter", "homeowner"]).optional(),
  circumstances: z.array(z.string()).max(6, "Choose up to 6 circumstances.").optional(),
});

export type StorySubmission = z.input<typeof storySubmissionSchema>;

/* -------------------------------------------------------------------------- */
/* Email draft                                                                 */
/* -------------------------------------------------------------------------- */

export const emailDraftSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Add a subject line.")
    .max(140, "Keep the subject under 140 characters."),
  body: z
    .string()
    .trim()
    .min(20, "Write at least 20 characters.")
    .max(4000, "Keep the message under 4000 characters."),
});

export type EmailDraft = z.infer<typeof emailDraftSchema>;

/* -------------------------------------------------------------------------- */
/* Location                                                                    */
/* -------------------------------------------------------------------------- */

export const locationQuerySchema = z.object({
  query: z
    .string()
    .trim()
    .min(2, "Enter a city name or a ZIP code.")
    .max(60, "That is too long for a city name or ZIP code."),
});

/* -------------------------------------------------------------------------- */
/* Simulation assumptions (guards stored data + numeric controls)              */
/* -------------------------------------------------------------------------- */

const rate = (label: string) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .number({ invalid_type_error: `${label} must be a number.` })
      .min(0, `${label} cannot be negative.`)
      .max(1, `${label} cannot be more than 100%.`),
  );

const money = (label: string, max = 1000) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .number({ invalid_type_error: `${label} must be a number.` })
      .min(0, `${label} cannot be negative.`)
      .max(max, `${label} is unrealistically high for this demonstration.`),
  );

export const simulationAssumptionsSchema = z.object({
  "bag-fee": z.object({
    scenario: z.literal("bag-fee"),
    reusableBagAdoptionRate: rate("Reusable-bag adoption rate"),
    whatIfFeePerBag: money("What-if fee per bag", 10).nullable(),
    includeReusableBagPurchaseCost: z.boolean(),
    reusableBagSetCost: money("Reusable bag cost", 500),
  }),
  composting: z.object({
    scenario: z.literal("composting"),
    participationRate: rate("Participation rate"),
    whatIfEligibleShare: rate("Eligible share").nullable(),
    includeBinCost: z.boolean(),
    binCost: money("Bin cost", 1000),
  }),
  "recycling-incentive": z.object({
    scenario: z.literal("recycling-incentive"),
    captureRate: rate("Capture rate"),
    whatIfRewardPerPound: money("What-if reward per lb", 50).nullable(),
    contaminationRate: rate("Contamination rate"),
    weeklyRecyclablesPerPersonLb: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z
        .number({ invalid_type_error: "Recyclables per person must be a number." })
        .min(0, "Recyclables per person cannot be negative.")
        .max(200, "Recyclables per person is unrealistically high."),
    ),
  }),
});

/** Validates assumptions loaded from storage; returns defaults on failure. */
export function parseStoredAssumptions(
  raw: unknown,
): SimulationAssumptionsByScenario | null {
  const parsed = simulationAssumptionsSchema.safeParse(raw);
  return parsed.success ? (parsed.data as SimulationAssumptionsByScenario) : null;
}

/* -------------------------------------------------------------------------- */
/* Policy feed validation (used only by the optional HTTP provider)             */
/* -------------------------------------------------------------------------- */

export { policyRecordSchema, policyFeedSchema } from "./feed-schema";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

export type FieldErrors = Record<string, string>;

/** Flattens a ZodError into `{ field: firstMessage }` for form rendering. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Safe parse that returns either the data or a flat error map. */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
): { success: true; data: z.output<T> } | { success: false; errors: FieldErrors } {
  const result = schema.safeParse(value);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: toFieldErrors(result.error) };
}
