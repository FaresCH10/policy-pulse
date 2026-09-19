import type { Metadata } from "next";
import { getJurisdictionMap, getPolicies } from "@/lib/data";
import { PolicyExplorer } from "@/components/policy/policy-explorer";

export const metadata: Metadata = {
  title: "Policy Explorer",
  description:
    "Browse environmental policies in the available coverage, filter by status and category, and see a personalised estimate for each one.",
};

export default async function PoliciesPage() {
  const policies = await getPolicies();

  return (
    <PolicyExplorer policies={policies} jurisdictions={await getJurisdictionMap()} />
  );
}
