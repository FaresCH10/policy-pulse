import { z } from "zod";

const text = z.string().trim().min(1).max(12000);
const id = z.string().regex(/^[a-z0-9][a-z0-9-]{0,99}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  const parsed = new Date(v);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
}, "Invalid calendar date");
export const httpsUrlSchema = z.string().url().refine(v => {
  const url = new URL(v);
  return url.protocol === "https:" && !url.username && !url.password;
}, "An HTTPS link without credentials is required");
const provenance = { isDemo: z.literal(false), sourceUrl: httpsUrlSchema.optional(), retrievedAt: date };
const list = z.array(text).max(100);
const amount = z.number().finite().min(0).max(100000);
const rate = z.number().finite().min(0).max(1);
// All monetary UI currently uses USD. Reject other currencies rather than mislabel them.
const parameters = z.discriminatedUnion("scenario", [
  z.object({ scenario: z.literal("bag-fee"), currency: z.literal("USD"), feePerBag: amount, appliesTo: text, exemptions: list, revenueUse: text }),
  z.object({ scenario: z.literal("composting"), currency: z.literal("USD"), programFeeMonthly: amount, eligibleShare: rate, eligibleShareBasis: text, acceptedMaterials: list, excludedMaterials: list, collectionFrequency: text }),
  z.object({ scenario: z.literal("recycling-incentive"), currency: z.literal("USD"), rewardPerPound: amount, baselineCaptureRate: rate, maxRewardPerHouseholdMonthly: amount.nullable(), creditedMaterials: list, contaminationRule: text }),
]);
export const policyRecordSchema = z.object({
  ...provenance, id, title: text, shortTitle: text,
  category: z.enum(["bags", "organics", "recycling"]), status: z.enum(["proposed", "adopted", "in-effect"]), jurisdictionId: id,
  summary: text, whatChanges: list, whoIsAffected: list, whatYouCanDo: list, uncertainties: list,
  keyDates: z.array(z.object({ label: text, date, kind: z.enum(["effective", "decision", "comment", "enrollment", "review"]), note: text.optional() })).max(100),
  sourceIds: z.array(id).min(1).max(100), scenario: z.enum(["bag-fee", "composting", "recycling-incentive"]),
  policyParameters: parameters, tags: list, provenanceLabel: text,
}).superRefine((p, ctx) => {
  if (p.scenario !== p.policyParameters.scenario) ctx.addIssue({ code: "custom", message: "Scenario and parameters must match" });
  const categories = { "bag-fee": "bags", composting: "organics", "recycling-incentive": "recycling" };
  if (categories[p.scenario] !== p.category) ctx.addIssue({ code: "custom", message: "Scenario and category must match" });
});
export const policyFeedSchema = z.object({
  jurisdictions: z.array(z.object({ ...provenance, id, name: text, level: z.enum(["city", "county", "state", "federal"]), region: text, country: text, postalCodes: z.array(z.string().max(20)).max(10000), coverageNote: text, hasVerifiedCoverage: z.literal(true) })).min(1).max(1000),
  policies: z.array(policyRecordSchema).max(5000),
  sources: z.array(z.object({ ...provenance, id, kind: z.enum(["official-document", "official-page"]), publisher: text, title: text, url: httpsUrlSchema, publishedAt: date.optional(), note: text, contentRole: z.enum(["legal-text", "explanatory-summary"]) })).max(10000),
}).superRefine((feed, ctx) => {
  for (const records of [feed.jurisdictions, feed.policies, feed.sources]) {
    if (new Set(records.map(r => r.id)).size !== records.length) ctx.addIssue({ code: "custom", message: "Duplicate record IDs" });
  }
  for (const policy of feed.policies) {
    if (!feed.jurisdictions.some(j => j.id === policy.jurisdictionId) || policy.sourceIds.some(id => !feed.sources.some(s => s.id === id))) {
      ctx.addIssue({ code: "custom", message: "Policy references a missing jurisdiction or source" });
    }
  }
});
