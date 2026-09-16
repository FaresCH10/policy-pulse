# PolicyPulse

**Understand how a local environmental policy could affect your household — and what you can do next.**

Built for the **Earth Forward** hackathon. PolicyPulse takes one local waste-reduction
policy, explains it in plain language, personalises it to your household, lets you
simulate your own behaviour, shows how the same policy lands differently for other
circumstances, and ends with something you can actually do.

> ### ⚠️ Demonstration build — illustrative data only
>
> Every policy, date, cost, contact, deadline and story in this app is **fictional**.
> The city ("Cedar Hollow") does not exist, the postal code `00000` is a reserved
> placeholder, and no live policy feed is connected.
>
> **Nothing here is a real legal requirement, a real deadline, or legal advice.**
> PolicyPulse never silently substitutes demo policies for a real location — entering
> a real city returns *"coverage unavailable"* and offers the demo explicitly.

---

## Contents

- [Quick start](#quick-start)
- [The two-minute demo](#the-two-minute-demo)
- [What it does](#what-it-does)
- [Architecture](#architecture)
- [The three simulation scenarios and their formulas](#the-three-simulation-scenarios-and-their-formulas)
- [Data model and provenance](#data-model-and-provenance)
- [Data limitations](#data-limitations)
- [Extension points](#extension-points)
- [Accessibility and quality](#accessibility-and-quality)
- [Verification results](#verification-results)
- [Project layout](#project-layout)

---

## Quick start

No credentials, no accounts, no external services. The core experience runs entirely
offline.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other commands:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run test         # vitest run
npm run build        # next build
npm run verify       # all four, in order
```

**Requirements:** Node 18.18+ (developed on Node 22). No environment variables are
needed — see [`.env.example`](./.env.example) for the optional ones.

---

## The two-minute demo

A judge can complete the whole journey in under two minutes:

1. **Open** `http://localhost:3000` → click **"Use the demonstration city"**.
2. **Overview** shows the household snapshot: policy count, estimated monthly cost
   change, bags avoided, food waste diverted, and upcoming dates.
3. **Policy Explorer** → open *Single-Use Carryout Bag Fee*. Read "What changes?",
   "How could this affect me?", "What can I do?", "What assumptions should I know?".
4. **Impact Simulator** (or "Simulate this" from the card). Drag **"Share of trips
   using reusable bags"** from 0% to 100% and watch the cost, bags avoided, chart,
   narrative and formula trace all move together.
5. Expand **"How this is calculated"** to see every step with your own numbers
   substituted, plus every assumption tagged as *policy*, *household*,
   *illustrative*, or *what-if*.
6. Tick the **what-if fee** box and note that the policy's own 10¢ rate is still shown
   separately — changing a what-if value never edits the policy.
7. **Community** → run the scenario comparison, then add a perspective. It is saved on
   this device only.
8. **Action Center** → tick a checklist item, then **Copy draft** on the comment
   email. Nothing is ever sent.
9. **Printable impact summary** → *Print or save as PDF*.

A longer, timed script with talking points is in [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

---

## What it does

### Five destinations

| Route | Purpose |
| --- | --- |
| `/` **Overview** | Location + data status, household snapshot, per-scenario impact, upcoming dates, household editor, data & privacy panel |
| `/policies` **Policy Explorer** | Search + filter by status and category, saved-policy filter, sortable |
| `/policies/[slug]` **Policy detail** | What changes / who is affected / how it affects you / what you can do / what is uncertain, timeline, sources, contacts |
| `/simulator` **Impact Simulator** | Policy picker, household inputs, what-if controls, live results, comparison chart, full formula trace |
| `/community` **Community** | Scenario comparison table, seeded + user perspectives, story submission |
| `/actions` **Action Center** | Checklists, questions to ask, getting-started guides, editable comment draft, contacts |
| `/impact-summary` | Print-optimised household impact summary |

### Location and household setup

The location flow is deliberately honest:

- Enter a city or ZIP → if it does not resolve, you get **"coverage unavailable"** plus
  an explicit button to explore the demonstration city instead. Demo policies are
  **never** substituted silently.
- The demo city can also be chosen directly, with one click, and stays labelled
  *demo* everywhere it appears.

Only six household details are collected, each with a stated reason:

| Field | Why it is needed |
| --- | --- |
| Household size | Scales per-person waste estimates |
| Renter / homeowner | Determines which changes you can make yourself |
| Grocery trips per week | The main driver of baseline bag count |
| Disposable bags per trip | Your baseline habit, before any change |
| Weekly food waste (lb) | Sizes the composting estimate |
| Composting available? | Whether a collection programme is even an option |

Everything can be edited or reset from the Overview or the simulator.

---

## Architecture

```
Next.js 15 (App Router) · React 19 · TypeScript (strict)
Tailwind CSS 3 · Recharts 2 · Zod 3 · Vitest 2
```

### Layer separation

The single most important design rule: **policy content, simulation formulas,
persistence, and presentation never mix.**

```
src/lib/types.ts             Pure domain types. No React, no I/O.
src/lib/data/                Seed records + typed data-access facade (server-side).
src/lib/policy-provider.ts   Replaceable PolicyProvider interface + demo and HTTP adapters.
src/lib/simulation/          Pure calculation engine. No React, no DOM, no storage.
src/lib/storage.ts           Defensive localStorage read/write + schema migration.
src/lib/validation.ts        Zod schemas for every user input and for feed validation.
src/state/app-store.tsx      React context + reducer over persisted user data.
src/components/              Presentation only. Consume props and the store.
src/app/                     Routes. Server components load data, clients interact.
```

Why it matters in practice:

- **Server components** call `getPolicies()` / `getPolicy()` and pass plain objects as
  props. Client components never import the provider or the seed data, so policy
  content stays out of the interaction bundle.
- **The simulation engine is pure.** `runSimulation(policy, profile, assumptions)` is a
  pure function. That is why the whole boundary test suite can run in Node with no
  browser, and why the Overview, the policy cards, the detail page and the simulator all
  show numbers that agree — there is exactly one implementation.

### The replaceable policy provider

```ts
interface PolicyProvider {
  readonly id: string;
  readonly capabilities: PolicyProviderCapabilities;
  listJurisdictions(): Promise<Jurisdiction[]>;
  getJurisdiction(id: string): Promise<Jurisdiction | null>;
  listPolicies(query?: PolicyQuery): Promise<Policy[]>;
  getPolicy(id: string): Promise<Policy | null>;
  listSources(): Promise<Source[]>;
  getSources(ids: string[]): Promise<Source[]>;
}
```

Two implementations ship:

| Provider | When it is used |
| --- | --- |
| `DemoPolicyProvider` | Default. Reads the bundled seed records, returns them asynchronously so loading states are exercised for real. |
| `createHttpPolicyProvider()` | Used **only** when `POLICY_FEED_URL` *and* `POLICY_FEED_JURISDICTION_ID` are set, server-side. Validates records, times out, and falls back to demo on failure. |

Swapping them is a configuration change, not a code change. No component imports either
one.

### State and persistence

`AppStoreProvider` holds location, household profile, simulator assumptions, bookmarks,
checklist ticks and user stories. It is hydration-safe by construction:

1. First render always uses deterministic defaults, so server HTML matches the client's
   first paint.
2. An effect reads `localStorage` and replaces state.
3. Persistence is gated on hydration, so defaults can never overwrite real stored data.

Storage is defensive: private browsing, disabled storage, a quota error, or a corrupted
or older payload all degrade to "start fresh" rather than throwing. Values are
range-clamped on read, and simulator settings are re-validated through Zod.

---

## The three simulation scenarios and their formulas

All formulas are implemented in `src/lib/simulation/` and printed to the user in the
simulator's **"How this is calculated"** section with their own numbers substituted.

### 1. Single-use bag fee — `bag-fee.ts`

```
monthly trips        = weekly trips × 52 ÷ 12
baseline bags        = monthly trips × bags per trip
remaining bags       = baseline bags × (1 − reusable-bag adoption rate)
baseline fee cost    = baseline bags × fee per bag
fee paid             = remaining bags × fee per bag
fees avoided         = baseline fee cost − fee paid
bags avoided         = baseline bags − remaining bags
annual values        = monthly values × 12
net first year       = annual cost change + one-time reusable bag cost
```

### 2. Household composting — `composting.ts`

```
monthly food waste   = weekly food waste × 52 ÷ 12
eligible waste       = monthly food waste × eligible share
waste diverted       = eligible waste × participation rate

(equivalently: weekly food waste × 52 ÷ 12 × participation rate × eligible share)
```

Waste stays in **pounds**. It is never converted into bin counts, bag counts, or
tonnage, because no documented conversion factor is supplied.

### 3. Recycling incentive — `recycling-incentive.ts`

```
weekly recyclables   = household size × lb per person per week
monthly recyclables  = weekly recyclables × 52 ÷ 12
collected            = monthly recyclables × capture rate
credited weight      = collected × (1 − contamination rate)
reward               = credited weight × reward per lb   (capped if the policy caps it)
```

Baseline = your recyclables at the programme's published no-incentive capture
assumption, with **no reward paid**. Simulated = your capture rate, with the reward.

### Conventions applied consistently

| Convention | Rationale |
| --- | --- |
| `annual = monthly × 12` everywhere | The two views can never disagree. Asserted by tests. |
| Negative numbers are savings | "Cost change" is always `simulated − baseline`. |
| One-time costs stay out of monthly figures | A $12 bag set is not a monthly cost. It appears in the first-year total. |
| Negative / `NaN` inputs → 0 | No formula can produce a negative fee or a `NaN`. |
| Rates clamped to `[0, 1]` | No extrapolation beyond the possible. |
| Baseline vs simulated, never "improvement %" | Percentages of a hypothetical baseline invite over-claiming. |

### What is deliberately **not** modelled

No emissions, air-quality, health, temperature, landfill-tonnage or confidence-interval
outputs exist anywhere in the codebase. Waste is reported in pounds and counts in whole
units, and the two are never converted into each other.

### Real policy rules vs hypothetical settings

Each scenario has two visually and semantically distinct control groups:

- **"What the policy actually sets"** — read-only, sourced from `policyParameters`,
  badged *From the policy*.
- **"Hypothetical changes you control"** — badged *What-if* and *Does not change the
  policy*, with the policy's real value still displayed alongside.

A what-if override is carried through the result as `usesWhatIf: true`, appears in the
assumption list tagged `what-if`, and is described in the UI as having no effect on any
real policy.

---

## Data model and provenance

Typed models live in `src/lib/types.ts`: `Jurisdiction`, `Source`, `Policy`,
`HouseholdProfile`, `SimulationAssumptions`, `SimulationResult`, `CommunityStory`,
`ActionItem`, `OfficialContact`, `UserData`.

### Provenance fields

| Field | Meaning |
| --- | --- |
| `isDemo` | `true` whenever a record is fictional. Rendered as a visible label. |
| `sourceUrl` | Only ever set for a real, checkable document. |
| `retrievedAt` | ISO date the source was retrieved. Real sources only. |
| `publishedAt` / `effectiveDate` | When the document was issued / when the rule applies. |
| `assumptions` | Every number used by a calculation, tagged `policy` \| `household` \| `illustrative` \| `what-if`. |
| `methodology` | Expressed as the ordered formula trace (`CalculationStep[]`) shown in the UI. |
| `contentRole` | `legal-text` \| `explanatory-summary` \| `illustrative` — keeps binding requirements separate from PolicyPulse's own rewording. |

### Adding a verified policy

```ts
{
  id: "src-real-ordinance-2024",
  kind: "official-document",
  publisher: "City of <name>",
  title: "<exact document title>",
  url: "https://<official-domain>/<path>",   // required
  publishedAt: "2024-06-01",
  retrievedAt: "2026-09-15",                 // required: the day it was checked
  isDemo: false,
  contentRole: "legal-text",                 // binding requirement, not a summary
  note: "Adopted ordinance text. PolicyPulse's plain-language summary is explanatory only.",
}
```

Then set `isDemo: false` on the policy and write a `provenanceLabel` naming the official
document and its retrieval date. The UI switches from the amber "illustrative" strip to
a real, linked citation with jurisdiction and retrieval date.

---

## Data limitations

Be explicit about these when presenting:

1. **All policy content is fictional.** Written for this hackathon. Not verified against
   anything.
2. **No live feed is connected.** `DemoPolicyProvider` reads local seed records.
3. **No real city is covered.** Real inputs return "coverage unavailable".
4. **Illustrative defaults are assumptions, not measurements.** In particular:
   - Eligible share of food waste (65% / 60%) — the policy text publishes none.
   - Recyclables per person per week (10 lb) — no measured basis at all.
   - Contamination rate (10%), reusable bag set cost ($12), caddy/bin cost ($25).
   - The programme's baseline capture rate (55%).
   - The 52-week year with no seasonal variation.
   Every one is listed in the simulator and editable where it makes sense.
5. **Counts and weights are never converted.** No lb→bag or lb→tonne factor exists.
6. **No environmental outcome is claimed.** The app reports arithmetic on inputs only.
7. **Self-reported inputs.** Household size and food waste are estimates the user types.
8. **Policies are not additive.** Two bag-fee policies would charge the same shopping
   trips twice, so the dashboard models one leading policy per scenario and says so.
9. **Proposed policies are excluded from headline figures** and reported separately.
10. **Contacts are placeholders.** Reserved `.example` domains and a 555 phone range.
    They cannot reach a real person.
11. **No moderation, consent flow, or server storage** exists for community stories.
12. **The demo city is a single jurisdiction set** (city + county + state), seeded to
    prove the model holds all three levels.

---

## Extension points

### 1. An official policy feed

Set two environment variables and the HTTP adapter takes over:

```bash
POLICY_FEED_URL=https://example.gov/api/policies.json
POLICY_FEED_JURISDICTION_ID=example-city
```

The endpoint must return `{ jurisdictions, policies, sources }`. Records are validated
against `policyRecordSchema` (`src/lib/validation.ts`) before rendering, the request
times out after 8 seconds, and any failure falls back to the demo provider rather than
breaking the app. Revalidation is set to one hour.

### 2. Optional AI summarisation

`POST /api/ai-summary` (`src/app/api/ai-summary/route.ts`) is implemented but **disabled
by default**, because no key is configured.

Design guarantees, all enforced server-side:

- The key lives in the server environment and is never returned to the browser.
- The prompt contains the supplied source text and instructs the model to use nothing
  else — summaries are **grounded**, not recalled.
- The source URL is echoed back untouched, so the original link is always preserved.
- Text shorter than 40 characters is rejected (`insufficient-source`) rather than
  summarised from memory.
- Any upstream error, timeout, or empty response degrades to `available: false`, and the
  raw source text stays on screen.
- When unconfigured, the route reports `available: false` and **the UI hides the feature
  entirely** — there is no button that fails.

Enable it with:

```bash
AI_SUMMARY_PROVIDER=openai
AI_SUMMARY_API_KEY=sk-...
AI_SUMMARY_MODEL=gpt-4o-mini
AI_SUMMARY_BASE_URL=https://api.openai.com/v1
```

The core demo never depends on this route.

### 3. Additional scenarios

Add a discriminated member to `PolicyParameters`, a pure `simulateX()` module following
the same conventions, a branch in `runSimulation()`, a `SCENARIO_META` entry, and a
control panel. Nothing else changes.

### 4. Real accounts and community moderation

`UserData` is already versioned and centralised in `src/state/app-store.tsx`. Replacing
`src/lib/storage.ts` with an API client is the only change needed to move persistence
server-side.

---

## Accessibility and quality

- **Keyboard:** skip link, visible focus rings on every control, native `<details>`
  disclosures, real radio inputs for segmented controls, no focus traps.
- **Screen readers:** every control has a real `<label for>`; help and error text are
  wired through `aria-describedby`; errors use `role="alert"`; progress bars expose
  `role="progressbar"`; status changes use `aria-live`.
- **Charts are never chart-only.** Every charted figure is also printed in an
  accompanying table with a caption, plus a plain-language sentence describing the
  direction of change.
- **Status is word + icon + colour**, never colour alone — it survives greyscale
  printing and colour-vision differences.
- **Reduced motion:** a global `prefers-reduced-motion` rule disables transitions,
  animations and smooth scrolling, and flattens the skeleton shimmer.
- **Print:** the impact summary removes navigation, expands link URLs, avoids page breaks
  inside cards and tables, and repeats the demo disclaimer at top and bottom.
- **No secrets in the browser.** The only environment variables that reach the client
  are `NEXT_PUBLIC_*`, and there are none in use.
- **Safe rendering.** Story text and every other user string is rendered as a React text
  node. There is no `dangerouslySetInnerHTML` anywhere in the codebase.
- **Complete states.** Loading (route-level skeletons + inline skeletons), empty (no
  policies / no results / no stories, each with distinct copy), filtered-empty (with a
  clear-filters action), validation errors, storage-unavailable, and 404.

---

## Verification results

Run `npm run verify` to reproduce. Results from the final build:

| Command | Result |
| --- | --- |
| `npm run typecheck` | ✅ Clean, no errors |
| `npm run lint` | ✅ Clean, 0 errors, 0 warnings |
| `npm run test` | ✅ 4 files, **44 tests passed** |
| `npm run build` | ✅ Compiled successfully, 16/16 pages generated |
| Browser run (headless Chrome) | ✅ **50 assertions, 0 problems** |

The browser run drives a real Chrome against a production `next start` build and checks
the full journey, accessibility invariants, and responsive behaviour. See
[`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) for the full transcript.

### Calculation boundaries covered by tests

| Boundary | Assertion |
| --- | --- |
| Zero shopping trips | All metrics 0, no `NaN`, explicit warning |
| Zero fee | Cost 0, bags still avoided, explicit warning |
| 0% adoption | Identical to baseline |
| 100% adoption | Maximum possible reduction, explicit warning |
| 0% participation | Nothing diverted, all waste trash-bound |
| 100% participation | Upper bound reached, flagged as an upper bound |
| Zero / full contamination | Zero reward / full reward |
| Monthly cap | Capped at the policy value and flagged |
| Uncapped policy | No cap applied |
| Negative inputs | Treated as 0, never negative |
| `NaN` inputs | Treated as 0, result stays finite |
| Out-of-range rates | Clamped to `[0, 1]`, no extrapolation |
| Monthly ↔ annual | `annual === monthly × 12` for every metric, both scenarios |
| One-time costs | Excluded from monthly, included in first-year total |
| Non-additivity | Exactly one policy counted per scenario |
| Purity | Identical inputs produce identical results |

### Journey verified end-to-end

Open demo → edit profile → inspect policy → change simulation → save policy → add local
story → copy action draft → print summary. Each step was exercised in the running app.

---

## Project layout

```
policy-pulse/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 Root layout, metadata, store provider, shell
│   │   ├── page.tsx                   Overview (server) → OverviewWorkspace (client)
│   │   ├── globals.css                Design tokens, base, print + reduced-motion rules
│   │   ├── loading.tsx / not-found.tsx
│   │   ├── policies/                  Explorer + [slug] detail (+ loading states)
│   │   ├── simulator/                 Impact Simulator
│   │   ├── community/                 Community perspectives
│   │   ├── actions/                   Action Center
│   │   ├── impact-summary/            Printable summary
│   │   └── api/ai-summary/route.ts    Optional, disabled-by-default summariser
│   ├── components/
│   │   ├── ui/                        Button, Card, Badge, form controls, accordion, misc
│   │   ├── brand/                     Wordmark, demo-data indicator
│   │   ├── layout/                    App shell, sidebar, mobile nav, top bar
│   │   ├── policy/                    Card, explorer, detail, status + source badges
│   │   ├── dashboard/                 Stat tiles, scenario impact, upcoming dates, data panel
│   │   ├── simulator/                 Workspace, controls, results, chart, calculation notes
│   │   ├── community/                 Scenario compare, story card, story form
│   │   ├── actions/                   Action Center
│   │   ├── setup/                     Location setup, household form
│   │   └── overview/                  Overview workspace
│   ├── lib/
│   │   ├── types.ts                   Domain types
│   │   ├── constants.ts               Demo city, disclaimers, defaults, slider bounds
│   │   ├── labels.ts                  Enum → display label maps
│   │   ├── format.ts                  Currency, weight, date and text formatting
│   │   ├── policy-utils.ts            Sorting, primary dates, upcoming dates, facets
│   │   ├── policy-provider.ts         PolicyProvider + demo and HTTP adapters
│   │   ├── validation.ts              Zod schemas + field-error flattening
│   │   ├── storage.ts                 Defensive localStorage + migration
│   │   ├── clipboard.ts               Copy with a legacy fallback
│   │   ├── utils.ts                   cn(), id helper
│   │   ├── data/                      Seed records + data-access facade
│   │   └── simulation/                Pure engine + 44 unit tests
│   └── state/app-store.tsx            Persisted user state
├── .env.example                       Optional variables, no secrets
├── DEMO_SCRIPT.md                     Timed two-minute demo script
├── IMPLEMENTATION_SUMMARY.md          Final summary + verification
├── README.md
├── tailwind.config.ts                 Design tokens
├── vitest.config.ts
└── eslint.config.mjs
```

---

## Visual direction

Warm off-white paper (`#faf7f0`), deep forest green, restrained teal and amber.
High-contrast editorial typography (a display serif for headings, a clean sans for
interface text), generous spacing, and a leaf-with-a-heartbeat wordmark that stays
legible at 20 px.

Desktop uses a compact sticky sidebar with a spacious workspace. Mobile switches to a
top bar plus a five-item bottom navigation, stacked content, and full-width simulator
controls. There is no oversized marketing hero — the product starts immediately.

---

**PolicyPulse is a demonstration.** It is not legal advice, it does not cover any real
jurisdiction, and it does not model environmental outcomes. It shows its working, states
its assumptions, and labels its fiction.
