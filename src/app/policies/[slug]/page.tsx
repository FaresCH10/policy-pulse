import { getOfficialLinks } from "@/lib/live-actions";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getJurisdiction,
  getPolicy,
  getSourcesForPolicy,
} from "@/lib/data";
import { SEED_STORIES } from "@/lib/data/community";
import { OFFICIAL_CONTACTS } from "@/lib/data/actions";
import { PolicyDetail } from "@/components/policy/policy-detail";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const policy = await getPolicy(slug);
  if (!policy) return { title: "Policy not found" };
  return {
    title: policy.title,
    description: policy.summary,
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

  const stories = (policy.isDemo ? SEED_STORIES : []).filter((story) => story.policyId === policy.id);
  const contacts = (policy.isDemo ? OFFICIAL_CONTACTS : getOfficialLinks([policy])).filter(
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
