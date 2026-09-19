import { NextResponse } from "next/server";
import { getPolicyProvider } from "@/lib/policy-provider";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const provider = getPolicyProvider();
    const policies = await provider.listPolicies();
    return NextResponse.json({ status: "ok", mode: provider.capabilities.isDemo ? "demo" : "live", provider: provider.id, policyCount: policies.length }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
