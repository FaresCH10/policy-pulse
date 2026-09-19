import { getLiveActions, getOfficialLinks } from "@/lib/live-actions";
import { getAppConfig } from "@/lib/config";
import type { Metadata } from "next";
import { getPolicies } from "@/lib/data";
import { ACTION_ITEMS, OFFICIAL_CONTACTS } from "@/lib/data/actions";
import { ActionCenter } from "@/components/actions/action-center";

export const metadata: Metadata = {
  title: "Action Center",
  description:
    "Preparation checklists, questions to ask local officials, getting-started guides, and a comment draft you copy yourself.",
};

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ policy?: string }>;
}) {
  const [policies, params] = await Promise.all([getPolicies(), searchParams]);

  return (
    <ActionCenter
      policies={policies}
      actionItems={getAppConfig().mode === "demo" ? ACTION_ITEMS : getLiveActions(policies)}
      contacts={getAppConfig().mode === "demo" ? OFFICIAL_CONTACTS : getOfficialLinks(policies)}
      initialPolicyId={params.policy}
    />
  );
}
