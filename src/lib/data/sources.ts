import type { Source } from "../types";

/**
 * Sources.
 *
 * Every record here is `kind: "illustrative"` with `isDemo: true` and **no URL**,
 * because none of these documents exist. The `contentRole` field is the
 * mechanism the UI uses to distinguish binding legal text from an explanatory
 * summary — when a real source is added later it carries `official-document`
 * plus a `url`, `publishedAt` and `retrievedAt`.
 *
 * To add a real source, copy the commented template at the bottom of this file.
 */
export const SOURCES: Source[] = [
  {
    id: "src-bag-fee",
    kind: "illustrative",
    publisher: "City of Cedar Hollow Department of Public Works (fictional)",
    title: "Single-Use Carryout Bag Fee — illustrative policy text",
    publishedAt: "2025-11-18",
    isDemo: true,
    contentRole: "illustrative",
    note: "Written for this demonstration. There is no such ordinance, and this text carries no legal weight.",
  },
  {
    id: "src-bag-expansion",
    kind: "illustrative",
    publisher: "City of Cedar Hollow Department of Public Works (fictional)",
    title: "Small-Retailer Bag Charge Expansion — illustrative proposal",
    publishedAt: "2026-08-04",
    isDemo: true,
    contentRole: "illustrative",
    note: "A fictional draft proposal. Not open for comment anywhere, and the comment deadline shown is invented.",
  },
  {
    id: "src-compost-program",
    kind: "illustrative",
    publisher: "City of Cedar Hollow Department of Public Works (fictional)",
    title: "Household Organics Collection Programme — illustrative policy text",
    publishedAt: "2026-05-12",
    isDemo: true,
    contentRole: "illustrative",
    note: "Written for this demonstration. The programme, its eligible-material list and its dates are fictional.",
  },
  {
    id: "src-compost-rebate",
    kind: "illustrative",
    publisher: "Meadow County Waste Authority (fictional)",
    title: "Backyard Composter Rebate — illustrative programme terms",
    publishedAt: "2026-04-02",
    isDemo: true,
    contentRole: "illustrative",
    note: "A fictional county rebate. The amount, eligibility rules and deadlines are invented for the demo.",
  },
  {
    id: "src-recycling-incentive",
    kind: "illustrative",
    publisher: "City of Cedar Hollow Department of Public Works (fictional)",
    title: "Recycling Incentive Programme — illustrative draft",
    publishedAt: "2026-07-21",
    isDemo: true,
    contentRole: "illustrative",
    note: "A fictional draft. The reward rate, cap and contamination rule are invented and would need verification before anyone relied on them.",
  },
  {
    id: "src-methodology",
    kind: "illustrative",
    publisher: "PolicyPulse (demonstration)",
    title: "Demonstration assumptions and formula notes",
    isDemo: true,
    contentRole: "explanatory-summary",
    note: "PolicyPulse's own note describing which numbers are assumptions rather than policy text. It is not a source of law.",
  },
];

/**
 * Template for adding a verified source later:
 *
 * {
 *   id: "src-real-ordinance-2024",
 *   kind: "official-document",
 *   publisher: "City of <name>",
 *   title: "<exact document title>",
 *   url: "https://<official-domain>/<path>",   // required
 *   publishedAt: "2024-06-01",
 *   retrievedAt: "2026-09-15",                 // required: the day it was checked
 *   isDemo: false,
 *   contentRole: "legal-text",                 // binding requirement, not a summary
 *   note: "Adopted ordinance text. PolicyPulse's plain-language summary is explanatory only.",
 * }
 */

export function getSourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}

export function getSourcesByIds(ids: string[]): Source[] {
  return ids
    .map((id) => getSourceById(id))
    .filter((s): s is Source => Boolean(s));
}
