---
name: katebonner.ai
description: A personal site drawn as a pulse-sequence diagram — label column, ruled lanes, one time axis, two channel hues.
colors:
  paper: "#FFFFFF"
  ink: "#14161A"
  ink-2: "#4A4F57"
  rule: "#D8DBE0"
  rule-2: "#EEF0F3"
  ch-i: "#1F77B4"
  ch-i-ink: "#175C8C"
  ch-i-tint: "#E0ECF4"
  ch-i-tint-2: "#BCD6E8"
  ch-q: "#FF7F0E"
  ch-q-ink: "#9A4A00"
  ch-q-tint: "#FFEBD8"
  ch-q-tint-2: "#FFD3AD"
typography:
  display:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 1rem + 1.8vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  body:
    fontFamily: "STIX Two Text, Times New Roman, Times, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.06em"
  mono:
    fontFamily: "B612 Mono, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
rounded:
  hairline: "2px"
spacing:
  unit: "8px"
  half: "4px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
  gutter: "40px"
  gutter-narrow: "24px"
  gutter-mobile: "16px"
  label-w: "360px"
  bar-h: "56px"
  lane-h: "72px"
  axis-h: "32px"
components:
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "5px 10px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  pulse-i:
    backgroundColor: "{colors.ch-i-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "6px 12px"
  pulse-i-hover:
    backgroundColor: "{colors.ch-i-tint-2}"
  pulse-q:
    backgroundColor: "{colors.ch-q-tint}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "6px 12px"
  pulse-q-hover:
    backgroundColor: "{colors.ch-q-tint-2}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    padding: "6px 0"
  nav-link-active:
    textColor: "{colors.ink}"
  readout:
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
  code-block:
    backgroundColor: "{colors.rule-2}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.hairline}"
    padding: "16px"
---

# Design System: katebonner.ai

## Overview

**Creative North Star: "The Pulse-Sequence Diagram"**

Every page is drawn the way quantum-control people sketch an experiment: a label column on the left, ruled channel lanes stacked to the right, one time axis with ticks along the bottom, and shaped pulses placed in time. The Home page is literally that diagram, with a clock driving a hairline cursor across three lanes while a free-particle wavepacket evolves in the state lane. Content pages keep the same skeleton (label column, hairline divider, body) and simply put a title in the label cell and prose in the lane. Nothing is decorated; every line on the page is a rule, an axis, a divider, or the border of a pulse.

The material is white paper and near-black ink. Structure is carried by 1px hairlines at two strengths (a light grey for lane rules and dividers, full ink for the time axis ends and the cursor). Colour appears only as the two channel hues from the audience's own matplotlib figures, blue for channel I and orange for channel Q, and only as filled pulse envelopes: a pale opaque tint with a saturated 1px border. Text never takes the raw hue; it takes the darker ink variant of the channel. Three type sizes plus one display size cover the whole site, and hierarchy comes from weight, case, and rules rather than from scale.

Density is instrument-like: 56px bar, 72px lanes, 32px axis, 8px grid. Motion is confined to the sequence itself (the cursor, the wavepacket, a 200ms tint change on the pulse under the cursor) and is removed under `prefers-reduced-motion`. The site refuses the portfolio arrangement (name, tagline, avatar, three cards) and the full-bleed hero with text over motion.

**Key Characteristics:**
- Label column plus ruled lanes on every page; the divider hairline is the site's spine.
- Two channel hues, used only as tinted, bordered pulse envelopes; darker ink variants for links and channel text.
- Three text sizes (13 / 17 / 22px) plus one clamped display size; rank by weight, case, and rules.
- Three faces with fixed jobs: Barlow labels and headlines, STIX Two Text prose, B612 Mono readouts and ticks.
- Flat. No drop shadows; depth is a hairline or a tint.
- Corners are almost square (2px) everywhere a box appears.

## Colors

A white ground with near-black ink and two matplotlib channel hues; everything else is a grey hairline.

### Primary
- **Channel I Blue** (`ch-i`): the first channel hue. Fills the wavepacket ribbon and its axes in the state lane, the border of blue pulses and timeline blocks, the focus outline (2px solid, 2px offset), and the favicon stroke. Never used as text.
- **Channel I Ink** (`ch-i-ink`): the darker, text-safe blue. Default link colour body-wide, the contact links in the state lane, and the hover colour of note titles.
- **Channel I Tint** (`ch-i-tint`) / **Channel I Tint 2** (`ch-i-tint-2`): opaque pale blues (channel blue at roughly 14% and 30% on white). Tint is the resting fill of blue pulses and timeline blocks; Tint 2 is their hover / cursor-active fill and the text selection colour.

### Secondary
- **Channel Q Orange** (`ch-q`): the second channel hue. Border of orange pulses and timeline blocks only.
- **Channel Q Ink** (`ch-q-ink`): the text-safe orange, reserved for channel-Q text if it is ever needed; the shipped pages do not yet place orange text.
- **Channel Q Tint** (`ch-q-tint`) / **Channel Q Tint 2** (`ch-q-tint-2`): opaque pale oranges (roughly 16% and 34% on white). Resting fill and hover / active fill of orange pulses and timeline blocks.

### Neutral
- **Paper** (`paper`): the page ground, the outline button's fill, and the button's hover text.
- **Ink** (`ink`): body text, headings, pulse text, the axis end ticks, the cursor line and its dot, the active nav underline, the button border, and the hover state of every grey link.
- **Ink 2** (`ink-2`): secondary text. Labels, nav links at rest, axis tick numerals, timeline years, meta lines, figcaptions, the state-lane subline, and the pulse arrow at rest.
- **Rule** (`rule`): the structural hairline. Lane bottoms, the label-column divider, the top bar bottom, the footer top, list row dividers, axis ticks, timeline borders.
- **Rule 2** (`rule-2`): the faint hairline and the only grey surface. Timeline row rules, the mobile clock divider, code-block background, and the `:target` highlight on a timeline entry.

### Named Rules
**The Two Channels Rule.** Only two hues exist, channel I blue and channel Q orange, and they appear only as a pulse envelope: tint fill plus 1px hue border. Text in a channel colour uses the `-ink` variant, never the raw hue. A third hue is not a third channel; it is a mistake.

**The Hairline Rule.** All structure is a 1px line. Grey (`rule`) for lane rules and dividers; ink for the axis start and end ticks, the cursor, and the timeline "now" line. Nothing thicker than 1px draws structure; the 2px focus ring is the sole exception and it is state, not structure.

## Typography

**Display Font:** Barlow (with Helvetica Neue, Arial, sans-serif) — weights 400, 500, 600, self-hosted
**Body Font:** STIX Two Text (with Times New Roman, Times, serif) — 400, 400 italic, 600, Latin and Greek subsets, self-hosted
**Label/Mono Font:** B612 Mono (with SFMono-Regular, Menlo, Consolas, monospace) — 400, self-hosted

**Character:** A technical grotesk for the labels of the diagram, the physics-publishing serif for the prose beside it, and an instrument-panel mono for anything that is a number. Each face has one job and they never trade.

### Hierarchy
- **Display** (Barlow 600, `clamp(1.9rem, 1rem + 1.8vw, 2.25rem)`, 1.15, -0.005em, balanced): the `h1` in the label cell. On Home it is the headline of the state lane, capped at 12ch wide; on content pages it is the page title and sticks at 40px from the top while the body scrolls.
- **Headline** (Barlow 600, 22px, 1.15): `h2` section titles inside prose, with 40px above and 12px below.
- **Title** (Barlow 600, 17px, 1.15): `h3`, used for timeline entry names. Also Barlow 500 at 17px for note-list titles and the top-bar wordmark.
- **Body** (STIX Two Text 400, 17px, 1.55): all prose, capped at a 66ch measure. Paragraph gap 16px. The state-lane subline is body type in `ink-2` at a 30ch cap.
- **Label** (Barlow 500, 13px, 0.06em, UPPERCASE, `ink-2`): lane labels, nav links, the outline button, the axis label, footer label. The same face and size in sentence case with 0.01em tracking is the text inside pulses; at 0.02em it is the wavepacket's axis labels; without tracking it is figcaptions, note teasers, and timeline block names.
- **Mono** (B612 Mono 400, 13px, tabular numerals): the `t = 0.00` readout, axis ticks, timeline years and entry numbers, the channel index beside each lane label, meta lines, contact lines, footer links, and inline code (at 0.92em inside prose).

### Named Rules
**The Three Sizes Rule.** 13, 17, and 22px plus one display clamp. Hierarchy is made with weight (500 vs 600), case (uppercase labels), colour (`ink` vs `ink-2`), and rules, not with new sizes.

**The Number Is Mono Rule.** Anything that reads as a measurement (time, year, index, tick) is set in B612 Mono with tabular numerals, even when it sits inside a Barlow label.

## Layout

Every page is a two-column grid: a 360px label column on the left and a fluid body on the right, divided by a `rule` hairline that runs the full height of the page through the top bar, the lanes, the content area, and the footer. Horizontal gutters are 40px on both sides of the divider at desktop, 24px at or below 1100px, and 16px at or below 860px. The 8px grid governs vertical rhythm: 16px paragraph gaps, 24px figure margins, 40px page padding, 64px bottom padding.

The Home sequence stacks: a 56px top bar (wordmark, nav, mono readout with pause button); the state lane at `min(56vh, 620px)` holding the headline in the label cell and the wavepacket at full lane width; three 72px block lanes, each labelled with a mono channel index and an uppercase name, each holding one pulse positioned in time by `--t0` / `--t1` fractions of the lane width; and a 32px time axis with ticks every 0.2 and an ink tick at each end. A single cursor spans the three lanes and the axis, positioned by `--u`. The footer repeats the two-column grid at 56px minimum height.

Content pages put the `h1` in the label cell (sticky at 40px) and a `.prose` block in the body at a 66ch measure. Wider figures break the measure: the Projects figure runs to 960px between two hairlines, the notes list to 760px, and the About timeline to the full body width with horizontal scroll (minimum 880px grid).

Responsive: at 860px the label column collapses to 0 and every grid becomes one column with the label cell stacked above its body; the divider disappears and the state-lane label gains a faint bottom rule instead. The wavepacket takes a 16:10 aspect ratio, pulses become full-width 44px-minimum blocks, the nav tightens to 14px gaps, and the clock readout drops to a second 40px row of the top bar. At 480px every other axis tick is hidden and display-math shrinks with a right-edge fade.

## Elevation & Depth

Flat. There are no drop shadows anywhere in the system; depth is stated by hairlines and tints. A pulse under the cursor or the pointer steps from its tint to its tint-2 and draws a 1px inset ring in its hue, which reads as the envelope being "on" rather than lifted. The only spread shadow in the CSS is a 0-blur, 8px `rule-2` halo on a `:target`ed timeline entry, which is a highlight bleed, not elevation.

### Named Rules
**The No Lift Rule.** Nothing casts a shadow. State is shown by a tint step, an inset hairline, an underline, or an ink swap, never by elevation.

## Shapes

Rectangles with barely-rounded corners. Every box (pulse, timeline block, outline button, code block) uses a 2px radius; an open-ended timeline block squares its right edge (`2px 0 0 2px`) and drops its right border to show it runs to now. The cursor's foot is a 5px ink dot, the only circle on the site. Borders are always 1px. The pulse arrow is a stroked 16x12 inline SVG chevron with round caps at 1.5px, inheriting `currentColor`.

## Components

### Buttons
The single button is an instrument switch: uppercase label type inside a hairline box.
- **Shape:** near-square (2px radius), 1px ink border, minimum width 6.5em.
- **Outline:** paper fill, ink text, 5px 10px padding.
- **Hover / Focus:** hover inverts to ink fill with paper text (no transition); focus uses the global 2px `ch-i` outline at 2px offset. Disabled drops to 45% opacity.

### Pulses (Home lanes)
The signature block: a filled channel envelope positioned in time.
- **Shape:** 2px radius, 1px border in the channel hue, absolutely placed with `left: t0 * 100%` and `width: (t1 - t0) * 100%`, inset 9px from the lane top and bottom.
- **Fill / Text:** channel tint with ink text in Barlow 500 13px, balanced; an `ink-2` arrow pushed to the right edge.
- **Hover / Active:** background steps to tint-2 and an inset 1px ring in the hue appears, over 200ms with `cubic-bezier(0.16, 1, 0.3, 1)`; the arrow goes to ink. `is-active` is set by the clock when the cursor lies within `[t0, t1)`. Transition removed under reduced motion.

### Timeline Blocks (About)
The same envelope on a month grid: 30px tall, 2px radius, tint fill, hue border, 1px horizontal margin, a mono entry number, a name that ellipsises, and a mono date range that hides via container queries as the block narrows (dates below 190px, name below 92px). Open blocks lose their right border and radius. Hover and focus step to tint-2.

### Cards / Containers
There are no cards. Grouped content is separated by `rule` hairlines above and below (the Projects figure, the notes list rows, timeline entries), with 16px vertical padding.

### Inputs / Fields
The only input is the invisible range scrubber laid over the time axis (`cursor: ew-resize`, transparent track and thumb, focus ring inset). No text inputs exist.

### Navigation
- **Top bar:** 56px, wordmark in Barlow 600 17px `ink`, nav links as uppercase labels in `ink-2` with a transparent 1px bottom border; hover goes to `ink`, the current page gets an ink underline. Right slot holds the mono readout and pause button when the sequence is live. Below 860px the nav packs right and the clock drops to a 40px second row divided by a `rule-2` hairline.
- **Lane labels:** an uppercase label preceded by a mono channel index in `ink-2`, hovering to `ink`.
- **Footer:** a "Contact" label in the label cell, mono links in the body.

### Time Axis and Cursor
A 32px ruled row: `rule` hairline ticks with mono numerals beside them, the first and last tick in ink. The cursor is a 1px ink line with a 5px dot at its foot, positioned by `--u` across the lane body, hidden until the clock runs.

### Readouts and Meta
Mono 13px with tabular numerals. The clock readout is ink, right-aligned, minimum 12ch; meta lines, tick numerals, and years are `ink-2`.

## Do's and Don'ts

### Do:
- **Do** start every page from the label column + hairline divider + body grid; the divider is what makes a page belong to the site.
- **Do** put colour only in a pulse envelope: tint fill, 1px hue border, ink text. Use `ch-i-ink` for links.
- **Do** set every number (time, year, index, tick) in B612 Mono with tabular numerals.
- **Do** use 1px `rule` hairlines to separate grouped content instead of cards or backgrounds.
- **Do** keep to 13 / 17 / 22px plus the display clamp and rank with weight, case, and `ink` vs `ink-2`.
- **Do** keep the light theme, AA contrast, keyboard focus (2px `ch-i` outline), and a reduced-motion / no-WebGL static fallback for anything animated.

### Don't:
- **Don't** add drop shadows, gradients, or grey panels; the only grey surface is `rule-2` behind code and a targeted entry.
- **Don't** use raw `ch-i` or `ch-q` as text colour, and don't introduce a third hue.
- **Don't** use a radius larger than 2px on any box.
- **Don't** add a fourth typeface or let the faces swap jobs (no serif labels, no grotesk prose, no mono headlines).
- **Don't** place a photo, avatar, logo strip, or card grid; the site refuses the portfolio arrangement.
- **Don't** draw structure heavier than 1px; a 2px line means focus, nothing else.
