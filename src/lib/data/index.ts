import type { Jurisdiction, Policy, PolicyQuery, Source } from "../types";
import { getPolicyProvider } from "../policy-provider";
import { sortPolicies } from "../policy-utils";

/**
 * Typed data-access facade.
 *
 * Server components call these async helpers; client components receive plain
 * props. Nothing in the UI reaches into `data/` directly, which is what makes
 * the policy provider swappable.
 */

export async function getPolicies(query?: PolicyQuery): Promise<Policy[]> {
  const provider = getPolicyProvider();
  return sortPolicies(await provider.listPolicies(query));
}

export async function getPolicy(id: string): Promise<Policy | null> {
  return getPolicyProvider().getPolicy(id);
}

export async function getJurisdictions(): Promise<Jurisdiction[]> {
  return getPolicyProvider().listJurisdictions();
}

export async function getJurisdiction(id: string): Promise<Jurisdiction | null> {
  return getPolicyProvider().getJurisdiction(id);
}

export async function getJurisdictionMap(): Promise<Record<string, Jurisdiction>> {
  return Object.fromEntries((await getJurisdictions()).map(j => [j.id, j]));
}

export async function getSourcesForPolicy(policy: Policy): Promise<Source[]> {
  return getPolicyProvider().getSources(policy.sourceIds);
}

export async function getAllSources(): Promise<Source[]> {
  return getPolicyProvider().listSources();
}

/* -------------------------------------------------------------------------- */
/* Re-exports so callers have a single import for data + derived views         */
/* -------------------------------------------------------------------------- */

export {
  getPolicyFacets,
  getUpcomingDates,
  isUpcoming,
  primaryDate,
  sortPolicies,
  type PolicyFacets,
  type UpcomingDate,
} from "../policy-utils";

export { POLICY_LABELS } from "../labels";
