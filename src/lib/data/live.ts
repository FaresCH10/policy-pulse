import type { Jurisdiction, Policy, Source } from "../types";

// Manually reviewed official sources. This is a dated snapshot, not a live API.
export const REVIEWED_AT = "2026-09-16";
const lawUrl = "https://code.dccouncil.gov/us/dc/council/code/sections/8-102.03";
const guidanceUrl = "https://doee.dc.gov/node/21442";
export const LIVE_JURISDICTIONS: Jurisdiction[] = [{
  id: "washington-dc", name: "Washington, DC", level: "state", region: "District of Columbia",
  country: "US", postalCodes: [], hasVerifiedCoverage: true, isDemo: false,
  coverageNote: "Limited coverage: the District's carryout bag fee only. Shop location determines applicability. Enter Washington, DC or select it below; ZIP lookup is not available.",
  sourceUrl: guidanceUrl, retrievedAt: REVIEWED_AT,
}];
export const LIVE_SOURCES: Source[] = [
  { id: "dc-bag-law", kind: "official-document", publisher: "Council of the District of Columbia",
    title: "D.C. Code § 8–102.03 — Establishment of fee", url: lawUrl, retrievedAt: REVIEWED_AT,
    isDemo: false, contentRole: "legal-text", note: "Official statutory text. PolicyPulse's explanation is a curated summary; check the original for the complete rule." },
  { id: "dc-bag-guidance", kind: "official-page", publisher: "DC Department of Energy & Environment",
    title: "Skip the Bag, Save the River", url: guidanceUrl, retrievedAt: REVIEWED_AT,
    isDemo: false, contentRole: "explanatory-summary", note: "Agency guidance on covered businesses, exemptions and the start of fee collection." },
];
export const LIVE_POLICIES: Policy[] = [{
  id: "dc-carryout-bag-fee", title: "District of Columbia Carryout Bag Fee", shortTitle: "DC bag fee",
  category: "bags", status: "in-effect", jurisdictionId: "washington-dc",
  summary: "Covered DC businesses charge five cents per disposable carryout bag. Bringing your own bag avoids this fee.",
  whatChanges: ["The statutory charge is $0.05 for each covered bag.", "The receipt must show bag quantities and the total fee.", "Retailers retain a portion; the balance goes to the Anacostia River Cleanup and Protection Fund."],
  whoIsAffected: ["Customers shopping at covered businesses in the District, including businesses selling food or alcohol."],
  whatYouCanDo: ["Bring a reusable bag on shopping trips.", "Check bag quantities on your receipt.", "Read DOEE guidance for the complete list of exemptions."],
  uncertainties: ["This curated record was reviewed on September 16, 2026; it does not update automatically.", "Only count shopping trips and bags subject to the fee. Exempt bags and shopping outside DC are excluded.", "Household habits and reusable-bag purchase costs are user assumptions. Optional store credits and other store charges are not modelled."],
  keyDates: [{ label: "Fee collection began", date: "2010-01-01", kind: "effective" }],
  sourceIds: ["dc-bag-law", "dc-bag-guidance"], scenario: "bag-fee",
  policyParameters: { scenario: "bag-fee", currency: "USD", feePerBag: 0.05,
    appliesTo: "covered disposable paper and plastic carryout bags at DC businesses selling food or alcohol",
    exemptions: ["Certain bags for bulk food, prescriptions and contamination protection", "Paper bags at food-serving businesses with on-site dining", "See DOEE guidance for all exemptions"],
    revenueUse: "Retailer retention plus the Anacostia River Cleanup and Protection Fund" },
  tags: ["Washington DC", "bags", "checkout"], isDemo: false, sourceUrl: lawUrl, retrievedAt: REVIEWED_AT,
  provenanceLabel: "Curated from DC Council and DOEE sources · reviewed September 16, 2026 · not an automatic feed",
}];
