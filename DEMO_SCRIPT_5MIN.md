# PolicyPulse — Five-Minute Submission Video Script

**NextStep Hacks 2026 · Earth Forward (waste reduction and recycling)**

This is the script for the **submission video** (maximum five minutes). `DEMO_SCRIPT.md`
is the two-minute version for a live walkthrough; this one buys time for the
attribution statement and the honesty layer, both of which the rules and the
judging criteria reward.

---

## Before you record

- `npm run dev`, open a clean browser profile at roughly **1280 px** wide so the
  desktop sidebar is visible.
- Clear site data once, so the demo opens on the setup screen.
- Have a second tab already open on the **deployed** URL for the comparison at 3:20.
- Say the **attribution sentence** in the first 30 seconds — do not bury it.

---

## 0:00 — 0:25 · The problem, and what this is

*On screen: the Overview setup page.*

> "Local environmental policy gets published — bag fees, composting programmes,
> recycling incentives — but almost nobody can tell what it means for *their*
> household. PolicyPulse closes that gap.
>
> **[ATTRIBUTION — say this plainly, do not skip it.]** PolicyPulse was built
> during this hackathon. Nothing here predates the event. The code, the policies,
> the content and the tests were all written inside the window. You can see the
> commit history for yourself."

*If any part predates the event, name that part here instead. See
`HACKATHON_ATTRIBUTION.md`.*

---

## 0:25 — 0:45 · Honest data from the first click

Click **"Use the demonstration city"**.

> "Before anything else — this is a demonstration. Cedar Hollow is fictional, the
> postal code is a reserved placeholder, every policy and date was written for this
> hackathon. That amber badge is always on screen and you can open it any time."

Click the **Demo data** badge, expand, close.

Type `Portland`, click **Check coverage**.

> "We also refuse to fake coverage. A real city gets *coverage unavailable* and an
> explicit button to use the demo instead. Demo policies are never silently
> substituted for a real place."

Click **Explore the demonstration city instead**.

---

## 0:45 — 1:05 · The household snapshot

*On screen: the personalised dashboard.*

> "Three policies are in effect or adopted. Proposed ones are counted separately,
> because they are not law yet. And one policy per scenario — two bag fees would
> charge the same shopping trips twice, so they are never added together."

Point at the tiles: **Policies for you**, **Monthly cost change**, **Bags avoided**,
**Food waste diverted**.

> "This household is modelled as newly paying about a dollar a month. It pays
> *more* than a world without the policy — that direction matters, and getting it
> backwards is a mistake I found and fixed. I will show you that in a minute."

---

## 1:05 — 1:30 · A policy in plain language

Click **Policy Explorer**, open **Single-Use Carryout Bag Fee**.

> "Four questions, same order every time: what changes, who is affected, what can I
> do, and what should I be uncertain about."

Scroll; point at the amber provenance strip.

> "Every record states where it comes from — including when there is no external
> document to link. We say that outright rather than implying a source we lack."

Point at **Who to contact**.

> "Contacts are placeholders on reserved `.example` domains and a 555 number. They
> cannot reach anyone. We only show a real official contact once one is verified."

---

## 1:30 — 2:20 · The simulator — the core of the product

Click **Simulate this**.

> "This is the central feature: three groups of inputs, deliberately kept apart.
> The policy itself — read only, ten cents a bag, cannot be edited here. Your
> household — facts you can look up. And what-if settings — hypothetical levers,
> badged *does not change the policy*."

Drag **"Share of trips using reusable bags"** from **0%** to **100%** slowly.

> **[SET THIS UP FIRST.]** These figures are true for a household of **4 grocery
> trips a week with 3 disposable bags per trip**. Set those two fields before
> recording, or the numbers on screen will not match this script. On the default
> profile (2 trips × 3 bags) the same sweep reads $2.60 / $1.95 / $1.30 / $0.00.

> "At zero percent adoption this costs about five dollars twenty a month. At a
> quarter, three ninety. At half, two sixty. At full adoption it is zero, and you
> avoid fifty-two bags a month. Watch the cost tile stay in the costing colour the
> whole way down — a household in this position never *saves* money by starting to
> pay a fee it was not paying before."

Tick **"Explore a hypothetical fee instead of the policy's rate"**, drag up.

> "Here is the integrity point. I am now modelling a hypothetical twenty-five cent
> fee — and the policy's real ten cent rate is still on screen, unchanged. A
> what-if value never edits the policy."

---

## 2:20 — 2:55 · Show the working

Expand **"How this is calculated"**, then **"Show the calculation steps"**.

> "Every formula, in order, with this household's numbers substituted. Monthly
> trips. Baseline bags. Remaining bags. Fees avoided. Nothing hidden."

Expand **"Show the assumptions used"**.

> "Every assumption tagged by origin: from the policy, from your household,
> illustrative default, or your what-if setting. The sixty-five percent eligible
> share for composting is labelled as *our assumption*, not a measurement."

Point at **"What is deliberately not modelled"**.

> "No emissions, no health effects, no tonnage — because we have no documented
> conversion factor, and inventing one would make every other number less
> trustworthy."

---

## 2:55 — 3:20 · The engineering, and the bug that mattered

*Switch to a terminal or the editor.*

> "It is one pure function used by every surface — the dashboard, the simulator,
> the community comparison, the printable summary. That is why they cannot
> disagree. Eighty-nine tests across six files pin the boundaries."

*Cut to the live deployed site, still showing the old build.*

> "Here is the part worth showing you. On the deployed build, this same household
> at fifty percent adoption reads **minus two sixty, in green, 'pays less than the
> baseline'**. That is wrong — the household is newly paying a fee, so it is worse
> off, not better. The old code compared the simulated world against itself instead
> of against a world without the policy.
>
> The fix was three lines. The interesting part is the test: I reverted the fix and
> watched six tests fail, including one asserting the household was *profiting*
> nineteen dollars by buying twelve dollars of reusable bags. **[This is the
> Learning criterion: say what you got wrong and how you found it.]**"

---

## 3:20 — 3:50 · Different households, same maths

Click **Community**, then **Composting** in the comparison.

> "This is how circumstances are shown to matter without making claims about
> people. Each row is a different *set of inputs* through the same formulas — a
> renter with no outdoor space, a homeowner with a garden, a six-person household,
> someone with no convenient collection. It compares arithmetic, not demographics."

---

## 3:50 — 4:20 · Take action

Click **Action Center**. Tick two items.

> "Checklist progress saves locally. Questions worth asking. A getting-started
> guide."

Scroll to the draft, click **Copy draft**.

> "An editable comment in your own words. Copy puts it on the clipboard — and
> PolicyPulse has no send capability at all. Nothing leaves this device."

Click **Printable impact summary**, then **Print or save as PDF**.

> "The whole thing prints as a one-page summary: the policy, the household profile,
> the results, every assumption and every formula, with the disclaimer top and
> bottom."

---

## 4:20 — 4:45 · Close on the honesty layer

*Back to the dashboard, demo badge visible.*

> "Everything you have seen is fictional and labelled as fictional at every step.
> There is no live feed and we do not pretend otherwise. A demo that implies live
> coverage would be worse than one that admits what it is."

---

## 4:45 — 5:00 · Closing line

> "PolicyPulse: one policy, in plain language, personalised to your household,
> simulated with your own numbers, ending in something you can actually do — with
> the working shown and the fiction labelled at every step."

---

## Timing discipline

| Segment | Budget | If you overrun, cut from |
| --- | --- | --- |
| Problem + attribution | 0:25 | Nothing — this is required |
| Honest data | 0:20 | Shorten the Portland detour |
| Household snapshot | 0:20 | Drop the tile-by-tile narration |
| Policy detail | 0:25 | Skip the contacts beat |
| Simulator | 0:50 | Nothing — this is the product |
| Show the working | 0:35 | Collapse the assumptions beat |
| Engineering + the bug | 0:25 | Nothing — this is the Learning criterion |
| Community | 0:30 | Cut to one sentence |
| Action Center | 0:30 | Cut to one sentence |
| Close | 0:25 | Keep the last line verbatim |

**Never cut:** the attribution sentence, the simulator sweep, and the bug story.
Those three carry Adherence, Originality and Learning respectively.
