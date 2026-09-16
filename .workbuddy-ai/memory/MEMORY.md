# PolicyPulse — project memory

Hackathon app ("Earth Forward"): shows how local environmental policy lands in a household.
Next.js 15 App Router · React 19 · TypeScript strict · Tailwind 3.4 · Recharts · Zod · Vitest.

## Non-negotiable product rules

These come from the original brief and are load-bearing. Do not regress them.

1. **Demo data is always labelled.** `DemoBadge` is persistent in the sidebar and mobile top bar.
   All seed policies/sources/stories/contacts are `isDemo: true` with fictional provenance.
2. **Never silently substitute demo policies for a real location.** An unsupported location
   returns an explicit "coverage unavailable" notice; offering the demo city is a separate,
   clearly-labelled user choice. The sidebar must read "Not covered".
3. **No invented environmental outcomes.** No emissions reductions, health effects, temperature
   changes, or confidence intervals. Counts (bags) and weights (lb) stay separate because no
   conversion factor is documented.
4. **Real policy rules ≠ what-if settings.** Enforced in types (`AssumptionNote.source`:
   `policy` | `household` | `illustrative` | `what-if`), in the UI (separate amber group badged
   "Does not change the policy"), and in results. A what-if fee must not hide the policy's rate.
5. **Nothing actionable is fabricated.** Demo contacts use `.example` domains and 555 numbers.
   The email draft can be previewed/edited/copied — there is no send path, and there must not be.
6. **One policy per scenario in any household total.** Policies overlap; summing them would
   invent a number.

## Code conventions

- `src/lib/simulation/*` is **pure**: no React, no DOM, no network, no `Date.now()`. Every
  surface calls `runSimulation()` so numbers can never drift between pages.
- Client components must not import seed data. Status/category labels live in `src/lib/labels.ts`
  (dependency-free); pure helpers in `src/lib/policy-utils.ts`.
- Persistence is hydration-safe: deterministic defaults → read in effect → writes gated on
  `hydratedRef`.
- Exactly **one `<h1>` per page**. `SectionHeading` takes `level="h1"` for page-level headings;
  layout chrome uses `<p>`, never a heading.
- Use `AssumptionOverrides` (deep partial) for scenario overrides — `Partial<T>` is shallow and
  rejects single-field overrides.
- Status is always word + icon + colour, never colour alone. Charts ship a text-table equivalent.
- `npm run build` skips Next's lint on purpose (`eslint.ignoreDuringBuilds`) so lint can never
  mask build failures. Lint runs explicitly in `npm run verify`.

## Environment gotchas (this machine)

- **`http_proxy` intercepts `localhost`.** Use `curl --noproxy '*'` and
  `NO_PROXY="127.0.0.1,localhost"` for Node. A 502 on localhost is the proxy, not a dead server.
- **Background servers die when the parent shell exits.** Start server → wait → run browser
  script → kill, all in one shell call. Redirect to a log file; never `| head`.

## Verify before claiming done

```bash
npm run verify   # typecheck + lint + test + build
```
Then drive a real browser against a production build. See the
`verify-local-web-app-in-browser` skill for the harness pattern.
