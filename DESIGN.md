---
name: Markdown Studio X
description: Terminal manuscript in, phototypeset page out — a Bell Labs pipeline in the browser.
colors:
  paper: "hsl(42 25% 96%)"
  warm-ink: "hsl(30 10% 11%)"
  bell-blue: "hsl(210 85% 40%)"
  faded-ink: "hsl(35 9% 37%)"
  manuscript-ground: "hsl(42 18% 92%)"
  raised-ground: "hsl(42 15% 89%)"
  hairline: "hsl(38 12% 82%)"
  input-stroke: "hsl(38 12% 78%)"
  proof-red: "hsl(12 62% 42%)"
  popover-paper: "hsl(42 30% 98%)"
typography:
  manuscript:
    fontFamily: "'Courier Prime', 'Courier Prime Fallback', 'Courier New', ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  galley-body:
    fontFamily: "'STIX Two Text', 'STIX Two Text Fallback', 'Times New Roman', Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  galley-display:
    fontFamily: "'STIX Two Text', 'STIX Two Text Fallback', 'Times New Roman', Georgia, serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "36px"
    letterSpacing: "-0.01em"
  galley-headline:
    fontFamily: "'STIX Two Text', 'STIX Two Text Fallback', 'Times New Roman', Georgia, serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "24px"
    letterSpacing: "-0.005em"
  label:
    fontFamily: "'Courier Prime', 'Courier Prime Fallback', ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.06em"
rounded:
  none: "0px"
spacing:
  ruling: "24px"
  chrome-pad: "8px"
  galley-gutter: "24px"
components:
  statusline-mode:
    backgroundColor: "{colors.bell-blue}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 1ch"
    height: "26px"
  view-switch-active:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "24px"
  view-switch-rest:
    backgroundColor: "transparent"
    textColor: "{colors.faded-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "24px"
  key-cap:
    backgroundColor: "{colors.manuscript-ground}"
    textColor: "{colors.warm-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 4px"
    height: "18px"
  chrome-icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.faded-ink}"
    rounded: "{rounded.none}"
    size: "28px"
  chrome-icon-button-hover:
    backgroundColor: "{colors.raised-ground}"
    textColor: "{colors.warm-ink}"
  chrome-icon-button-active:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.paper}"
  index-row-active:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
---

# Design System: Markdown Studio X

## Overview

**Creative North Star: "The Bell Labs Pipeline"**

The app is the old Unix documentation pipeline made visible: you type a terminal
manuscript on the left and a phototypeset page comes out on the right. Every
surface belongs to one of those two materials. Chrome — header, toolbar,
sidebar, statusline, palette — is the terminal: Courier Prime, hairline rules,
square corners, inverse-video selection, 11px uppercase labels. The preview is
the phototypesetter's galley: STIX Two Text on a strict 24px ruling, a running
head, print-ruled tables, hairline plate frames around images. Nothing is
skeuomorphic; the metaphor is carried entirely by type, rules, and four inks.

Density is high and unapologetic. Chrome bars are 40/36/26px tall; labels sit
at an 11px floor; rows are separated by 1px rules, never by whitespace alone.
There are no gradients, no glass, no blur, and (with one deliberate exception
for the floating command palette) no shadows. Depth is conveyed by ink
inversion and hairlines, not elevation.

Copy speaks in man-page register: the header names itself Markdown Studio X
under a "User Commands" running title, the sidebar is an "Index", search is
"grep documents…", the palette opens with an ex-command `:` prompt, and the
statusline reports lowercase facts ("saved", "saving…", "12 min read").

**Key Characteristics:**
- Two materials only: mono terminal chrome, serif typeset galley.
- Four inks per theme: paper ground, warm ink, Bell System blue, faded ink.
- Square corners everywhere (`--radius: 0`); hairline 1px rules do all separation.
- Inverse video is the selection language; color state flips instantly.
- One easing curve for all motion; exits faster than entries.
- Man-page / tmux voice: uppercase mono labels, lowercase status verbs.

## Colors

Four inks per theme; Bell System blue is the only chromatic voice, and the
proofing-pencil red appears only on errors and destructive actions.

Tokens live as HSL triplets in CSS custom properties in `src/index.css`
(`:root` for light, `.dark` for dark) and are consumed via Tailwind as
`hsl(var(--token))`. The frontmatter records the light theme; the dark theme
re-inks the same roles as follows.

### Primary
- **Bell System Blue** (light `hsl(210 85% 40%)`, dark `hsl(210 78% 64%)`; `--primary`, `--accent`, `--ring`): the pipeline's one voice of color. Statusline mode block, links, string tokens in code, carets, focus rings, starred marks, the palette's `:` prompt. Never used as a large ground except the single statusline mode segment.

### Neutral
- **Paper** (light `hsl(42 25% 96%)`, dark `hsl(30 8% 9%)`; `--background`): the page ground. The dark ground is a warm machine-room near-black — never blue-black.
- **Warm Ink** (light `hsl(30 10% 11%)`, dark `hsl(40 16% 88%)`; `--foreground`): primary text, and the ground of every inverse-video selection.
- **Faded Ink** (light `hsl(35 9% 37%)`, dark `hsl(38 8% 60%)`; `--muted-foreground`): labels, running heads, resting chrome icons, list markers, comments in code.
- **Manuscript Ground** (light `hsl(42 18% 92%)`, dark `hsl(30 7% 12%)`; `--panel`, `--listing`): the recessed editor pane and code-listing ground.
- **Raised Ground** (light `hsl(42 15% 89%)`, dark `hsl(30 6% 16%)`; `--secondary`): hover fills, section-rule strips, non-mode statusline segments.
- **Hairline** (light `hsl(38 12% 82%)`, dark `hsl(30 6% 21%)`; `--border`): every 1px rule. Inputs stroke slightly darker (`--input`, light `hsl(38 12% 78%)`, dark `hsl(30 6% 26%)`).
- **Popover Paper** (light `hsl(42 30% 98%)`, dark `hsl(30 8% 13%)`; `--popover`): floating surfaces (palette, menus, tooltips), one step brighter than the page.

### Tertiary
- **Proofing-Pencil Red** (light `hsl(12 62% 42%)`, dark `hsl(12 58% 58%)`; `--destructive`): errors and delete affordances only.
- **Proof-stamp inks** (galley alerts only; per-variant `--alert-ink`): note = Bell blue, tip `hsl(150 55% 28%)`, important `hsl(265 45% 42%)`, warning `hsl(38 75% 30%)`, caution `hsl(12 62% 40%)`; each lifted in dark (e.g. tip `hsl(150 45% 58%)`). These are stamp inks scoped to `.galley .alert`, not palette members.

### Named Rules
**The Four Inks Rule.** A screen is composed from paper, warm ink, Bell blue,
and faded ink. Bell blue is the only accent; red exists only to mark errors.
Adding a fifth ink to chrome is a redesign, not a tweak.

**The No-Gradient Rule.** No gradients, no glass, no blur, anywhere. Grounds
are flat fills; emphasis is inversion or a hairline.

## Typography

**Manuscript Font:** Courier Prime (self-hosted woff2, weights 400/700 + italics; metric-adjusted `Courier Prime Fallback` → Courier New)
**Galley Font:** STIX Two Text (self-hosted variable woff2, 400–700 + italic; metric-adjusted `STIX Two Text Fallback` → Times New Roman)

**Character:** A typewriter talking to a phototypesetter. Courier Prime is
everything interactive; STIX Two Text appears only inside `.galley` (and
exported pages). No third-party font requests; `font-display: swap` with
metric-adjusted local fallbacks so the page keeps its shape while loading.
Body chrome is 14px mono with `font-synthesis: none` and antialiasing on.

**User-selectable content faces:** the two content surfaces are personal
preferences, not fixed system rules. `src/lib/typography.ts` applies
`--font-manuscript` (editor textarea via `.manuscript`) and `--font-galley`
(`.galley`) as CSS variables, chosen in Settings and persisted in
localStorage. Options — manuscript: typewriter (default) / system mono /
system sans; galley: typeset serif (default) / system sans / typewriter.
The pairing above describes the DEFAULTS. Chrome (header, toolbar,
statusline, labels, code listings) always stays Courier Prime — the world's
identity does not follow the preference.

### Hierarchy

Galley headings are set as multiples of the 24px ruling:

- **Display / h1** (700, 30px / 36px, -0.01em): the paper's title. When it opens the document it is centered with no rule, the way troff set `.TL`; margin 48px top / 12px bottom.
- **Headline / h2** (700, 22px / 24px, -0.005em): section head carrying a hairline underscore (7px padding, 1px border-bottom); margin 44px / 20px.
- **Title / h3** (700, 18px / 24px): subsection, margin 40px / 8px. **h4** is 16px italic 700; **h5/h6** are 14px 700 (h6 in faded ink).
- **Body** (400, 16px / 24px STIX in the galley; 400, 14px Courier Prime in chrome and editor): galley paragraphs end with one full 24px ruling of margin. Measure is capped at 38rem.
- **Label** (700, 11px / 16px Courier Prime, uppercase, 0.04–0.06em tracking): statusline segments, section rules, running heads, listing heads, view switcher, key caps, alert stamps. One or two words only — see the Marker / Sentence Rule.
- **Hint** (400, 11px / 16px Courier Prime, natural case, no tracking): the explanatory line under a control, captions, meta lines, empty states, key legends. Everything a Label is too loud to say.

### Named Rules
**The 24px Ruling Rule.** The galley shares one 24px baseline: body line-height,
heading line-heights (24 or 36px), paragraph/list/table/listing margins are all
multiples of 24px. Code listings render at 13px type but keep the 24px line.

**The 11px Label Floor Rule.** No text renders below 11px. An 11px *label* is
Courier Prime, uppercase, and letter-spaced 0.04–0.06em (0.04em for running
labels, 0.06em for bold section rules and stamps).

**The Marker / Sentence Rule.** Uppercase is the grammar for a **marker** — a
noun of one or two words that names a thing: a statusline segment, a section
rule, a rail row, a field head, a button stamp. It is never the grammar for a
**sentence**. Set a phrase in caps and the reader loses the word shapes that
make it skimmable, which is exactly what help text is for; at 11px with
tracking it turns into a wall. So explanatory copy — hints under a control,
captions, meta lines, empty states, key-legends — is natural case, no tracking,
on a real 16px line box: the `HINT` token and the `<Hint>` primitive. Two
consequences: a head that wants to explain itself is really a short head plus a
`Hint`, and copy is stored in natural case in the source (`label: 'Light'`, not
`'LIGHT'`) so the cut, not the string, decides the casing. Lowercase 11px
markers exist only for statusline status verbs ("saved", "saving…") and
listing-copy verbs.

**The Cap-Centering Rule.** A label set beside an icon is centered on its cap
height, not its line box. `leading-none` alone leaves the font's descender
slack inside the box and lands the caps ~0.7px above the icon — visible at
11px. The `.cap-center` utility in `index.css` trims the box
(`text-box: trim-both cap alphabetic`, with a half-pixel nudge where that is
unsupported) and the `<Label>` primitive carries it. Never hand-roll an 11px
label; import `Label` from `@/components/chrome`.

**The Two Faces Rule.** STIX Two Text never appears in chrome; Courier Prime
appears inside the galley only as inline code and listing text.

## Layout

A fixed full-height frame, ruled like a proof sheet. Stacked chrome bars, all
declared once as `BAR` in `src/components/chrome/tokens.ts`: man-page header
40px (`h-10`), formatting toolbar 36px (`h-9`), sidebar index head 36px (the
same track as the toolbar beside it, so their hairlines meet), grep field
32px (`h-8`), statusline 26px. Every bar is separated from content by a single
1px hairline; vertical dividers inside bars are 1px × 16px strokes.

The workspace splits into manuscript and galley panes ruled by one shared
hairline. The document sidebar ("Index") is a fixed 264px column of
hairline-separated rows that **slides** in and out on `margin-left` — never on
`width`: a width animation squeezes the rows every frame and, if it is
interrupted or throttled, strands the column at an arbitrary size. The AI
panel is the mirror of this on the right (`margin-right`). The galley centers
its content at a 38rem (608px) max measure with 24px side padding (40px at
md+) and **no running head** — the header names the document, and the writing
surface opens on the writing.

Spacing inside chrome is compact and comes from two constants: `GUTTER`
(8px) pads every bar, `ROW_GUTTER` (12px) pads every text row, menu item and
strip. Gaps are 4–6px. A trailing cluster of 24px row buttons sits at
`ROW_ACTION_INSET` (6px), which puts the 12px icon inside it on the same 12px
optical gutter as the row's text. There is no spacing scale beyond that; the
24px ruling governs the galley, and the bar heights govern chrome.

Responsive behavior: mobile *mode* is decided at one boundary — 768px, `md`,
in CSS and in the `useIsMobile` hook alike. Below it the two side panels
(Index, AI) become **drawers**: the same margin-slide, but `fixed` over the
page at the `drawer` altitude behind the one `SCRIM`, dismissed by scrim tap,
Escape, or choosing a document. The toolbar's format cluster runs past the
right edge and **pans** (`scrollbar-none`); nothing hides, nothing shrinks,
and the half-cropped last glyph is the scroll affordance. Touch targets grow
(bar buttons 36px, row buttons 32px); the SPLIT view is hidden; statusline
segments drop progressively (`sm`/`md`/`lg`); the header title hides below md
(the statusline carries the name). The keyboard is part of the viewport: the
frame is `100dvh`, the statusline pads `env(safe-area-inset-bottom)`, floats
that must stay reachable while typing budget against `useVisualViewport`, and
every text input is ≥16px below md so iOS never zooms on focus.

## Elevation & Depth

Flat by doctrine. Depth is conveyed by ink — inverse video for selection,
hairlines for boundaries, `--panel` vs `--background` for recessed grounds —
never by shadows or blur. Two narrow exceptions exist in the build:

### Shadow Vocabulary
- **Palette float** (`box-shadow: 0 8px 32px rgba(0,0,0,0.18)` + a `bg-foreground/25` / dark `bg-black/55` scrim): the command palette is the one surface that floats above the page.
- **Key-cap ridge** (`box-shadow: 0 1px 0 hsl(var(--border))`): a 1px hard ridge under chrome-tone key caps; on inverse rows the cap flattens to a translucent border instead.

### Named Rules
**The Flat Ink Rule.** No new shadows. If a surface needs hierarchy, invert
its ink or draw a hairline. The palette's float and the key-cap ridge are the
complete shadow vocabulary.

**The Altitude Rule.** The pipeline has exactly eight altitudes, named once as
`LAYER`/`LAYER_Z` in the chrome kit: `raised` (10, in-surface accents) →
`anchored` (20, pane-anchored panels) → `drawer` (30) → `popover` (40) →
`dialog` (50) → `palette` (60) → `toast` (70) → `tooltip` (80). A float that
cannot name its layer does not ship, and no surface writes a z-index literal.
Dimming behind a float is always the one `SCRIM` token — the palette's own —
never a second treatment.

## Shapes

Square corners, everywhere, without exception: `--radius: 0rem` and every
Tailwind radius alias resolves to it. Buttons, inputs, panels, images, key
caps, checkboxes, color chips — all hard rectangles. Borders are 1px hairlines
in `--border`; the only heavier strokes in the system are the 2px foreground
rules that open a table head and close its last row, print-style. Blockquotes
carry a single 1px left rule in half-strength foreground. Images get a
hairline "plate frame". `hr` is a 40%-width centered hairline.

**The Hairline Rule.** 1px in `--border` is the only structural stroke.
Reaching for 2px is reserved for the print table's head and foot rules, both
inked in full foreground.

## Components

### The Chrome Kit (`src/components/chrome/`)

Every piece of terminal chrome is assembled from one kit, so a spacing or ink
decision is made once and read everywhere. Import from `@/components/chrome`;
do not hand-roll these shapes.

| Export | What it is |
| --- | --- |
| `Bar` | A chrome bar: fixed track (`header`/`toolbar`/`field`/`status`), one hairline, the 8px gutter. `stretch` for full-height cells, `flush` when children own their padding. |
| `BarDivider` | The 1px × 16px stroke between clusters in a bar. |
| `Label` | The 11px Courier Prime label, cap-centered. `weight="strong"` is the bold 0.06em cut. |
| `IconButton` | Square icon button with the tooltip + key caps built in. `size="bar"` (36/28px) or `size="row"` (24px). |
| `LabelButton` | The same grammar with a word instead of a glyph (EXPORT, NEW, ONE/ALL). `tone="accent"`, `fill`, `size="row"`. |
| `Segmented` | The bordered N-cell switch: view switcher, theme picker. Selected cell is inverse video, flipped instantly. |
| `SectionRule` | The raised-ground 24px strip that names a group (STARRED, RECENT, INSERT BLOCK). |
| tokens | `BAR`, `GUTTER`, `ROW_GUTTER`, `ROW_ACTION_INSET`, `LABEL`, `HINT`, `INK`, `HOVER`, `PRESS`, `SELECTED`, `TOGGLED`, `STRIP`, `ICON`, `LAYER`, `LAYER_Z`, `SCRIM`, `EASE`, `DURATION`. |

The kit is chrome only. The galley is the other material and stays out of it.

### Header

40px, three zones. Left: the index toggle and the app name. Centre: the
**document's name**, positioned absolutely on the header's true midpoint so it
cannot drift with the width of the clusters beside it, and clickable to rename
in place (it falls away below `md`, where the statusline carries the name
instead). Right: EXPORT, settings, source. There is no decorative running
title — a label nobody can click does not earn 40px of the top of the screen.

### Focus Mode

Every bar steps out and the writing surface takes the whole screen, backed by
real fullscreen where the browser grants it. Entered from the toolbar, `⌘⇧F`,
or the palette; left with Escape or the faint corner control, which is the
only chrome that remains. Escape defers to anything nearer the caret that
already handled the key (the slash menu, the find bar). On a single surface
the manuscript takes a centered 41rem measure rather than running the full
width of the display.

### Editable Galley (signature surface)
The typeset page is itself an editor (TipTap, `src/components/galley/`).
Markdown stays the single source of truth: rich edits serialize back out
(debounced 200ms), source edits parse back in, and the focused surface always
wins (`GalleyEditor` sync guards). View modes read MARKDOWN / SPLIT / RICH TEXT.
- **Slash menu** (`/`): block palette at the caret — same anatomy as the command palette (hairline panel, mono labels, inverse-video selection, "INSERT BLOCK" section rule).
- **Bubble toolbar**: on selection, a hairline popover row (B, I, S, code, link) with inverse-video hover/active; the link button swaps the row for an inline URL input (Enter applies, Esc cancels).
- **Alert stamps** are a first-class node: rendered as the galley's proof stamps, label click cycles NOTE→TIP→IMPORTANT→WARNING→CAUTION, serialized to exact `> [!NOTE]` GFM.
- **Code listings** keep the listing-head grammar: an inline language picker (mono uppercase select) and copy control; `spellcheck` off inside listings.
- New blocks in the galley must keep round-trip safety: every node needs a `markdown` storage serializer (and parser when GFM has a syntax for it). A block that cannot serialize does not ship.
- **Known limitations.** Documents containing raw HTML, HTML comments, footnote syntax (`[^1]`), or YAML front matter open **read-only** in the rich text view — the schema cannot round-trip them without corrupting the source; edit those in MARKDOWN view. Table column alignment (`|:---|:---:|---:|`) is dropped on serialize. Consecutive task-list items come back "loose" (a blank line between items) even with `tightLists: true`.

### Statusline (signature)
tmux-grade, 26px tall, mono 11px uppercase with 0.04em tracking; segments are
padded to the same 8px gutter as every other bar.
- **Mode segment:** inverse video in Bell blue (`bg-primary text-primary-foreground`, bold) reading MARKDOWN / SPLIT / RICH TEXT.
- **Document segment:** raised ground (`bg-secondary`), normal-case truncating filename — shown only below `md`, where the header's centred title is hidden. The name is never reported twice at the same width.
- **Commands segment:** a real button — Bell-blue `:` prompt, "COMMANDS", `⌘P` — opening the palette. This is where a "user commands" affordance belongs: in the footer, and clickable.
- **Metric segments:** faded ink, hairline left rules, dropping by breakpoint (LN/COL, words, chars, read time).
- **Save segment:** fixed 13ch, lowercase verbs — "saved" faded, "saving…" blue, "save failed" red.

Word counts everywhere — statusline and index rows — come from
`countWords`/`documentStats` in `src/lib/text-stats.ts`. One document must
never report two different numbers.

### View Switcher
A bordered 3-cell group (28px tall, 24px at md), mono 11px labels with icons.
- **Active cell:** full inverse video — `bg-foreground text-background`. The flip is instant; no transition.
- **Resting cell:** faded ink; hover raises to `bg-secondary` with warm ink.

### Chrome Icon Buttons (header + toolbar)
- **Shape:** square, 36px mobile / 28px desktop, no border at rest.
- **Rest:** faded-ink icon (14px Lucide) on transparent.
- **Hover:** `bg-secondary text-foreground`. **Pressed:** full inverse video (`active:bg-foreground active:text-background`). **Toggled-on:** holds the hover fill.
- **Tooltip:** popover-ground, mono 11px, label + key caps.

### Key Caps (Kbd)
Shortcuts render as individual caps — [⌘] [⇧] [Q] — each an 18px-square-min
bordered mono 11px cell. Chrome tone: muted fill, hairline border, 1px ridge
shadow. Inverse tone (on selected/inverse rows): transparent fill,
`border-background/40`, background-colored text. Aria-label spells the keys
("Cmd Shift Q").

### Index (Document Sidebar)
264px column. The head is a 36px bar: the word "Index" and a NEW button that
fills the bar's height against a left hairline — no document count (the list
is right there) and no plus glyph beside the word "new" (one affordance, said
once). Section rules ("STARRED", "ALL FILES") are raised-ground strips
with bold 11px labels. Rows are hairline-separated: bold 12px mono name, then
an 11px uppercase meta line ("2H · 340 WORDS").
- **Active row:** full inverse video (`bg-foreground text-background`); meta and row actions shift to `text-background/70`.
- **Hover row:** `bg-secondary`; row actions (star/rename/delete) fade in on hover, always visible on touch.
- **Search:** borderless transparent input, "grep documents…" placeholder.
- **Empty states:** centered 11px uppercase mono with a hairline-bordered text button.

### Command Palette
Centered at 18% from top, max-w-lg, popover ground, hairline border, the one
floating shadow. Prompt line is a bold Bell-blue `:` beside a borderless mono
input. Group heads are raised-ground 11px strips; the footer is a raised strip
of key caps ("↑↓ navigate · ↵ run · esc close"). Selected row uses the
inverse/secondary treatment; Enter runs, Escape closes instantly.

### Galley Listings (code blocks)
Hairline-bordered box on `--listing` ground. The listing head is a 11px
uppercase mono strip (language label left, copy control right, hairline
beneath). Copy control is invisible until the listing is hovered or focused;
it reads "copy" → "copied" (blue check) → back, 1.6s. Code is 13px on the
24px ruling; Prism is monochrome + Bell blue — comments fade italic, keywords
embolden in foreground, strings/numbers take the blue ink.

### Proof-Stamp Alerts (GitHub alerts)
A hairline box in the variant's stamp ink on transparent ground; the label row
("NOTE", "WARNING"…) is bold 11px uppercase at 0.06em with a 12px stroke icon
and a stamp-ink rule beneath; content padding 12px 14px.

### Galley Tables
Print discipline: 2px foreground rule above the head and below the last row;
1px foreground rule under the head; hairline rules between body rows; no
vertical rules ever. 14px/20px type with lining tabular numerals; horizontal
overflow scrolls inside a wrapper.

### Inputs / Fields
Transparent or background fill, hairline stroke in `--input` (or borderless
inside ruled containers), square, mono type, Bell-blue caret. Focus is a 1px
`--ring` outline offset 1px (global `:focus-visible`), transitioning only
box-shadow/border-color over 140ms. Selection highlight is Bell blue at 25%.

## Do's and Don'ts

### Do:
- **Do** put every new surface in one of the two materials: Courier Prime chrome or STIX galley. Decide which side of the pipeline it belongs to first.
- **Do** mark selection and pressed states with instant inverse video (`bg-foreground text-background`, or Bell blue for the statusline mode block).
- **Do** set all labels at the 11px floor: Courier Prime, uppercase, 0.04–0.06em tracking, usually bold.
- **Do** route explanatory copy through `Hint`, and keep the uppercase cut for markers of one or two words. A settings pane, a palette footer or an empty state that shouts its sentences is the failure this rule exists to prevent.
- **Do** keep new galley elements on the 24px ruling — margins and line-heights in multiples of 24px.
- **Do** animate size/position with `cubic-bezier(0.16, 1, 0.3, 1)` only: 140ms for CSS state transitions, 0.12–0.24s for framer panels, with exits shorter than entries (e.g. sidebar 0.24s in / 0.18s out, palette 0.16s in / 0.08s out). Take both from `EASE` and `DURATION` in the chrome kit rather than writing the literals again. Wrap motion in `MotionConfig reducedMotion="user"`.
- **Do** build chrome out of the kit — `Bar`, `Label`, `IconButton`, `LabelButton`, `Segmented`, `SectionRule`. A new surface that re-types these classes is how the bars drifted apart in the first place.
- **Do** slide panels in on a margin, never by animating their width.
- **Do** speak man-page: name surfaces as artifacts ("Index", "manuscript", "typeset preview"), keep statusline verbs lowercase, and bracket empty states ("[ blank galley ]").

### Don't:
- **Don't** round a corner. `--radius` is 0; there are no exceptions in the world.
- **Don't** transition color. Ink flips (hover, selection, theme switch) are instant — color is deliberately excluded from the global transition properties, and `.theme-switching` kills all transitions during theme change.
- **Don't** add gradients, glass, blur, or new shadows. The palette float and key-cap ridge are the whole elevation vocabulary.
- **Don't** introduce a fifth chrome ink. Bell blue is the accent; red is errors only; the galley's stamp inks stay inside alerts.
- **Don't** use vertical rules in tables, backgrounds on table rows, or rounded/tinted "cards" in the galley — it is a printed page, not a dashboard.
- **Don't** animate keyboard-driven dismissals slowly; Escape paths exit at ≤0.08–0.15s or instantly.
- **Don't** set a sentence in uppercase, and don't letter-space one. If a line needs a verb and an object to make sense, it is a `Hint`, not a `Label`.
- **Don't** put a label on screen that looks interactive and isn't, and don't say the same fact twice at the same breakpoint (the document's name, its word count). If a decorative label is worth keeping, give it a job in the footer.
