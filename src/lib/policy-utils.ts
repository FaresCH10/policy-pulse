import type { Policy, PolicyDate } from "./types";
import { CATEGORY_LABELS, STATUS_LABELS } from "./labels";

/**
 * Pure policy helpers — ordering, dates and facets.
 *
 * Deliberately free of any data-access imports so client components can use
 * them without pulling the seed data or the provider into the browser bundle.
 */

const STATUS_ORDER: Record<Policy["status"], number> = {
  "in-effect": 0,
  adopted: 1,
  proposed: 2,
};

/** Most-binding first, then most recent. Stable, so the list never reshuffles. */
export function sortPolicies(policies: Policy[]): Policy[] {
  return [...policies].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    const aDate = primaryDate(a)?.date ?? "9999-99-99";
    const bDate = primaryDate(b)?.date ?? "9999-99-99";
    if (aDate !== bDate) return aDate < bDate ? 1 : -1;
    return a.title.localeCompare(b.title);
  });
}

/** The date that best represents a policy: effective > decision > enrolment > … */
export function primaryDate(policy: Policy): PolicyDate | null {
  const preferred: PolicyDate["kind"][] = [
    "effective",
    "decision",
    "enrollment",
    "comment",
    "review",
  ];
  for (const kind of preferred) {
    const match = policy.keyDates.find((d) => d.kind === kind);
    if (match) return match;
  }
  return policy.keyDates[0] ?? null;
}

export interface UpcomingDate {
  policyId: string;
  policyTitle: string;
  status: Policy["status"];
  label: string;
  date: string;
  kind: PolicyDate["kind"];
  note?: string;
  isDemo: boolean;
}

/**
 * Upcoming dates across the given policies, soonest first.
 *
 * Past dates are filtered out against a UTC "today" so the dashboard can never
 * show a stale countdown, and so the server and client agree on the boundary.
 */
export function getUpcomingDates(
  policies: Policy[],
  from: Date = new Date(),
  limit = 6,
): UpcomingDate[] {
  const today = from.toISOString().slice(0, 10);
  const all: UpcomingDate[] = [];

  for (const policy of policies) {
    for (const date of policy.keyDates) {
      if (date.date < today) continue;
      all.push({
        policyId: policy.id,
        policyTitle: policy.shortTitle,
        status: policy.status,
        label: date.label,
        date: date.date,
        kind: date.kind,
        note: date.note,
        isDemo: policy.isDemo,
      });
    }
  }

  return all
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(0, limit);
}

export interface PolicyFacets {
  statuses: { value: Policy["status"]; label: string; count: number }[];
  categories: { value: Policy["category"]; label: string; count: number }[];
}

export function getPolicyFacets(policies: Policy[]): PolicyFacets {
  const statuses = (["in-effect", "adopted", "proposed"] as const).map((value) => ({
    value,
    label: STATUS_LABELS[value],
    count: policies.filter((p) => p.status === value).length,
  }));

  const categories = (["bags", "organics", "recycling"] as const).map((value) => ({
    value,
    label: CATEGORY_LABELS[value],
    count: policies.filter((p) => p.category === value).length,
  }));

  return { statuses, categories };
}

/** True when a policy has at least one date still ahead of `from`. */
export function isUpcoming(policy: Policy, from: Date = new Date()): boolean {
  const today = from.toISOString().slice(0, 10);
  return policy.keyDates.some((d) => d.date >= today);
}
