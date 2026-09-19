import { NextResponse } from "next/server";
import { getPolicyProvider } from "@/lib/policy-provider";
import { getAppConfig } from "@/lib/config";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    // Report the configured mode, which is the server-owned source of truth, not
    // a value re-derived from whichever provider happens to be wired up.
    const mode = getAppConfig().mode;
    const provider = getPolicyProvider();
    const policies = await provider.listPolicies();
    return NextResponse.json({ status: "ok", mode, provider: provider.id, policyCount: policies.length }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
