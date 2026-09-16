import {
  getJurisdictionMap,
  getPolicies,
  getUpcomingDates,
} from "@/lib/data";
import { getPolicyProvider } from "@/lib/policy-provider";
import { OverviewWorkspace } from "@/components/overview/overview-workspace";

/**
 * Overview — the personalised dashboard.
 *
 * Data is fetched on the server and passed to the client workspace as plain
 * props, so no seed data or provider code ends up in the interaction layer.
 */
export default async function OverviewPage() {
  const [policies] = await Promise.all([getPolicies()]);
  const jurisdictions = getJurisdictionMap();
  const provider = getPolicyProvider();

  // Computed on the server so the first paint has real content; the client
  // re-filters against its own clock after hydration.
  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = getUpcomingDates(policies, new Date(), 6);

  return (
    <OverviewWorkspace
      policies={policies}
      jurisdictions={jurisdictions}
      upcoming={upcoming}
      todayIso={todayIso}
      providerId={provider.id}
      providerLabel={provider.capabilities.dataStatusLabel}
      isDemoProvider={provider.capabilities.isDemo}
    />
  );
}
