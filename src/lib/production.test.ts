import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppConfig } from "./config";
import { policyFeedSchema } from "./feed-schema";
import { LIVE_JURISDICTIONS, LIVE_POLICIES, LIVE_SOURCES } from "./data/live";
import { createHttpPolicyProvider, getPolicyProvider } from "./policy-provider";
import { createInitialUserData, normaliseUserData, readUserData, writeUserData } from "./storage";
import { POLICIES } from "./data/policies";
import { runSimulation } from "./simulation";
import { formatCurrency } from "./format";

const feed = () => structuredClone({ jurisdictions: LIVE_JURISDICTIONS, policies: LIVE_POLICIES, sources: LIVE_SOURCES });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it.each(["bag-fee", "composting"])("%s formula trace agrees with the first-year cost headline", scenario => {
  const data = createInitialUserData();
  data.assumptions["bag-fee"].includeReusableBagPurchaseCost = true;
  data.assumptions.composting.includeBinCost = true;
  const policy = POLICIES.find(p => p.scenario === scenario)!;
  const result = runSimulation(policy, data.profile, data.assumptions);
  expect(result.steps.find(s => s.id === "one-time")?.result).toBe(formatCurrency(result.netFirstYear));
});

describe("production configuration", () => {
  it("defaults to demo and rejects typos and partial live configuration", () => {
    expect(getAppConfig({}).mode).toBe("demo");
    expect(() => getAppConfig({ APP_MODE: "production" })).toThrow();
    expect(() => getAppConfig({ APP_MODE: "live", POLICY_FEED_URL: "https://example.org/feed" })).toThrow();
    expect(() => getAppConfig({ APP_MODE: "live", POLICY_FEED_URL: "http://example.org/feed", POLICY_FEED_JURISDICTION_ID: "dc" })).toThrow();
  });
  it("live mode works without credentials and never returns fictional policies", async () => {
    vi.stubEnv("APP_MODE", "live");
    vi.stubEnv("POLICY_FEED_URL", ""); vi.stubEnv("POLICY_FEED_JURISDICTION_ID", "");
    const provider = getPolicyProvider();
    expect(provider.id).toBe("curated-dc");
    expect((await provider.listPolicies()).every(p => !p.isDemo)).toBe(true);
    expect(await provider.getPolicy("single-use-bag-fee")).toBeNull();
  });
});
describe("live feed integrity", () => {
  it("accepts the sourced dataset", () => expect(policyFeedSchema.safeParse(feed()).success).toBe(true));
  it.each(["demo", "unsafe-url", "missing-source", "duplicate", "scenario", "invalid-date", "invalid-fee"])("rejects %s", kind => {
    const data = feed();
    if (kind === "demo") data.policies[0].isDemo = true;
    if (kind === "unsafe-url") data.sources[0].url = "javascript:alert(1)";
    if (kind === "missing-source") data.sources = [];
    if (kind === "duplicate") data.policies.push(data.policies[0]);
    if (kind === "scenario") data.policies[0].scenario = "composting";
    if (kind === "invalid-date") data.policies[0].keyDates[0].date = "2026-02-31";
    if (kind === "invalid-fee" && data.policies[0].policyParameters.scenario === "bag-fee") data.policies[0].policyParameters.feePerBag = -1;
    expect(policyFeedSchema.safeParse(data).success).toBe(false);
  });
  it("scopes detail lookup to the configured jurisdiction", async () => {
    const data = feed();
    data.jurisdictions.push({ ...data.jurisdictions[0], id: "elsewhere" });
    data.policies.push({ ...data.policies[0], id: "outside", jurisdictionId: "elsewhere" });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(data)));
    const provider = createHttpPolicyProvider({ url: "https://example.org/feed", jurisdictionId: "washington-dc" });
    expect(await provider.getPolicy("outside")).toBeNull();
    expect(await provider.listPolicies()).toHaveLength(1);
  });
  it("does not substitute demo data when the feed fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("Unavailable", { status: 503 })));
    const provider = createHttpPolicyProvider({ url: "https://example.org/feed", jurisdictionId: "washington-dc" });
    await expect(provider.listPolicies()).rejects.toThrow();
  });
  it("rejects a configured jurisdiction absent from the feed", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(feed())));
    await expect(createHttpPolicyProvider({ url: "https://example.org/feed", jurisdictionId: "absent" }).listPolicies()).rejects.toThrow();
  });
});
describe("defensive local storage", () => {
  it("survives blocked localStorage access", () => {
    vi.stubGlobal("window", Object.defineProperty({}, "localStorage", { get() { throw new DOMException("Blocked", "SecurityError"); } }));
    expect(readUserData()).toBeNull();
    expect(writeUserData(createInitialUserData())).toEqual({ ok: false, reason: "unavailable" });
  });
  it("drops corrupt stories, locations and assumptions", () => {
    const result = normaliseUserData({ stories: [{ id: "broken" }], location: { status: "live" }, assumptions: { "bag-fee": { reusableBagAdoptionRate: "broken" } } });
    expect(result.stories).toEqual([]);
    expect(result.location.status).toBe("unset");
    expect(typeof result.assumptions["bag-fee"].reusableBagAdoptionRate).toBe("number");
  });
  it("isolates storage across modes", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { setItem: (k: string, v: string) => values.set(k, v), getItem: (k: string) => values.get(k) ?? null } });
    writeUserData({ ...createInitialUserData(), bookmarks: ["demo-policy"] }, "demo");
    expect(readUserData("live")).toBeNull();
    expect(readUserData("demo")?.bookmarks).toEqual(["demo-policy"]);
  });
});
