import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getJurisdiction,
  getPolicies,
  getPolicy,
  getSourcesForPolicy,
} from "@/lib/data";
import { SEED_STORIES } from "@/lib/data/community";
import { OFFICIAL_CONTACTS } from "@/lib/data/actions";
import { PolicyDetail } from "@/components/policy/policy-detail";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Every policy is enumerated by `generateStaticParams`, so a slug that is not in
 * that list is a genuine 404 rather than a dynamically rendered miss — and the
 * status code is correct even though this route streams (a `notFound()` thrown
 * after the shell has been flushed cannot change the status).
 *
 * A deployment backed by a live policy feed would set this to `true` so newly
 * published policies resolve without a rebuild. See the README.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const policies = await getPolicies();
  return policies.map((policy) => ({ slug: policy.id }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (!policy) return { title: "Policy not found" };
  return {
    title: policy.title,
    description: `${policy.summary} (Illustrative demonstration policy.)`,
  };
}

export default async function PolicyDetailPage({ params }: RouteParams) {
  const { slug } = await params;
  const policy = await getPolicy(slug);

  if (!policy) {
    notFound();
  }

  const [jurisdiction, sources] = await Promise.all([
    getJurisdiction(policy.jurisdictionId),
    getSourcesForPolicy(policy),
  ]);

  const stories = SEED_STORIES.filter((story) => story.policyId === policy.id);
  const contacts = OFFICIAL_CONTACTS.filter(
    (contact) => contact.policyId === policy.id || contact.policyId === "all",
  );

  return (
    <PolicyDetail
      policy={policy}
      jurisdiction={jurisdiction}
      sources={sources}
      stories={stories}
      contacts={contacts}
    />
  );
}
