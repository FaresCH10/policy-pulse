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

/* -------------------------------------------------------------------------- */
/* Optional HTTP provider (not enabled by default)                             */
/* -------------------------------------------------------------------------- */

/**
 * Ready-made adapter for a future official policy feed.
 *
 * It is intentionally *not* wired up unless `POLICY_FEED_URL` is set, and it
 * never runs in the browser — the keyless demo must work with no network at
 * all. Validation lives in `validation.ts` so a malformed feed fails loudly
 * instead of rendering half-empty cards.
 *
 * Usage (server-side only):
 *
 *   const provider = createHttpPolicyProvider({
 *     url: process.env.POLICY_FEED_URL!,
 *     jurisdictionId: "some-real-city",
 *   });
 */
export interface HttpPolicyProviderOptions {
  url: string;
  jurisdictionId: string;
  /** Milliseconds before the fetch is abandoned. */
  timeoutMs?: number;
  headers?: Record<string, string>;
}

export function createHttpPolicyProvider(
  options: HttpPolicyProviderOptions,
): PolicyProvider {
  const { url, jurisdictionId, timeoutMs = 8000, headers } = options;

  async function fetchJson(): Promise<{
    jurisdictions: Jurisdiction[];
    policies: Policy[];
    sources: Source[];
  }> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "application/json", ...headers },
        next: { revalidate: 3600 },
      });
      if (!response.ok) {
        throw new Error(`Policy feed responded ${response.status}`);
      }
      const raw = (await response.json()) as unknown;
      // Validation is applied by the caller so this module stays dependency-free
      // of zod for the demo path.
      return raw as { jurisdictions: Jurisdiction[]; policies: Policy[]; sources: Source[] };
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    id: "http-feed",
    capabilities: {
      supportsLocationLookup: true,
      dataStatusLabel: `Verified policy feed (${new URL(url).host})`,
      isDemo: false,
    },
    async listJurisdictions() {
      return (await fetchJson()).jurisdictions;
    },
    async getJurisdiction(id) {
      return (await fetchJson()).jurisdictions.find((j) => j.id === id) ?? null;
    },
    async listPolicies(query) {
      const data = await fetchJson();
      return filterPolicies(
        data.policies.filter((p) => p.jurisdictionId === jurisdictionId),
        query,
      );
    },
    async getPolicy(id) {
      const data = await fetchJson();
      return data.policies.find((p) => p.id === id) ?? null;
    },
    async listSources() {
      return (await fetchJson()).sources;
    },
    async getSources(ids) {
      const data = await fetchJson();
      return ids
        .map((id) => data.sources.find((s) => s.id === id))
        .filter((s): s is Source => Boolean(s));
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Provider selection                                                          */
/* -------------------------------------------------------------------------- */

let cached: PolicyProvider | null = null;

/**
 * Returns the active provider.
 *
 * The HTTP provider is only used when both `POLICY_FEED_URL` and
 * `POLICY_FEED_JURISDICTION_ID` are configured; otherwise the bundled demo
 * provider is used. This keeps the credential-free demo path the default and
 * makes a real integration a configuration change rather than a code change.
 */
export function getPolicyProvider(): PolicyProvider {
  if (cached) return cached;

  const feedUrl = process.env.POLICY_FEED_URL;
  const feedJurisdiction = process.env.POLICY_FEED_JURISDICTION_ID;

  if (feedUrl && feedJurisdiction && typeof window === "undefined") {
    try {
      cached = createHttpPolicyProvider({
        url: feedUrl,
        jurisdictionId: feedJurisdiction,
      });
      return cached;
    } catch {
      // Misconfigured feed → fall back to demo rather than breaking the app.
      cached = new DemoPolicyProvider();
      return cached;
    }
  }

  cached = new DemoPolicyProvider();
  return cached;
}
