# PolicyPulse

Understand environmental policy, estimate household costs, and plan practical next steps.

## Run locally

Use Node 22 (see `.nvmrc`).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell use `Copy-Item .env.example .env.local`. Open http://localhost:3000.

## Demo / live switch

Set **one server environment variable**, then restart or redeploy:

```dotenv
APP_MODE=demo
```

- `demo` (default): fictional Cedar Hollow policies, all three simulator scenarios, example stories and contacts. Clearly marked throughout.
- `live`: a bundled, source-linked **Washington, DC carryout bag fee** record. No API keys or accounts required. This is a curated snapshot reviewed September 16, 2026, **not an automatically updating government feed**. Only this policy is covered; no wider coverage is implied.
- Any other value fails configuration validation. Demo and live household data are stored separately in the browser.

Live sources:

- [DC Council: D.C. Code § 8–102.03](https://code.dccouncil.gov/us/dc/council/code/sections/8-102.03)
- [DC Department of Energy & Environment: bag-law guidance](https://doee.dc.gov/node/21442)

The statutory fee is $0.05 per covered bag. Applicability follows the shopping location and exemptions, not simply a household's home address. The UI links the original sources, records review dates, and keeps household assumptions separate from policy parameters. The application is explanatory, not legal advice.

## Deploy on Netlify

1. Push this repository to your Git provider and import it in Netlify.
2. `netlify.toml` supplies the build command (`npm run check && npm run build`), publish directory (`.next`), Node 22 and skew protection. Let Netlify detect Next.js and manage its current OpenNext adapter. Do not use static export or an SPA redirect.
3. Set `APP_MODE=live` in Netlify's **production** environment, available to **Builds and Functions**. Leave it unset for demo. Redeploy after changing configuration. Deploy previews and branch deploys are explicitly demo in `netlify.toml`.
4. After deployment, visit `/api/health`. Expect HTTP 200, `status: "ok"`, `mode: "live"`, `provider: "curated-dc"`, and `policyCount: 1` for the built-in live dataset.
5. Check location selection, policy detail, simulator, checklist persistence and print summary on the deployed domain. Enable HTTPS on any custom domain.

[Netlify's Next.js deployment documentation](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/) describes the adapter and supported server features.

The app has been prepared for deployment; this repository does not provision a Netlify account or publish a site automatically.

## Optional external live feed

A government HTML page is a source, not an app-compatible JSON feed. The bundled DC record removes the need to operate a feed. If you later have a maintained provider, set both:

```dotenv
APP_MODE=live
POLICY_FEED_URL=https://your-provider.example/policies.json
POLICY_FEED_JURISDICTION_ID=your-jurisdiction-id
```

Response shape: `{ "jurisdictions": [...], "policies": [...], "sources": [...] }`.

The complete contract is in `src/lib/feed-schema.ts`; `src/lib/data/live.ts` is a working example of the record shapes. Requirements include:

- Real records only (`isDemo: false`), valid review dates and HTTPS source links.
- Unique URL-safe IDs, valid jurisdiction/source references, complete scenario parameters, and matching category/scenario.
- USD currency only. The current UI does not support currency conversion or other currencies.
- The configured jurisdiction must exist. Lists and direct policy URLs are scoped to it.
- Maximum 5 MiB response, eight-second timeout, no redirects. Feed content is validated before rendering. No cross-request cache: a request-scoped React cache deduplicates related reads.

Invalid/unreachable feeds show a retryable error and return HTTP 503 from `/api/health`. **Live mode never falls back to demo records.** New policy slugs resolve without rebuilding. Source freshness and factual accuracy still require editorial review; schema validation cannot verify legal facts.

## Product scope and privacy

- Overview, policy explorer, policy detail, three pure calculation models, printable impact summaries, preparation checklists, and private household notes.
- Live coverage initially includes only the DC bag fee. Composting and recycling models remain available in demo mode and can accept fully sourced feed records later.
- Household profiles, bookmarks, assumptions, checklist ticks and notes stay in localStorage on the current browser. There are no accounts, uploads, analytics or public community publishing. Device-local data is not a backup and does not sync across devices.
- The Data & privacy panel resets settings or removes this mode's stored data. Restricted storage is handled without crashing.
- Community comparisons are hypothetical household inputs; they are not survey results. Notes are private. A public community would require a separate backend, consent and moderation.
- The unused unauthenticated AI proxy has been retired (`POST /api/ai-summary` returns 410). There is no paid API dependency or public endpoint that can spend an API key.
- Pages are no-index by default because coverage is intentionally limited and many routes contain personalised estimates.

## Validation

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run verify
npm audit
```

Tests cover simulation boundaries, live configuration, strict feed validation, jurisdiction isolation, failure without demo fallback, blocked/corrupt storage, and storage mode separation. CI runs the checks and production builds for both modes. The Netlify build uses the same quality gate.

## Maintenance

Review official sources regularly and whenever a relevant policy changes. Update the record and its review date together; never bump a date without checking the source. Keep dependency security patches and the lockfile current. Monitor `/api/health` and Netlify function errors. Test both modes after provider or storage changes.

Implementation entry points:

- `src/lib/config.ts`: environment configuration
- `src/lib/policy-provider.ts`: demo, curated and HTTP providers
- `src/lib/feed-schema.ts`: external data validation
- `src/lib/data/live.ts`: curated source-linked policy data
- `src/lib/simulation/`: pure formulas and boundary tests
- `src/lib/storage.ts`, `src/state/app-store.tsx`: defensive local persistence
- `netlify.toml`: hosting configuration

`DEMO_SCRIPT.md` and `IMPLEMENTATION_SUMMARY.md` describe the original hackathon demo and are historical references. This README and `PRODUCTION_READINESS.md` describe the current deployment.
