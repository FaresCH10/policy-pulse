import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getJurisdiction, getPolicies, getPolicy, getSourcesForPolicy } from "@/lib/data";
import { ImpactSummary } from "@/components/simulator/impact-summary";
import { EmptyState } from "@/components/ui/misc";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Printable impact summary",
  description:
    "A printable summary of your household's estimated impact, including the formulas and assumptions used.",
};

export default async function ImpactSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ policy?: string }>;
}) {
  const params = await searchParams;
  const policies = await getPolicies();

  if (policies.length === 0) {
    return (
      <EmptyState
        title="Nothing to summarise"
        description="No policies are available for this location, so there is no impact to print."
        action={
          <Link href="/policies" className="pp-link text-sm">
            Back to the Policy Explorer
          </Link>
        }
      />
    );
  }

  const policyId = params.policy ?? policies[0].id;
  const policy = await getPolicy(policyId);

  if (!policy) {
    // An unknown id is a broken link, not an empty state — surface it as such.
    notFound();
  }

  const [jurisdiction, sources] = await Promise.all([
    getJurisdiction(policy.jurisdictionId),
    getSourcesForPolicy(policy),
  ]);

  return (
    <div className="space-y-4">
      <div className="pp-no-print flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="pp-eyebrow">Printable summary</p>
          <h1 className="pp-display text-2xl font-semibold text-ink">
            Your household impact summary
          </h1>
        </div>
        <LinkButton href="/simulator" variant="ghost" size="sm">
          Change the inputs
        </LinkButton>
      </div>

      <ImpactSummary policy={policy} jurisdiction={jurisdiction} sources={sources} />
    </div>
  );
}
