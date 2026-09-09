---
name: katebonner.ai
description: A pulse-sequence diagram drawn as a mechanical drawing sheet — black ink on white paper in three line weights, hatched fills, one drafting-red accent.
colors:
  paper: "#FFFFFF"
  ink: "#111111"
  ink-2: "#4E4E4E"
  red: "#D0202A"
typography:
  display:
    fontFamily: "Share Tech, Saira, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 1rem + 1.8vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Share Tech, Saira, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0.08em"
  title:
    fontFamily: "Share Tech, Saira, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0.06em"
  body:
    fontFamily: "Atkinson Hyperlegible, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Share Tech, Saira, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.12em"
  mono:
    fontFamily: "Share Tech Mono, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  sheet-mark:
    fontFamily: "Share Tech Mono, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  square: "0"
  balloon: "50%"
spacing:
  hair: "2px"
  half: "4px"
  xs: "6px"
  unit: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
  frame: "14px"
  sheet-pad: "24px"
  label-w: "360px"
  bar-h: "56px"
  lane-h: "64px"
  axis-h: "32px"
  dim-h: "22px"
components:
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "5px 12px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  pulse:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0 8px"
  pulse-active:
    textColor: "{colors.red}"
  pulse-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "3px 6px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "6px 0"
  nav-link-hover:
    textColor: "{colors.red}"
  lane-label:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "16px 24px"
  readout:
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
  title-block-key:
    textColor: "{colors.ink-2}"
    typography: "{typography.sheet-mark}"
  title-block-value:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  title-block-cell:
    padding: "4px 10px 6px"
  balloon:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.balloon}"
    size: "26px"
  code-block:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.square}"
    padding: "16px"
---

# Design System: katebonner.ai

## Overview

**Creative North Star: "The Drawing Sheet"**

Every page is a mechanical drawing sheet with a pulse-sequence diagram drawn on it. A thick border with zone numbers across the top and bottom and zone letters down the sides frames the viewport; a title block (title, sheet, rev, date, scale, email, LinkedIn) closes every page. Inside the sheet, the pulse-sequence skeleton quantum-control people sketch: a 360px label column divided from the lanes by a medium line, channel lanes ruled underneath, a dimension line across the top, and a ruled time axis along the bottom. The Home page is literally that diagram, with a clock driving a red dash-dot cursor across three lanes while a free-particle wavepacket evolves in the state lane under a live dimension. Content pages keep the same sheet and the same label-column spine and put a title in the label cell and prose in the lane.

The material is white paper and black ink, nothing else. Structure is carried by three line weights, exactly as a drafting standard would assign them: thin (1px) for construction lines, dimension lines, hatching, ticks, and the center line; medium (1.5px) for visible edges, frames, the label-column divider, and the top bar rule; thick (2.5px) for the sheet border alone. Fills are never tints: a pulse is 45-degree ink hatching at an 8px pitch with the text sitting on a paper knockout, and the active pulse cross-hatches. One accent exists, drafting red, and it is a state, not a colour: the time cursor, the outline and arrow of the pulse under it, the hover colour of a link, and the focus ring.

Lettering follows the same discipline. Upright engineering lettering (Share Tech, one weight) for headlines, labels, nav, and the title block; its mono cut (Share Tech Mono, tabular numerals) for anything that is a number or a sheet mark; Atkinson Hyperlegible for long prose. Four text sizes (11 / 13 / 17 / 22px) plus one display clamp cover the site, and hierarchy is made with case, tracking, colour (ink against ink-2), and rules, never with weight, which does not exist. The site refuses the portfolio arrangement (name, tagline, avatar, three cards) and refuses tinted, rounded, or shadowed component chrome of any kind. Motion is confined to the sequence itself and removed under `prefers-reduced-motion`.

**Key Characteristics:**
- Every page sits inside a 2.5px sheet border with mono zone marks and closes with a six-column title block.
- Label column plus ruled lanes on every page; the 1.5px label-column divider is the site's spine.
- Three line weights, one hue: thin 1px, medium 1.5px, thick 2.5px, all in ink.
- Fills are 45-degree ink hatching on paper, cross-hatched when active; no tints, no grey surfaces.
- Drafting red is the only accent and only ever marks state: cursor, active pulse, hover, focus.
- Three faces at one weight with fixed jobs: Share Tech lettering, Share Tech Mono numbers, Atkinson Hyperlegible prose.
- Four text sizes (11 / 13 / 17 / 22px) plus one display clamp; rank by case, tracking, and ink vs ink-2.
- Square corners everywhere; the only circle is the 26px balloon callout.

## Colors

Black ink on white paper with one drafting-red accent; there is no grey surface and no second hue.

### Primary
- **Drafting Red** (`red`): the single accent, used only to mark state. The dash-dot time cursor and its arrowhead, the border and arrow of the pulse under the cursor or the pointer, the hover colour of every link (prose links, nav, lane labels, note titles, title-block links), and the 2px focus ring. It never fills a surface and never sets resting text.

### Neutral
- **Paper** (`paper`): the page ground, the knockout behind pulse text and dimension text, the outline button's fill and its hover text, the selection text colour, and the paper stroke that halos lettering inside the wavepacket frame.
- **Ink** (`ink`): the one drawing colour. Every line at every weight (sheet border, zone dividers, lane rules, the divider, ticks, dimension lines and arrowheads, hatching), all headings and body text, resting links, the wavepacket line, the selection background, and the button's hover fill.
- **Ink 2** (`ink-2`): secondary lettering only, never a line. Zone marks, title-block keys, the channel index beside a lane label, the state-lane subline, meta lines and dates, figcaptions, and note-list teasers.

### Named Rules
**The One Ink Rule.** There is one drawing colour, ink, and one accent, red. Grey is `ink-2` lettering, never a line and never a surface; a lighter line is drawn thinner, not paler.

**The Red Is State Rule.** Drafting red appears only when something is happening: the cursor's position in time, the pulse it is crossing, a pointer over a link, keyboard focus. A page at rest with nothing hovered shows red on the cursor alone.

**The Hatch Not Tint Rule.** A filled area is 45-degree ink hatching (1px line, 8px pitch) on paper; the active state cross-hatches. Nothing is ever a solid tint, a translucent fill, or a grey panel.

## Typography

**Display Font:** Share Tech (with Saira, Helvetica Neue, Arial, sans-serif) — 400 only, self-hosted
**Body Font:** Atkinson Hyperlegible (with Helvetica Neue, Arial, sans-serif) — 400, 400 italic, 700, self-hosted
**Label/Mono Font:** Share Tech Mono (with SFMono-Regular, Menlo, Consolas, monospace) — 400, self-hosted

**Character:** Upright engineering lettering for everything drawn on the sheet, its mono cut for every number and sheet mark, and a hyperlegible humanist sans for the prose the reader stays for. There is one weight; rank comes from case, tracking, size, and ink against ink-2.

### Hierarchy
- **Display** (Share Tech 400, `clamp(1.9rem, 1rem + 1.8vw, 2.4rem)`, 1.12, 0.01em, balanced): the `h1` in the label cell. On Home it is the state-lane headline, capped at 12ch; on content pages it is the page title, sticky at 40px while the body scrolls.
- **Headline** (Share Tech 400, 22px, 1.12, UPPERCASE, 0.08em): `h2` section titles inside prose and above the experience list, with 40px above and 12px below.
- **Title** (Share Tech 400, 17px, 1.12, UPPERCASE, 0.06em): `h3`, the entry name in the experience list. Without case or tracking (0.02em) the same face and size is the wordmark (which takes the 0.12em label tracking and uppercase) and note-list titles.
- **Body** (Atkinson Hyperlegible 400, 17px, 1.55): all prose at a 66ch measure, 16px paragraph gap. The state-lane subline is body type in `ink-2` at a 34ch cap; note teasers are body face at 13px in `ink-2`.
- **Label** (Share Tech 400, 13px, UPPERCASE, 0.12em): lane labels, nav links, the outline button, the axis label, title-block values (at 0.08em). Sentence case at 0.02em and 1.3 line-height is the text inside a pulse; at 0.04em it is figcaptions and the wavepacket's axis lettering.
- **Mono** (Share Tech Mono 400, 13px, tabular numerals): the `t = 0.00` readout, axis ticks, the dimension text, the live `2σ` dimension label, the channel index beside a lane label, contact lines, meta lines and dates, the balloon numeral, the `FIG. 1` prefix, title-block email and LinkedIn values, and inline code (0.92em inside prose).
- **Sheet mark** (Share Tech Mono 400, 11px): zone numbers and letters in the sheet border (untracked, `ink-2`) and title-block keys (UPPERCASE, 0.1em, `ink-2`).

### Named Rules
**The One Weight Rule.** Every face is set at 400 (Atkinson's 700 is loaded for prose emphasis only). Hierarchy is made with size, case, tracking, and `ink` vs `ink-2`, never with a bolder cut.

**The Number Is Mono Rule.** Anything that reads as a measurement or an index (time, tick, dimension, date, channel number, balloon number, sheet number, zone mark) is set in Share Tech Mono with tabular numerals, even when it sits inside a Share Tech label.

**The Four Sizes Rule.** 11, 13, 17, and 22px plus the display clamp. 11px is reserved for sheet marks and title-block keys; nothing else drops below 13px.

## Layout

The body is padded 24px from the viewport (`sheet-pad`) and the sheet border is drawn absolutely 14px in (`frame`), so the 2.5px border runs between the page edge and the content on every page, with the six zone numbers spread across the top and bottom margins and the four zone letters down the sides, each separated by a thin divider. The body is a flex column so the title block sits at the bottom of the sheet even on short pages; the title block is right-aligned, up to 780px wide, six equal columns, with the title and email cells spanning three and the LinkedIn cell two.

Every page is a two-column grid: a 360px label column and a fluid body, divided by a medium (1.5px) line that runs through the top bar, the lanes, and the content area. Horizontal gutters are 24px either side of the divider at desktop, 20px at or below 1100px, and 16px at or below 860px. Vertical rhythm is on an 8px grid: 16px paragraph and list gaps, 24px figure margins, 40px page padding, 64px bottom padding, 12px between the last row and the title block.

The Home sequence stacks: a 56px top bar (wordmark, nav, then the mono readout with the outline pause button once the clock is live); the state lane at `min(40vh, 620px)` and flex-growing, holding the headline, subline, and mono contact line in the label cell and the wavepacket at full lane width; a 22px dimension row spanning the lanes with a dimension line, extension lines, and the `T = 1.20 · 14 s` text on a paper knockout; three 64px block lanes, each labelled with a mono channel index and an uppercase name and each holding one hatched pulse placed in time by `--t0` / `--t1` fractions of the lane width; and a 32px time axis with a thin tick every 0.2 and an end tick on the right edge. One cursor spans the three lanes and the axis, positioned by `--u`.

Content pages put the `h1` in the label cell (sticky at 40px) and a `.prose` block in the body at a 66ch measure. Wider content breaks the measure: the Projects figure runs to 960px inside a medium-line frame, the notes list to 760px, the experience list stays at 66ch.

Responsive: at 860px the label column collapses to 0 and every grid becomes one column with the label cell stacked above its body; the divider disappears and the state-lane label gains a thin bottom rule instead; the sheet border tightens to 8px and drops its zone marks; the body padding drops to 16px. The wavepacket takes a 16:10 aspect ratio, pulses become in-flow full-width blocks with a 44px minimum height, the nav tightens to 14px gaps, the clock drops to a second 40px row of the top bar under a thin rule, and the title block reflows to two columns at full width. At 600px the lettering inside the static wavepacket frame scales up to 44 SVG units; at 480px every other axis tick is hidden and display math shrinks with a right-edge fade.

## Elevation & Depth

Flat, in the literal sense: the page is a sheet of paper with ink on it. There are no shadows anywhere in the system, no translucent layers, no grey panels. Overlap is resolved the way a draftsman does it, with a paper knockout: the pulse text, the arrow, the dimension text, the wavepacket's dimension label, and the lettering inside the static frame each sit on a paper background (or a paper stroke behind the glyphs) so the hatching or line behind them breaks cleanly. State is drawn, not lifted: a pulse under the cursor swaps its border to red and adds the second hatch direction; a hovered link or arrow turns red; the button inverts to ink.

### Named Rules
**The Paper Knockout Rule.** Where lettering crosses a line or a hatch, it sits on a paper knockout, never on a shadow or a tint. The line breaks; the text does not float.

**The No Lift Rule.** Nothing casts a shadow. State is shown by a red line, a second hatch direction, an ink inversion, or an underline.

## Shapes

Rectangles with square corners, drawn as outlines. Every box (pulse, outline button, title block and its cells, the figure frame, the code block, the sheet border) has a 0 radius and a border in one of the three line weights. The single circle is the 26px balloon callout (a medium-line ring around a mono numeral) that numbers experience entries, the drafting convention for part callouts. Arrowheads are drawn geometry: the dimension line ends in 9px-long, 7px-wide filled ink triangles and the cursor's foot is a 9px-wide, 8px-tall red triangle pointing up. The pulse's arrow is a 16x12 inline SVG chevron stroked at 1.5px with round caps, in `currentColor`. The active nav link is marked by a medium (1.5px) ink underline. The center line of the wavepacket's x axis is a dash-dot line (long dash, short dash, repeating), and the cursor repeats the same dash-dot pattern vertically in red (12px dash, 3px gap, 2px dot, 3px gap).

## Components

### Buttons
The single button is a drawn switch: uppercase lettering inside a medium-line box.
- **Shape:** square (0 radius), 1.5px ink border, minimum width 6.5em.
- **Outline:** paper fill, ink text, 5px 12px padding, label type at 0.12em.
- **Hover / Focus:** hover inverts to ink fill with paper text, no transition; focus uses the global 2px red outline at 2px offset. Disabled drops to 45% opacity.

### Pulses (Home lanes)
The signature block: a hatched section of the diagram, positioned in time.
- **Shape:** square, 1.5px ink border, absolutely placed with `left: t0 * 100%` and `width: (t1 - t0) * 100%`, inset 9px from the lane top and bottom, 0 8px inner padding.
- **Fill / Text:** 45-degree ink hatching; the teaser sits on a paper knockout (3px 6px padding) in Share Tech 13px at 0.02em, balanced; the arrow sits on its own 4px paper knockout pushed to the right edge.
- **Hover / Active:** the second hatch direction is layered on (cross-hatch) and the border and arrow turn red, border colour transitioning over 160ms ease-out. `is-active` is set by the clock when the cursor lies within `[t0, t1)`. The transition is removed under reduced motion.

### Balloon Callouts (About)
A 26px circle with a 1.5px ink ring and a mono numeral, set in the left column of each experience entry. Entries are ruled above by thin lines (the last also below) with 16px vertical padding, the name as an uppercase `h3`, the place and dates as a mono meta line, and the description in body type.

### Cards / Containers
There are no cards. Grouped content is separated by thin (1px) rules: note-list rows and experience entries. A figure that needs a frame gets a medium (1.5px) border with 16px padding and a figcaption in label type (0.04em, no case change) below a thin rule, prefixed by a mono `FIG. n`. Code blocks are a thin-line box with 16px padding and no background.

### Inputs / Fields
The only input is the invisible range scrubber laid over the time axis (`cursor: ew-resize`, transparent track and 12px thumb, red focus ring inset 2px). No text inputs exist.

### Navigation
- **Top bar:** 56px, bottom edge a medium line. Wordmark in Share Tech 17px uppercase at 0.12em; nav links as uppercase labels in ink with a transparent 1.5px bottom border, hovering to red, the current page underlined in ink; 28px between links. Right slot holds the mono readout (10ch, right-aligned) and the pause button once the sequence is live. Below 860px the nav packs right at 14px gaps and the clock drops to a 40px second row divided by a thin rule.
- **Lane labels:** an uppercase label preceded by a mono channel index in `ink-2`, 12px apart, hovering to red as one link.
- **Title block:** every page's footer. Six-column grid in a medium-line frame with thin cell dividers; each cell stacks an 11px mono uppercase key in `ink-2` over a 13px uppercase Share Tech value in ink (email and LinkedIn values are mono, sentence case, hovering to red). Cells: Title (span 3), Sheet, Rev, Date, Scale, Email (span 3), LinkedIn (span 2).

### Sheet Border and Zones
Absolutely positioned over the page, pointer-events off, above content. A 2.5px ink frame inset 14px, with 11px mono zone marks in `ink-2` in the margins: 1 to 6 across the top and bottom, A to D down the sides, each pair divided by a thin line. Hidden below 860px, where the frame tightens to 8px.

### Dimension Row and Time Axis
The dimension row is a 22px band: a thin line with 9px filled arrowheads at both ends, thin extension lines at each end, and mono dimension text on a paper knockout centred over it. The axis is a 32px band with thin tick lines and mono numerals beside them, the last tick drawn on the right edge. The cursor is a 1px red dash-dot line spanning the lanes and the axis with a red triangle at its foot, hidden until the clock runs.

### Wavepacket Figure
Ink on paper in the same weights: the packet as a 1.7px ink line, the envelope as thin hatched and ringed construction lines (thin lines fade by opacity, not by a lighter colour), the x axis as a dash-dot center line, Re and Im axes as thin lines with lettered ends, and a live dimension line beneath the packet reading `2σ` in mono on a paper knockout. The static SVG fallback uses the same faces and a paper stroke behind each label.

### Readouts and Meta
Mono 13px with tabular numerals. The clock readout, ticks, and dimension text are ink; meta lines, dates, and channel indices are `ink-2`.

## Do's and Don'ts

### Do:
- **Do** put every page inside the sheet: the 2.5px border with zone marks and the title block footer are what make a page belong to the site.
- **Do** start every page from the label column + 1.5px divider + body grid.
- **Do** draw with three weights only: 1px for construction, dimension, hatching, ticks, and rules between rows; 1.5px for visible edges, frames, and the divider; 2.5px for the sheet border and nothing else.
- **Do** fill with 45-degree ink hatching at an 8px pitch and cross-hatch for the active state; put any text that crosses a line or a hatch on a paper knockout.
- **Do** use drafting red only for state: cursor, active pulse, hover, focus (2px outline, 2px offset).
- **Do** set every number and sheet mark in Share Tech Mono with tabular numerals; 11px for zone marks and title-block keys, 13px for everything else.
- **Do** keep to 11 / 13 / 17 / 22px plus the display clamp and rank with case, tracking, and `ink` vs `ink-2`.
- **Do** keep the light theme, AA contrast, keyboard focus, and a reduced-motion / no-WebGL static fallback for anything animated.

### Don't:
- **Don't** add shadows, tints, translucent fills, grey panels, or gradients that are not the hatch or the dash-dot cursor; the only grey on the site is `ink-2` lettering.
- **Don't** use red as a resting text or fill colour, and don't introduce a second hue.
- **Don't** round a corner; every box is square and the only circle is the balloon callout.
- **Don't** use a bolder weight to rank text; the lettering faces have one weight.
- **Don't** add a fourth typeface or let the faces swap jobs (no mono headlines, no prose face in labels, no lettering face for long prose).
- **Don't** place a photo, avatar, logo strip, or card grid; the site refuses the portfolio arrangement.
- **Don't** draw a fourth line weight; a 2px line means focus and nothing else.
