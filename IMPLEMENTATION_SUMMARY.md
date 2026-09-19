# PolicyPulse — Implementation Summary

**Theme:** Earth Forward · **Scope:** how local environmental policy lands in a real household
**Status:** complete and verified · **Data:** fictional demonstration city + illustrative policy records

---

## 1. What was built

A five-destination Next.js application that takes a person from *"what is this policy?"* to
*"here is what it costs my household and here is what I can do about it"* in under two minutes.

| Destination | Route | What it does |
| --- | --- | --- |
| Overview | `/` | Location + data status, household snapshot, one impact card per scenario, upcoming dates |
| Policy Explorer | `/policies` | Search, status/category filters, saved-only, sort; 5 policy cards |
| Policy detail | `/policies/[slug]` | The four required questions, key dates, community perspectives, contacts, sources |
| Impact Simulator | `/simulator` | Live recalculation from sliders, baseline-vs-simulated chart, full calculation trace |
| Community | `/community` | Circumstance-based scenario comparison + locally-stored story submission |
| Action Center | `/actions` | Checklist with progress, questions to ask, getting-started guides, editable email draft |
| Printable summary | `/impact-summary` | A print-styled impact statement for one policy |

**Run it:**

```bash
npm install
npm run dev        # http://localhost:3000
npm run verify     # typecheck + lint + test + build
```

No credentials, no network calls, no paid services are required for any part of the core journey.

---

## 2. Architecture

75 TypeScript files under `src/`, organised so that content, arithmetic, persistence, and
presentation never bleed into each other.

```
src/lib/types.ts          Domain model — the single source of truth for every shape
src/lib/simulation/       Pure arithmetic. No React, no DOM, no network, no Date.now()
src/lib/data/             Seeded demo records + the data-access facade
src/lib/policy-provider.ts  Replaceable provider (demo adapter / HTTP adapter)
src/state/app-store.tsx   localStorage-backed client state, hydration-gated
src/components/           Presentation only
src/app/                  Routes; server components load, client components interact
```

### Decisions that mattered

**The simulation engine is pure.** `runSimulation(policy, profile, assumptions)` is a plain
function over plain data. That is why 89 unit tests can pin the arithmetic exactly, and why the
Overview, Simulator, Community comparison, and printable summary all agree — they call the same
code rather than re-deriving numbers.

**Persistence is hydration-safe.** The first client render always uses deterministic defaults, so
server HTML and client HTML match. Saved data is read in an effect and written only after a
`hydratedRef` flips. No hydration warnings, no flash of stale content.

**The provider is swappable.** `getPolicyProvider()` returns the demo adapter unless both
`POLICY_FEED_URL` and `POLICY_FEED_JURISDICTION_ID` are set server-side. A real feed drops in
without touching a single component. Misconfiguration falls back to demo rather than failing
loudly at runtime.

**Status is never carried by colour alone.** Every status renders a word, an icon, and a colour.
Charts ship a text table equivalent. Warnings are `role="alert"`.

---

## 3. The three scenarios and their arithmetic

Formulas are implemented exactly as specified, in three modules with the derivation written in
the file header.

### 1. Single-use bag fee — `src/lib/simulation/bag-fee.ts`

```
monthly trips        = weekly trips × 52 / 12
baseline bags        = monthly trips × bags per trip
remaining bags       = baseline bags × (1 − reusable-bag adoption rate)
simulated fee cost   = remaining bags × fee per bag
fees avoided         = baseline fee cost − simulated fee cost
bags avoided         = baseline bags − remaining bags
```

### 2. Household composting — `src/lib/simulation/composting.ts`

```
monthly waste diverted = weekly food waste × 52 / 12 × participation rate × eligible share
```

Pounds are never converted to counts, and no emissions figure is ever derived from them.

### 3. Recycling incentive — `src/lib/simulation/recycling-incentive.ts`

```
recyclables collected = household size × per-person monthly rate × capture rate
credited weight       = collected × (1 − contamination rate)
reward                = min(credited weight × reward per lb, monthly cap)
net household cost    = program fee − reward
```

### Conventions held everywhere

| Convention | Why |
| --- | --- |
| Counts and weights stay separate | There is no documented conversion factor, so none is invented |
| `annual === monthly × 12` for every metric | Asserted in tests for all three scenarios |
| One-time costs excluded from monthly, included in first-year | Prevents a rebate from looking like a recurring saving |
| Exactly one policy per scenario in the summary | Policies overlap; summing them would be a fabricated number |
| Negative = better for the household | Stated in the UI next to every signed figure |
| Out-of-range inputs clamp, never extrapolate | A slider cannot produce a physically impossible result |

### Explicitly **not** modelled

No emissions reductions. No health effects. No temperature changes. No confidence intervals.
No projections presented as predictions. The README lists twelve data limitations, and the
simulator carries a visible "what is deliberately not modelled" callout.

---

## 4. How the credibility rules were implemented

The brief's honesty requirements were treated as functional requirements, not copy.

- **A persistent `Demo data` badge** sits in the sidebar and the mobile top bar on every route.
  It is a native `<details>` disclosure that expands into the full disclaimer — visible without
  being obtrusive.
- **Unsupported locations never silently become the demo city.** Entering "Portland" returns an
  explicit *"Coverage unavailable for that location"* notice with a separate, clearly labelled
  *"Explore the demonstration city instead"* button, and a note that choosing demo is a deliberate
  choice rather than a substitution. The sidebar simultaneously reads **Not covered**. This was
  verified in the browser, not just in code.
- **Provenance is modelled, not narrated.** `isDemo`, `sourceUrl`, `retrievedAt`, and
  `contentRole` (`legal-text` / `explanatory-summary` / `illustrative`) are typed fields. Demo
  sources carry **no URLs at all** rather than fake ones, and the UI says *"No external document
  to link"*.
- **Contacts are non-actionable by construction.** All demo contacts use reserved `.example`
  domains and `1-555-0100` ranges, and are labelled *"Example only"*.
- **Real policy rules and what-if settings are kept apart** in types (`AssumptionNote.source`
  distinguishes `policy` / `household` / `illustrative` / `what-if`), in the UI (a separate amber
  group badged *"Does not change the policy"*), and in the result. Verified: with a what-if fee
  active, the policy's own 10¢ rate is still displayed alongside it.
- **Stories are labelled.** Seeded stories read *"Fictional example"*; user submissions read
  *"Yours · saved on this device"* and are never published. User text renders as React text nodes.
- **The email draft is never sent.** It can be previewed, edited, rebuilt from template, and
  copied — there is no send path in the codebase.

---

## 5. Verification results

Everything below is actual output from the final build, not an expectation.

### Static checks

| Command | Result |
| --- | --- |
| `npm run typecheck` (`tsc --noEmit`) | ✅ exit 0, no output |
| `npm run lint` (`eslint .`) | ✅ exit 0, 0 errors, 0 warnings |
| `npm run test` (`vitest run`) | ✅ **6 files, 89 tests passed** |
| `npm run build` (`next build`) | ✅ Compiled successfully, **11 routes** |

Route table from the build:

```
ƒ /                       12.8 kB   159 kB First Load JS
ƒ /_not-found             130 B     102 kB
ƒ /actions                8.96 kB   152 kB
ƒ /api/ai-summary         130 B     102 kB
ƒ /api/health             130 B     102 kB
ƒ /community              8.08 kB   151 kB
○ /icon.svg               0 B       0 B
ƒ /impact-summary         3.78 kB   146 kB
ƒ /policies               4.32 kB   150 kB
ƒ /policies/[slug]        6.72 kB   149 kB
ƒ /simulator              114 kB    257 kB
+ shared by all           102 kB
```

`○` is prerendered static content, `ƒ` is server-rendered on demand. Every page route is `ƒ`
because `src/app/layout.tsx` sets `export const dynamic = "force-dynamic"`. That is deliberate:
policy data comes from a runtime provider selected by `APP_MODE` (and optionally
`POLICY_FEED_URL`), so a build-time prerender could bake in the wrong dataset. Only the
`/icon.svg` asset is static. There are no prerendered HTML files in `.next/server/app/` —
verified against a real build.

### Browser run — 50 assertions, 0 problems

A headless Chrome session drove a production `next start` build through the whole journey,
listening for page errors, console errors, failed requests, and any HTTP 4xx/5xx.

```
[STEP] h1 count on landing: 1
[STEP] unsupported-location notice shown: 1
[STEP] sidebar shows Not covered after unsupported query: true
[STEP] summary tiles: AT A GLANCE | POLICIES FOR YOU | MONTHLY COST CHANGE | BAGS AVOIDED | FOOD WASTE DIVERTED
[STEP] scenario cards: 3
[STEP] upcoming date rows: 6
[STEP] policy cards: 5
[STEP] cards after "Proposed" filter: 2
[STEP] cards after searching "compost": 2
[STEP] detail h1: Single-Use Carryout Bag Fee
[STEP] detail sections present: What changes? / Who is affected? / What can I do? / uncertainties
[STEP] illustrative provenance labels on detail: 3
[STEP] range inputs on simulator: 4
[STEP] adoption slider max: 100
[STEP] cost at 0% adoption: $0.00
[STEP] bags avoided at 0% adoption: 0.0
[STEP] cost at 100% adoption: −$2.60
[STEP] bags avoided at 100% adoption: 26.0
[STEP] chart svg / bar groups / axis ticks: 2 / 2 / 7
[STEP] visible list items after expanding the trace: 9
[STEP] assumption source tags: 5
[STEP] policy rate still displayed alongside the what-if value: 1
[STEP] bookmark accessible name: Save policy: Bag fee
[STEP] bookmark toggled to saved: 1
[STEP] story cards: 8
[STEP] comparison table rows: 4
[STEP] user story labelled as device-local: 2
[STEP] checklist checkboxes: 5
[STEP] checklist progress after one tick: 1
[STEP] copy-draft button present: 1
[STEP] copy feedback shown: 1
[STEP] summary tables: 2
[STEP] summary disclaimer blocks: 1
[STEP] summary calculation steps: 9
[STEP] unknown policy status: 404
[STEP] favicon status: 200
[STEP] mobile bottom nav present: 2
[STEP] desktop sidebar hidden on mobile: true
[STEP] mobile horizontal overflow (px): 0
[STEP] desktop horizontal overflow (px): 0
[STEP] overview cost after simulator change (persisted): … MONTHLY COST CHANGE −$2.6
[STEP] saved-policy badge on overview: 1

===== PROBLEMS =====
none
===== STEP COUNT: 50 =====
```

The simulator numbers in that transcript match the unit tests exactly: 0% adoption gives
`$0.00` and `0.0` bags avoided; 100% adoption gives `−$2.60` and `26.0` bags avoided
(26 bags × $0.10 = $2.60). The Overview showed `−$2.6…` afterwards, proving state persisted
across navigation.

### Defects found by verification and fixed

Verification was not a formality — it caught six real problems:

| Defect | Root cause | Fix |
| --- | --- | --- |
| Two `<h1>` elements on every page | `TopBar` rendered the page name as a heading | Changed to a styled `<p>`; added a `level` prop so page sections own the single `h1` |
| Unknown policy slug returned **HTTP 200** | `notFound()` after the App Router shell has flushed cannot change the status code | `export const dynamicParams = false` on the route |
| Bookmark button had no policy-specific accessible name | Only the generic visible label "Save policy" was exposed | Added `aria-label` starting with the visible text (`Save policy: Bag fee`), preserving label-in-name |
| Console 404 for `/favicon.ico` | `src/app/icon.svg` does not satisfy Chrome's direct `/favicon.ico` request | Generated a real 32×32 BMP-in-ICO at `src/app/favicon.ico`; now returns **200** |
| Misleading dashboard hint | Tile value was 5 while the hint read "2 in effect or adopted · 1 proposed" | Reworded to "3 scenarios modelled · 2 binding · 1 proposed" |
| `Partial<>` rejected partial scenario overrides | `Partial<SimulationAssumptionsByScenario>` is shallow, so a single-field override failed | Added a true deep-partial `AssumptionOverrides` mapped type |

### Calculation boundaries covered by the unit tests

Zero trips · zero fee · 0% and 100% adoption · 0% and 100% participation · zero eligible share ·
zero and full contamination · monthly cap applied and absent · below-baseline capture ·
negative inputs · `NaN` inputs · out-of-range rates clamped · monthly↔annual consistency for
every metric in all three scenarios · one-time costs excluded from monthly and included in
first-year · non-additivity (exactly one policy per scenario) · purity (identical inputs produce
identical results) · signed-currency rendering at the zero boundary (a value that displays as
zero must not carry a sign) · float-tail rounding of household cost aggregates.

---

## 6. Accessibility and quality

- **Keyboard + focus:** skip link to `#main`, visible `focus-visible` outlines, native
  `<details>`/`<summary>` disclosures, real `<label for>` on every control.
- **Forms:** accessible validation via `aria-describedby` and `role="alert"`; the numeric helper
  rejects an empty string rather than silently coercing it to `0`.
- **Charts:** every chart is accompanied by a full text table and a direction sentence.
- **Motion:** a global `prefers-reduced-motion` override.
- **Print:** a real print stylesheet with `@page` margins, hiding chrome and expanding link hrefs.
- **Responsive:** verified at 390×844 — desktop sidebar hidden, bottom nav present with
  `env(safe-area-inset-bottom)`, **0px horizontal overflow**; also 0px at 1366px.
- **Secrets:** no `NEXT_PUBLIC_*` variables are in use; the optional AI summarisation key is
  server-only and the feature reports `available: false` when unconfigured.

---

## 7. Remaining limitations

Stated plainly, because the brief asked for them:

1. **All policy content is fictional.** The demonstration city, its ordinances, dates, fees, and
   eligible shares are illustrative. Nothing here should be cited as a real policy.
2. **No live policy coverage.** There is no ingest of real municipal data. The provider interface
   and the `policyRecordSchema` exist so a feed can be added, but none is wired up.
3. **Simulation is arithmetic, not forecasting.** Results describe the consequence of the stated
   assumptions. They are not predictions and carry no uncertainty bounds.
4. **No environmental outcome is claimed.** Bags avoided and pounds diverted are counts and
   weights. No emissions, health, or temperature effect is inferred from them.
5. **One jurisdiction, one theme.** Waste and recycling only. Energy, water, and transport
   policies are out of scope for this MVP.
6. **Stories are device-local.** Submissions live in this browser's `localStorage`; they are not
   published, moderated, or visible to anyone else. Seeded stories are fictional examples.
7. **The AI summarisation route is optional and off by default.** It requires an
   OpenAI-compatible endpoint; the core demo never calls it.
8. **Contacts and deadlines are non-actionable examples.** Reserved `.example` domains and 555
   numbers by design — nothing is fabricated that a person could act on incorrectly.
9. **`npm run build` skips Next's built-in lint** (`eslint.ignoreDuringBuilds`), deliberately, so
   lint failures can never mask build failures. Lint runs as its own explicit step in
   `npm run verify`.
10. **The simulator route ships 110 kB of charting code** (Recharts), the largest bundle. It is
    lazy in practice — only loaded when the user opens the simulator — but it is the obvious
    first target if bundle size ever matters.

---

## 8. Deliverables

| Deliverable | Location | Status |
| --- | --- | --- |
| Complete runnable app | `D:\policy-pulse` | ✅ |
| Consistent labelled seed data | `src/lib/data/*` | ✅ 5 policies, 6 sources, 8 stories, 5 archetypes |
| README (setup, architecture, formulas, limitations, extension points) | `README.md` | ✅ |
| Env-var example file without secrets | `.env.example` | ✅ |
| Two-minute demo script | `DEMO_SCRIPT.md` | ✅ timed, with judge Q&A |
| Final implementation summary with verification results | this file | ✅ |

---

## 9. Extension points

- **Official policy feed** — implement `PolicyProvider` against a real source, validate with
  `policyFeedSchema`, set `isDemo: false`, add a real `sourceUrl` and `retrievedAt`. Then flip
  `dynamicParams` to `true` on `/policies/[slug]`.
- **AI summarisation** — already server-side at `/api/ai-summary`, grounded in supplied source
  text with the source link echoed back. It degrades to `available: false` rather than failing.
- **New scenarios** — add a `PolicyParameters` variant, a simulator module, and a `SCENARIO_META`
  entry. The simulator UI, summary, and comparison table pick it up from the union.
- **Accounts and moderation** — the story model already distinguishes local submissions from
  seeded records, so publishing becomes a persistence swap rather than a data-model change.
