# Hackathon attribution — NextStep Hacks 2026

This file exists to satisfy the submission requirement:

> *"Must state pre-hackathon vs during-hackathon work if continuing an old project."*

It is written to be **honest and specific**. Fill in the bracketed facts, delete any
row that does not apply, and do not claim more than is true — a misstated
attribution is a disqualification risk, while an honest one is not.

---

## READ THIS FIRST — repository state

The repository currently contains **one commit**:

```
83444dd  adding new features    Fares Chrayteh    2026-09-19
```

Everything — 12,728 lines of production source plus 992 lines of tests — arrives in
a single commit dated the day before the submission deadline. This is not itself a
problem, but it means the repository provides **no evidence of when any part of the
work was done**. If a judge inspects the history to check the attribution below,
there is nothing there to corroborate it.

Choose one of these two paths:

1. **The work was all done inside the hackathon window.** Keep the single commit,
   state that plainly below, and rely on the statement itself. Consider adding the
   other contributors' commits if they were made separately (`git log` currently
   shows only one author).
2. **Any part of it predates the event.** Say which part, in which row of the table
   below, and by how much. Then the single commit is consistent with the story
   rather than in tension with it.

---

## The declaration

**Project:** PolicyPulse
**Event:** NextStep Hacks 2026 — Earth Forward track (waste reduction and recycling)
**Team:** Fares Chrayteh [add additional members, or state "solo"]
**Repository:** https://github.com/FaresCH10/policy-pulse
**Live build:** https://pulsepolici.netlify.app/

### Was this a new project or a continuation?

> **[Choose one and delete the other.]**
>
> **New project.** PolicyPulse was started inside the hackathon window. No part of
> it existed before the event.
>
> **Continuation.** PolicyPulse continues earlier work. The split is declared in
> the table below.

### Pre-hackathon work (existed before the event)

| Area | What existed before | Extent |
| --- | --- | --- |
| [e.g. Concept / problem research] | [what exactly] | [e.g. notes only, no code] |
| [e.g. Framework scaffold] | [what exactly] | [e.g. `create-next-app` only] |
| [e.g. Simulation formulas] | [what exactly] | [e.g. bag-fee model drafted] |

**If nothing predates the event, write: "None. No code, design or content was
produced before the hackathon start."** Do not leave the table empty — an empty
table reads as an unanswered question.

### During-hackathon work (produced inside the window)

Be specific. Judges reward a clear account of what was actually built.

| Area | What was built |
| --- | --- |
| Simulation engine | Three pure models (bag fee, composting, recycling incentive), one pure function shared by every surface, with formula traces and assumption provenance |
| Household personalisation | Six-field profile, locally stored, scaling every estimate |
| Policy Explorer + detail | Status model, plain-language four-question structure, provenance labels, contacts |
| Impact Simulator | Three input groups kept separate (policy / household / what-if), live recalculation, baseline-vs-simulated chart |
| Community comparison | Scenario comparison across household shapes — arithmetic, not demographics |
| Action Center | Checklists with local progress, questions to ask, editable copy-only drafts |
| Printable summary | One-page PDF-able output carrying every assumption and formula |
| Honesty and safety layer | Demo/live mode separation, provenance on every record, explicit "what is deliberately not modelled", no data leaves the device |
| Test suite | 89 unit tests across 6 files, covering the calculation boundaries |
| Deployment | Netlify configuration, CI quality gate, both modes |

### Verification performed inside the window

Record the concrete evidence, because "Completion" is a judging criterion:

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run test` — **89 tests across 6 files**, all passing
- `npm run build` — compiled successfully, 11 routes
- `npm audit` — zero known vulnerabilities
- Headless-browser crawl of all 14 routes against a production build: no uncaught
  exceptions, no `console.error`, no `console.warn`, no accessibility violations on
  images, buttons, links or form labels
- Every regression test verified by mutation: reverting a fix makes a specific
  test fail

---

## Likely judge question: "What did you do during the hackathon?"

Answer in one sentence, using your own rows from the table above. For example:

> "The simulation engine, the household personalisation, the simulator, the policy
> explorer, the community comparison, the action centre and the printable summary
> were all built during the event, along with the 89-test suite and the Netlify
> deployment."

---

## Corrections log — carried out during production hardening

Keep this if it strengthens your **Learning** criterion. It is a true record and it
shows engineering judgement rather than only feature work. Every entry was
verified by running the code, not by reading it.

| # | Defect | Effect | Fix | Proven by |
| --- | --- | --- | --- | --- |
| 1 | Bag-fee cost change compared the simulated world against itself instead of against a world without the policy | A household that had just begun paying the fee was shown a **saving**; at full adoption a $5.20 saving appeared that did not exist | Baseline cost set to zero, matching the convention the other two models already used | 6 tests fail when the line is reverted; the live site still shows the inverted figure |
| 2 | The shipped "regression test" for #1 compared an expression against itself | It passed identically for +18.72 and −18.72 — it could not fail | Replaced with a first-principles recomputation | Mutation: reverting #1 leaves the old test green, the new one red |
| 3 | `/api/health` derived its `mode` field from the provider's `isDemo` flag rather than the configured `APP_MODE` | The field an operator uses to verify a deployment described the provider, not the deployment | Reads `getAppConfig().mode` directly | A test forcing provider and config to disagree |
| 4 | A malformed `POLICY_FEED_URL` threw a bare `TypeError: Invalid URL` | No indication which variable was wrong or what was expected | Throws an actionable configuration error naming the variable | Mutation: reverting shows `"Invalid URL"` |
| 5 | Signed currency rendered `−$0.00` — a minus sign on an amount displayed as zero | Reads as a saving that does not exist | The sign is decided by the same formatter that prints the digits | 5 tests fail when reverted |
| 6 | Compact axis labels rendered `$-1.5k` | Sign after the currency symbol, ASCII hyphen instead of a real minus | Sign leads the symbol: `−$1.5k` | Mutation-verified |
| 7 | Household cost aggregates were un-rounded sums of rounded rows | An IEEE-754 tail (`-4.680000000000001`) could reach a headline figure | Aggregates re-rounded after summing | Neutering `roundTo` reproduces the tail and fails 3 tests |

Two documentation defects were also corrected: the test count was stale, and the
build output was described as statically prerendered when `layout.tsx` sets
`force-dynamic`, so every page route is server-rendered on demand.
