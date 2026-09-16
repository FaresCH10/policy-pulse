import type { Metadata } from "next";
import { getPolicies } from "@/lib/data";
import { SimulatorWorkspace } from "@/components/simulator/simulator-workspace";

export const metadata: Metadata = {
  title: "Impact Simulator",
  description:
    "Adjust household behaviour and see how a policy's cost and waste impact change, with every formula and assumption shown.",
};

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ policy?: string }>;
}) {
  const [policies, params] = await Promise.all([getPolicies(), searchParams]);

  return (
    <SimulatorWorkspace policies={policies} initialPolicyId={params.policy} />
  );
}
