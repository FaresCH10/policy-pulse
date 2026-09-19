# Production readiness — September 16, 2026

## Delivered

- Explicit server-side `APP_MODE=demo|live`, strict configuration checks and separate local storage. Existing demo storage remains compatible.
- Live mode works without credentials using a curated Washington, DC carryout bag fee record backed by DC Council and DOEE sources. Review date and limited coverage are visible. This is not an automatic government feed.
- Optional HTTPS JSON provider with complete record validation, matching scenarios, safe source links, scoped jurisdiction lookups, response-size limits and timeout. Failures never substitute demo data.
- Mode-aware location setup, navigation, provenance, policy details, notes, action checklists, editable copy-only drafts and printable summaries. Unavailable scenarios are excluded from the pickers.
- Error and 404 screens, `/api/health`, security headers, disabled unused public AI proxy, patched runtime/test dependencies and a reproducible lockfile.
- Storage access and malformed data fail safely. Hydration no longer risks writing defaults before stored data is loaded.
- Bag-fee cost change now measures the household's cash position against a world without the policy, matching the convention composting and recycling-incentive already used. Previously a household that had just started paying the fee was shown a saving, and at full adoption a $5.20 saving that did not exist. A household-level regression test recomputes the figure from first principles instead of comparing the module's output to itself.
- `/api/health` reports the configured `APP_MODE` rather than inferring it from the provider's `isDemo` flag, so the field used to verify a deployment always reflects the deployment's own configuration.
- A malformed `POLICY_FEED_URL` now raises an actionable configuration error naming the variable and the expected shape, instead of a bare `TypeError: Invalid URL`.
- Signed currency can no longer render a minus sign on an amount that displays as zero (`−$0.00`). The sign is decided by the same formatter that produces the digits, which also removes a discrepancy between `Math.round` and `Intl` at exact half-cent boundaries such as `−0.005`.
- Compact axis labels put the sign before the currency symbol (`−$1.5k`, not `$-1.5k`) and use a real minus sign, matching every other figure in the app.
- Household-level cost aggregates are re-rounded after summing, so an IEEE-754 tail (`-4.680000000000001`) cannot reach a headline figure.
- Muted body text now meets WCAG AA. `--pp-ink-faint` measured 3.31–3.86 against every surface it is painted on and failed AA on all of them (961 rendered instances, including captions, table headers, helper text and the footer disclaimer). Darkened to `#63695c`, which keeps the original hue and saturation and clears 4.5:1 everywhere (worst case 4.78).
- Clay text now meets AA on the callout it is paired with. `#b4553f` passed on paper (4.55) but failed against its own `clay-soft` background (4.11) and on `paper-sunken` (4.14). Darkened to `#9c422e` (worst case 5.48). This was the colour of the "Boundaries and caveats" panel.
- Both colour tokens are defined in **two** places with different mechanisms: `--pp-ink-faint` in `globals.css` (referenced through `var()` by the Tailwind `ink` scale), and `clay` as a hardcoded literal in `tailwind.config.ts`. `var(--pp-clay)` is referenced nowhere, so editing the CSS variable alone would not have changed any rendered colour.
- `/impact-summary` no longer overflows horizontally at 320px. Its two data tables were wrapped in `overflow-x-auto` with `min-w-[30rem]`, the same idiom already used in `results.tsx` and `scenario-compare.tsx`.
- `CardHeader` no longer renders a `<header>`. As a reusable slot it turned every card into a `banner` landmark, so a page with 11 cards exposed 11 of them. Now a `<div>`, consistent with `CardBody` and `CardFooter`; header landmarks dropped from a maximum of 11 to 2 per page.
- The sidebar and mobile bottom navigation no longer share the accessible name "Primary"; they are now "Sections" and "Primary sections", so the two landmarks are distinguishable.
- `/policies` no longer skips a heading level: the results list is labelled by a visually hidden `<h2>`, closing the previous h1 → h3 jump.
- Netlify build configuration and CI checks for both modes; deployment and maintenance instructions in README.md.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Unit tests: 89 passed across six files.
- Dependency installation/audit: `npm audit` reports zero known vulnerabilities.
- Production builds: demo and live passed. 11 routes. Every page route is server-rendered on demand (`ƒ`), because `src/app/layout.tsx` sets `dynamic = "force-dynamic"` so a build-time prerender cannot bake in the wrong policy dataset. No prerendered HTML is emitted; only `/icon.svg` is static.
- HTTP checks (verified locally against a production build): `/api/health` returns `mode: "live"`, `provider: "curated-dc"`, `policyCount: 1` in live mode, and the matching demo values in demo mode (5 demo policies). Retired AI proxy POST returns 410. Unknown top-level routes return 404. Security headers present (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, CSP).
- Unknown policy slug: returns **HTTP 200** with the not-found page body. This is Next.js streaming behaviour — a `loading.tsx` higher in the tree opens the response before `notFound()` can set the status. The page carries `noindex`, so it is not indexed. A true 404 status would require removing the loading skeletons app-wide or adding a middleware slug lookup that re-fetches feed data on every request; neither trade is worth it. Documented as an accepted limitation rather than silently left.
- Browser checks against production servers: demo selection; unsupported live location; DC selection and official citations; simulator updates and settings persistence; checklist and private-note persistence across reloads; copy action success feedback; source-labelled printable summary; mobile navigation/reflow; feed failure screen without demo content.
- Browser crawl of all 14 routes against a production build: no uncaught exceptions, no `console.error`, no `console.warn`, no images missing `alt`, no buttons or links without an accessible name, and no unlabelled inputs. The `net::ERR_ABORTED` entries seen during navigation are Next.js Router Cache prefetches cancelled by the subsequent navigation (`canceled: true`, every URL carrying `?_rsc=`), not failed requests.
- Signed-figure rendering re-verified in a real browser after the fixes: the bag-fee tile renders `+$5.20` / `+$3.90` / `+$2.60` / `$0.00` in the costing colour at 0% / 25% / 50% / 100% adoption, with "Your household pays more than the baseline".
- Interface audit across 7 routes × 4 viewports (1440 / 820 / 390 / 320), measuring computed colours, element geometry and the accessibility tree rather than reading source: **0 remaining WCAG AA contrast failures** (was 985), **0 horizontal-overflow routes** (was 1), exactly one `h1` per route, and **0 unnamed interactive nodes** in Chrome's accessibility tree across six routes. Every keyboard tab stop has a visible focus indicator; the skip link is the first stop and targets `#main`. Full detail in `UI_REVIEW.md`.
- Print stylesheet verified with emulated `print` media: no navigation chrome is painted, body background switches to white, and content survives (4,231 / 4,942 characters with tables retained). `/impact-summary` deliberately keeps its own footer carrying the legal and provenance disclaimers.
- Clipboard feedback was observed in the browser; the automation clipboard reader did not expose the copied content, so clipboard contents were not independently verified.

## Deployment boundary

The app is configured and validated locally for Netlify. No Netlify site was provisioned or deployed during this task. Follow README.md to connect the repository, set APP_MODE in Builds and Functions, and run post-deployment checks on the real URL.

Live coverage is intentionally small and maintained manually. Community notes are device-local, not a public community service. There are no accounts or cross-device backups. Keep official records reviewed and dependencies patched.

## Local tooling note

The machine's PowerShell npm launcher pointed at a missing roaming npm installation. Validation used the installed npm CLI under `C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js` and the package binaries directly. An npm resolver error was worked around when regenerating the lockfile; the resulting lockfile installed successfully with `npm ci`. No global npm settings were changed.
