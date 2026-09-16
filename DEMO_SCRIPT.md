# PolicyPulse — Two-Minute Demo Script

**Earth Forward hackathon · waste reduction and recycling**

> **Before you start:** `npm run dev`, open `http://localhost:3000`, and clear site data
> once so the demo starts from a clean state. Keep the browser at ~1280 px wide to show
> the desktop sidebar; the mobile layout is worth a ten-second aside at the end.

---

## 0:00 — 0:12 · Frame the problem

> "Local environmental policy is published, but almost nobody can tell what it means for
> *their* household. PolicyPulse closes that gap: pick a place, add six details about
> your home, and see the impact — with the maths shown."

*On screen:* the Overview setup page.

---

## 0:12 — 0:25 · Honest data, from the first click

Click **"Use the demonstration city"**.

> "Before anything else — this is a demonstration. Cedar Hollow is fictional, the postal
> code is a reserved placeholder, and every policy and date is written for this hackathon.
> That amber **Demo data** badge is always on screen, and you can open it at any time."

Click the **Demo data** badge to expand the explanation, then close it.

> "We also refuse to fake coverage. If you type a real city…"

Type `Portland` and click **Check coverage**.

> "…you get *coverage unavailable*, and an explicit button to use the demo instead. Demo
> policies are never silently swapped in for a real place."

Click **Explore the demonstration city instead**.

*Optional 5-second aside:* point at the sidebar location card — it says *Illustrative
demo policies · not live data* and keeps saying it.

---

## 0:25 — 0:40 · The household snapshot

*On screen:* the personalised dashboard.

> "This is the household snapshot. Three policies are in effect or adopted; proposed ones
> are counted separately because they aren't law yet. One policy per scenario — two bag
> fees would charge the same shopping trips twice, so we never add them up."

Point at the four tiles: **Policies for you**, **Monthly cost change**, **Bags avoided**,
**Food waste diverted**.

> "Upcoming dates come from the policies themselves. Every one is labelled as
> illustrative, because none of them is a real deadline."

---

## 0:40 — 1:00 · Understand a policy in plain language

Click **Policy Explorer** in the sidebar, then open **Single-Use Carryout Bag Fee**.

> "Four questions, in the same order every time: What changes? Who is affected? What can
> I do? And what assumptions or uncertainties should I know?"

Scroll through the sections. Point at the amber strip.

> "Every record carries its provenance. There's no external document to link, and we say
> so, rather than implying a source we don't have."

Point at **Who to contact**.

> "Contacts are placeholders on reserved `.example` domains and a 555 number. They can't
> reach a real person. We only show a linkable official contact when one has actually
> been verified."

---

## 1:00 — 1:25 · The simulator — the core of the product

Click **Simulate this**.

> "This is the central feature. Three groups of inputs, deliberately kept apart."

Point at each in turn:

> "**The policy itself** — read-only. Ten cents a bag. Cannot be edited here.
> **Your household** — facts you can look up.
> **What-if settings** — hypothetical levers, badged *Does not change the policy*."

Drag **"Share of trips using reusable bags"** from **0%** to **100%**.

> "Watch everything move at once: the cost, the bags avoided, the chart, and the
> narrative underneath."

Point at the headline.

> "At 0% adoption this costs about five dollars a month. At 100% it's zero and you avoid
> fifty-two bags a month."

Now tick **"Explore a hypothetical fee instead of the policy's rate"** and drag the
what-if fee up.

> "And here's the integrity point: I'm now modelling a hypothetical 25-cent fee — but the
> policy's real 10-cent rate is still shown right there. Changing a what-if value never
> edits the policy."

---

## 1:25 — 1:40 · Show the working

Expand **"How this is calculated"**, then **"Show the calculation steps"**.

> "Every formula, in order, with my own numbers substituted. Monthly trips equals weekly
> trips times 52 divided by 12. Baseline bags. Remaining bags. Fees avoided. Nothing is
> hidden."

Expand **"Show the assumptions used"**.

> "And every assumption is tagged by where it came from: *From the policy*, *From your
> household*, *Illustrative default*, or *Your what-if setting*. The 65% eligible share
> for composting, the 10 lb of recyclables per person — all flagged as our assumptions,
> not measurements."

Point at the **"What is deliberately not modelled"** note.

> "No emissions, no health effects, no tonnage. Only the arithmetic you can see."

---

## 1:40 — 1:50 · Different households, same maths

Click **Community**.

Click **Composting** in the scenario comparison.

> "This is how we show that circumstances matter without making claims about people.
> Each row is a different *set of inputs* run through the same formulas: a renter with no
> outdoor space, a homeowner with a garden, a six-person household, someone with no
> convenient collection. It compares arithmetic, not demographics."

---

## 1:50 — 2:00 · Take action

Click **Action Center**. Tick two checklist items.

> "Checklist progress saves locally. Questions worth asking. A getting-started guide."

Scroll to the draft, click **Copy draft**.

> "An editable comment in your own words. Pressing copy puts it on the clipboard —
> PolicyPulse has no send capability at all. Nothing leaves this device."

Click **Printable impact summary**, then **Print or save as PDF**.

> "And the whole thing prints as a one-page summary — policy, household profile, results,
> every assumption, every formula, with the disclaimer at the top and bottom."

---

## Closing line

> "PolicyPulse: one policy, explained in plain language, personalised to your household,
> simulated with your own numbers, and ending in something you can actually do — with the
> working shown at every step and the fiction labelled at every step."

---

## Likely judge questions

**"Is any of this real?"**
> No. Every policy, date, cost and contact is fictional and labelled. There is no live
> feed. That is a deliberate choice: a demo that implies live coverage is worse than one
> that is honest about being a demo.

**"How would you make it real?"**
> Set `POLICY_FEED_URL` and `POLICY_FEED_JURISDICTION_ID`. The HTTP adapter validates
> every record, attaches jurisdiction and retrieval date, times out safely, and falls back
> to demo on failure. No component changes.

**"Why not show CO₂ saved?"**
> Because we have no documented conversion factor, and inventing one would make every
> other number less trustworthy. We report pounds diverted and counts avoided, and say
> plainly that nothing else is modelled.

**"How do we know the maths is right?"**
> It is one pure function used by every surface in the app. 44 unit tests cover the
> boundaries: zero trips, zero fee, 0% and 100% adoption, zero participation, zero and
> full contamination, capped and uncapped rewards, negative and `NaN` inputs, and
> monthly-to-annual consistency.

**"What is the hardest part you got right?"**
> Keeping real policy rules and hypothetical settings from blurring. The policy's own
> value stays on screen and read-only at all times, and any what-if value is carried
> through the result as a labelled override.

**"Does it work without a network?"**
> Yes. No credentials, no API keys, no external services. Everything runs locally, and
> nothing you type leaves the browser.

---

## If something goes wrong

| Symptom | Recovery |
| --- | --- |
| Page shows the setup screen instead of the dashboard | Click **Use the demonstration city** — you cleared site data |
| Numbers look like the defaults | That is expected; the demo starts from illustrative defaults |
| Copy button reports it is blocked | Use the plain-text preview and copy manually; the fallback handles most cases |
| Storage warning appears | Private browsing — the app still works, nothing persists |

Keep this tab open as a fallback: **Overview → Data & privacy → Reset all** restores a
known-good state in one click.
