# UI Review — PolicyPulse

Audit performed 2026-09-19 against the production build (`npm run build`), served
on `localhost:3130` in demo mode. Every claim below was measured in a real browser;
nothing is asserted from reading source alone.

Instrument: Playwright's Chromium driven over the DevTools Protocol (no npm
dependencies). Scripts live outside the repo in `C:\Users\User\Desktop\pp-t2\`.
Coverage: **7 routes × 4 viewports = 28 combinations**, plus keyboard traversal,
the Chrome accessibility tree, and an emulated print stylesheet.

---

## Verdict

The interface is **well done** — noticeably above the standard for a hackathon
entry. It has a real design system rather than default Tailwind, an information
hierarchy that survives contact with dense data, and accessibility work that most
submissions skip entirely.

Two genuine defects were found and fixed. Three things I initially flagged turned
out to be **my own measurement errors**, not product problems; those are recorded
below so the same ground is not re-covered.

---

## Defects found and fixed

### 1. Body text failed WCAG AA contrast almost everywhere — 985 instances

`--pp-ink-faint` (`#7c8373`) is the app's muted-text token. Measured against every
surface it is painted on:

| Surface | Old ratio | AA needs | New (`#63695c`) |
|---|---|---|---|
| paper `#faf7f0` | 3.67 | 4.5 | **5.30** |
| paper-raised `#fffdf9` | 3.86 | 4.5 | **5.58** |
| paper-sunken `#f2ece0` | 3.34 | 4.5 | **4.82** |
| forest-50 `#f1f7f2` | 3.61 | 4.5 | **5.22** |
| teal-50 `#eff9f8` | 3.66 | 4.5 | **5.28** |
| amber-50 `#fdf7ed` | 3.68 | 4.5 | **5.32** |
| clay-soft `#f6e9e5` | 3.31 | 4.5 | **4.78** |

It failed on **all seven**. This was the single largest defect in the interface:
**961 of the 985** failing text instances. It covers eyebrows, captions, helper
text, table headers, timestamps, the footer disclaimer and half the page chrome.

The replacement keeps the identical hue and saturation — only lightness moved — so
the warm-grey character is preserved rather than shifted toward olive.

**Mechanism, which matters:** `ink` maps to `var(--pp-ink-faint)` in
`tailwind.config.ts`, so editing `globals.css` is sufficient.

### 2. Clay text failed on the callout it is paired with — 24 instances

`--pp-clay` (`#b4553f`) passed on paper (4.55) but failed on **its own `clay-soft`
`#f6e9e5` background** (4.11) and on `paper-sunken` (4.14). Since `clay-soft` exists
precisely to host clay text, this was a token pair that could not work.

Darkened to `#9c422e` — worst case **5.48** across all seven surfaces.

The worst instance was the **"Boundaries and caveats in this estimate"** panel: the
project's honesty disclosure was rendered in the least-readable colour on the page.
For a submission judged on integrity, that is the worst place to have unreadable text.

**Mechanism, which almost caused a silent failure:** `clay` was **hardcoded** in
`tailwind.config.ts` as `#b4553f`, *not* mapped to `var(--pp-clay)`. All 20
`text-clay` usages resolve through Tailwind, and `var(--pp-clay)` is referenced
**nowhere** in the codebase. Editing only `globals.css` would have changed nothing
while appearing to be a fix. Both files were edited; both were verified in the
compiled CSS.

### 3. Horizontal overflow at 320px on `/impact-summary`

At a 320px viewport the page scrolled sideways (`scrollWidth` 330 vs viewport 320).

Cause: the two data tables in `impact-summary.tsx` used bare
`<table className="w-full ...">`. In the 41px-indented section, four columns cannot
compress below their intrinsic width, so `w-full` overflowed the page instead.
The 320px-wide bottom nav was a **symptom**, not the cause — being
`fixed inset-x-0`, it stretched to the document's `scrollWidth`.

Fix: wrapped both tables in `overflow-x-auto` with `min-w-[30rem]`. This is the
idiom **already used** in `results.tsx` and `scenario-compare.tsx`;
`impact-summary.tsx` was the one table that had missed it.

### 4. Every card was a `banner` landmark

`CardHeader` in `ui/card.tsx` rendered a bare `<header>`. Because `Card` is a
generic reusable component, a page with 11 cards exposed **11 `banner` landmarks**,
making landmark navigation useless to screen-reader users. Sibling components
`CardBody` and `CardFooter` already used `<div>`; only the header broke the pattern.

Changed to `<div>`. Header landmark counts went from a maximum of **11 → 2**, and
the two remaining are legitimate (`app-shell` sticky header plus one page header).

### 5. Duplicate navigation landmark labels

`app-shell.tsx` had **two** `<nav>` elements both labelled `"Primary"` — the
desktop sidebar and the mobile bottom bar. Identical accessible names make the
regions indistinguishable. Relabelled `"Sections"` (sidebar) and
`"Primary sections"` (bottom bar).

### 6. Heading level skipped on `/policies` (h1 → h3)

The page `h1` is "5 policies to explore"; each `PolicyCard` contributes an `h3`.
With no `h2` between, heading-level navigation jumped 1 → 3. Added a visually
hidden `<h2>Matching policies</h2>` labelling the results list — no visual change.

---

## Verified as correct (measured, not assumed)

| Check | Result |
|---|---|
| Contrast failures, 28 combinations | **0** (was 985) |
| Horizontal overflow, 4 viewports | **0** (was 1) |
| `h1` per page | exactly 1 on all 7 routes |
| Unnamed interactive nodes (Chrome AX tree) | **0** across 6 routes |
| Keyboard focus indicator | present on **every** tab stop |
| Skip link | first tab stop, visible when focused, targets `#main` |
| Offscreen focus stops | 0 |
| Reduced-motion support | `prefers-reduced-motion` honoured |
| Print: nav chrome | `any nav painted: false` on both routes tested |
| Print: content survival | 4,231 / 4,942 chars retained, tables kept |
| Print: body background | switches to white |
| Font families | 3 (system-ui, Iowan Old Style, ui-monospace) |
| Distinct font sizes per page | 6–8 |
| Colour tokens | warm paper / forest / teal / amber / clay, used consistently |

**Focus visibility** deserves a note: Chrome's default outline is suppressed in
places and replaced by an explicit `2px rgb(24,117,116)` (`--pp-focus`) outline and
`focus-visible:ring-*` utilities. Range inputs get their own treatment because the
thumb is the true target. This is the detail most projects get wrong.

**Print support is genuinely good.** Printing `/impact-summary` keeps a footer
carrying the legal and provenance disclaimers, while printing `/simulator` strips
all chrome. Card borders are preserved, shadows removed, and `break-inside: avoid`
is set on cards and tables.

---

## Three of my own findings were wrong

Recorded because a green result that means less than it appears is the failure mode
worth guarding against — including when the auditor is the one producing it.

1. **I reported the bottom nav as overflowing at 320px.** It did not. My probe
   selected `nav[aria-label="Primary"]` and matched the *sidebar* first (both navs
   shared that label). Re-targeted at the fixed element, the nav fits cleanly: 5 ×
   63px at 320px with `docScrollW = 320`.

2. **I reported `(NO NAME)` on a radio button.** It is correctly named. The radio is
   wrapped in a `<label>` containing a visible `<span>`; my script only checked
   `aria-label`, `aria-labelledby` and `label[for=…]`, missing the ancestor-label
   case. Chrome's own accessibility tree reports **0 unnamed interactive nodes** and
   names all 5 radios on the simulator and all 6 on the community page.

3. **I reported the sidebar nav as surviving into print.** It does not. I tested the
   inner `<nav>`, whose own `display` is `block`, without checking whether an
   ancestor was `display: none`. The `<aside>` carries `pp-no-print`. With an
   ancestor-aware check, no navigation is painted in print on any route.

Separately: two shell greps returned **empty** and briefly read as "the defect is
gone" when the instrument was simply incapable of seeing it — one because `/tmp`
does not exist in this shell, one because the simulator's figures are computed
client-side after hydration and never appear in the served HTML.

The lesson generalises: **an empty result is not a passing check.** Before treating
"found nothing" as "nothing there", confirm the instrument could have found it.

---

## Design assessment

**Strengths.** The token layer is deliberate — warm off-white paper, deep forest
green as the primary, clay reserved for cost, amber for caution. Typography pairs a
system sans for data with an editorial serif for display, which is what makes the
headings feel considered rather than templated. Shadows and easing are custom.

The informational design is the real achievement. The simulator does not just show a
number: it shows the number, the formula trace, the assumptions with sources, the
baseline it compares against, and an explicit "Boundaries and caveats" panel. The
comparison chart prints its values as text so the graphic is never the only carrier
of meaning. This is what "adherence to track" should look like for a policy tool.

**Honest limitations.**

- The `--pp-amber` token (`#b36216`) measures **4.20** on paper — below AA for
  normal text. It is **not reachable**: the amber text in the UI uses the Tailwind
  scale (`text-amber-700/800/900`), and `#b36216` appears in **zero** rendered text
  instances. Latent only; left alone rather than restyling the design for no gain.
- `BASELINE_COLOR #b9ad95` in `comparison-chart.tsx` measures **2.07** on paper,
  under the 3.0 threshold for meaningful graphics. Mitigated: the value is printed
  as text and named in a legend, so nothing depends on perceiving the bar. A polish
  item, not a defect.
- `comparison-chart.tsx` hardcodes `#b4553f` as `SIMULATED_WORSE_COLOR`, duplicating
  the old clay value instead of referencing the token. It is a chart *fill* (3.0
  threshold, passes), but the duplication means it will drift from the token over
  time. Worth consolidating; not changed, because it is not a defect today.

---

## Result

```
npm run typecheck   PASS (clean)
npm run lint        PASS (clean)
npm run test        89/89 across 6 files
npm run build       PASS — 11 routes
```

Contrast failures **985 → 0**. Overflow routes **1 → 0**. Heading jumps **4 → 0**.
Landmark pollution **11 headers → 2** per page.
