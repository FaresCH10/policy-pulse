import type {
  Jurisdiction,
  Policy,
  PolicyProvider,
  PolicyProviderCapabilities,
  PolicyQuery,
  Source,
} from "./types";
import { JURISDICTIONS } from "./data/jurisdictions";
import { POLICIES } from "./data/policies";
import { SOURCES } from "./data/sources";
import { cache } from "react";
import { getAppConfig } from "./config";
import { policyFeedSchema } from "./feed-schema";
import { LIVE_JURISDICTIONS, LIVE_POLICIES, LIVE_SOURCES } from "./data/live";

/* -------------------------------------------------------------------------- */
/* Demo provider                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The provider that ships with this build.
 *
 * It reads the bundled seed records and returns them asynchronously so that the
 * UI's loading states are exercised for real. Swapping in an HTTP provider
 * changes nothing above this line.
 */
export class DemoPolicyProvider implements PolicyProvider {
  readonly id = "demo-seed";

  readonly capabilities: PolicyProviderCapabilities = {
    supportsLocationLookup: false,
    dataStatusLabel: "Illustrative demo data (no live source connected)",
    isDemo: true,
  };

  async listJurisdictions(): Promise<Jurisdiction[]> {
    return JURISDICTIONS;
  }

  async getJurisdiction(id: string): Promise<Jurisdiction | null> {
    return JURISDICTIONS.find((j) => j.id === id) ?? null;
  }

  async listPolicies(query?: PolicyQuery): Promise<Policy[]> {
    return filterPolicies(POLICIES, query);
  }

  async getPolicy(id: string): Promise<Policy | null> {
    return POLICIES.find((p) => p.id === id) ?? null;
  }

  async listSources(): Promise<Source[]> {
    return SOURCES;
  }

  async getSources(ids: string[]): Promise<Source[]> {
    return ids
      .map((id) => SOURCES.find((s) => s.id === id))
      .filter((s): s is Source => Boolean(s));
  }
}

/* -------------------------------------------------------------------------- */
/* Filtering — shared by every provider                                        */
/* -------------------------------------------------------------------------- */

export function filterPolicies(policies: Policy[], query?: PolicyQuery): Policy[] {
  if (!query) return [...policies];

  const text = query.text?.trim().toLowerCase() ?? "";

  return policies.filter((policy) => {
    if (query.status?.length && !query.status.includes(policy.status)) return false;
    if (query.category?.length && !query.category.includes(policy.category)) return false;
    if (query.jurisdictionId && policy.jurisdictionId !== query.jurisdictionId) {
      return false;
    }
    if (text) {
      const haystack = [
        policy.title,
        policy.shortTitle,
        policy.summary,
        policy.tags.join(" "),
        policy.whatChanges.join(" "),
        policy.whoIsAffected.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(text)) return false;
    }
    return true;
  });
}


export interface HttpPolicyProviderOptions {
  url: string;
  jurisdictionId: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export function createHttpPolicyProvider(options: HttpPolicyProviderOptions): PolicyProvider {
  const fetchJson = cache(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
    try {
      const response = await fetch(options.url, {
        signal: controller.signal, redirect: "error",
        headers: { accept: "application/json", ...options.headers },
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Policy feed is unavailable");
      const maxBytes = 5 * 1024 * 1024;
      if (Number(response.headers.get("content-length")) > maxBytes) throw new Error("Policy feed is too large");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Policy feed is empty");
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) { await reader.cancel(); throw new Error("Policy feed is too large"); }
        chunks.push(value);
      }
      const feed = policyFeedSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      if (!feed.jurisdictions.some(j => j.id === options.jurisdictionId)) throw new Error("Configured jurisdiction missing from feed");
      return { ...feed, jurisdictions: feed.jurisdictions.filter(j => j.id === options.jurisdictionId), policies: feed.policies.filter(p => p.jurisdictionId === options.jurisdictionId) };
    } finally { clearTimeout(timer); }
  });
  return datasetProvider("http-feed", "External policy feed · see source review dates", fetchJson);
}

type Dataset = { jurisdictions: Jurisdiction[]; policies: Policy[]; sources: Source[] };
function datasetProvider(id: string, label: string, load: () => Promise<Dataset>): PolicyProvider {
  return {
    id, capabilities: { supportsLocationLookup: true, dataStatusLabel: label, isDemo: false },
    async listJurisdictions() { return (await load()).jurisdictions; },
    async getJurisdiction(id) { return (await load()).jurisdictions.find(j => j.id === id) ?? null; },
    async listPolicies(query) { return filterPolicies((await load()).policies, query); },
    async getPolicy(id) { return (await load()).policies.find(p => p.id === id) ?? null; },
    async listSources() { return (await load()).sources; },
    async getSources(ids) { return (await load()).sources.filter(s => ids.includes(s.id)); },
  };
}

export const getPolicyProvider = cache((): PolicyProvider => {
  const config = getAppConfig();
  if (config.mode === "demo") return new DemoPolicyProvider();
  if (config.feedUrl && config.jurisdictionId) return createHttpPolicyProvider({ url: config.feedUrl, jurisdictionId: config.jurisdictionId });
  return datasetProvider("curated-dc", "Official DC sources · manually reviewed September 16, 2026 · not automatically updated", async () =>
    policyFeedSchema.parse({ jurisdictions: LIVE_JURISDICTIONS, policies: LIVE_POLICIES, sources: LIVE_SOURCES }));
});
