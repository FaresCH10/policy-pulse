export type AppMode = "demo" | "live";

/** Server-owned switch. A typo must never silently enable fictional data. */
export function getAppConfig(env: Record<string, string | undefined> = process.env) {
  const mode = env.APP_MODE ?? "demo";
  if (mode !== "demo" && mode !== "live") throw new Error("APP_MODE must be demo or live.");
  const feedUrl = env.POLICY_FEED_URL?.trim();
  const jurisdictionId = env.POLICY_FEED_JURISDICTION_ID?.trim();
  if (mode === "live" && Boolean(feedUrl) !== Boolean(jurisdictionId)) {
    throw new Error("Set both POLICY_FEED_URL and POLICY_FEED_JURISDICTION_ID, or neither for the curated DC dataset.");
  }
  if (mode === "live" && feedUrl) {
    const url = new URL(feedUrl);
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error("POLICY_FEED_URL must be an HTTPS URL without embedded credentials.");
    }
  }
  return { mode: mode as AppMode, feedUrl, jurisdictionId };
}
