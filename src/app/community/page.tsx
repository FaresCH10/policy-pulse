import { getAppConfig } from "@/lib/config";
import type { Metadata } from "next";
import { getPolicies } from "@/lib/data";
import { SEED_STORIES } from "@/lib/data/community";
import { CommunityWorkspace } from "@/components/community/community-workspace";

export const metadata: Metadata = {
  title: "Community",
  description:
    "See how the same policy lands differently for different household circumstances, and add your own perspective. Your notes remain private on this device.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ policy?: string }>;
}) {
  const [policies, params] = await Promise.all([getPolicies(), searchParams]);

  return (
    <CommunityWorkspace
      policies={policies}
      seedStories={getAppConfig().mode === "demo" ? SEED_STORIES : []}
      initialPolicyId={params.policy}
    />
  );
}
