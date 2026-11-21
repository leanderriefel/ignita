# Ignita — Design Spec (v2)

Source of truth for the frontend build. The design lives in Paper:
**[Ignita — v2](https://app.paper.design/file/01M7WSDZDTE444MXEFKAKFVBSQ)** (v1 file is the archive).

## Product owner taste rules — HIGHEST PRIORITY (override anything below where they conflict)

1. **Fewer cards, fainter borders — but separation always exists.** This is a calibration, not
   an anti-card rule. Cards remain a core pattern for true visual units (stats blocks,
   charts, the profile header, match rows, scoreboards, the search shell). What changes:
   no card-in-card nesting; fewer full 1px boxes; repeated rows use single-edge hairline
   dividers instead of individual borders; page sections separate via surface steps
   (canvas → panel → section) + spacing. The dashboard's stat numbers must NOT float —
   group them into one stats strip on a single surface with internal hairline dividers
   (cohesive + scannable). Judgment call per unit: distinct content block → card/strip;
   repeated row → dividers; page section → surface step + spacing. The goal is clean and
   smooth, not boxless.
   **Hairline border system (binding):** ONE border treatment everywhere — **0.5px wide,
   border color at ~60% opacity** (define a `--hairline` token: 0.5px solid
   `color-mix(var(--color-border) 60%, transparent)`). Every card, strip, input, chip,
   divider, scoreboard, and search shell uses it. No full-opacity 1px borders anywhere;
   no borderless cards where a hairline would aid scanning. Consistency is the feature.
   One refinement: dividers **inside a single panel** (stats-strip cells, summary-band
   columns, score-chip rules) use `--color-divider` — `0.5px solid rgb(62 62 68 / 75%)`,
   slightly stronger than the card hairline, because 0.5px `#1D1D1F` is invisible on 1x
   screens. Card edges never change.
2. **Real icons and real images everywhere.** Rank crests are the actual Riot crest artwork
   (Community Dragon rank-crest assets, tone-matched to dark surfaces) — NOT abstract
   monograms or neutral placeholders. Role/position = real glyphs. Champions, items, spells,
   runes, profile icons, splash art = real Data Dragon imagery (already the case). Real
   artwork is **art**, exempt from the gold allowance. UI glyph icons (search, chevrons,
   back, sort) are crisp stroke SVG icons, never text characters.
3. **Simplified type scale.** Four steps only: **13px UI base** (including meta text) /
   **16px emphasis + section titles** / **20px page titles** / **28–40px display heroes**
   (hero display numerals may go up to 80–120px for the one hero stat per screen). The old
   11/12/13px fragmentation is gone. Meta text ships at 13px in muted/meta colors — the
   contrast floors still apply.
4. **No full-uppercase mini headings.** All labels are sentence case, 13px, muted — regular
   or medium weight. (Uppercase survives nowhere except single chips like LIVE / MVP.)
5. **No eyebrows.** The tiny-label-above-heading pattern is removed entirely. Sections start
   directly with their title.
6. **Minimal copy.** No descriptions where they aren't load-bearing. Hero subcopy: one
   short line max. Cards carry no explanatory text. The data speaks; the chrome stays quiet.
7. Everything else in this document (lane grids, gold allowance, chart tokens, contrast
   floors, the mobile mandate) still applies — with this amendment: the "Geist Mono for
   every numeral" rule is DEAD. See rule 8.
8. **Typography: Geist only.** One family for the entire product — no serif, no mono.
   - **Geist** — everything: UI text, labels, meta, all numerals (tabular figures,
     `font-variant-numeric: tabular-nums`, so lane alignment holds), and display heroes
     (larger sizes + 600/700 weight + tighter tracking carry the hierarchy).
   - Geist Mono and Geist Serif are both removed from the system, the token set, the
     Design System page, and the repo fonts. Anywhere the spec below mentions mono or
     serif, read "Geist".

## Experience pass amendments — BINDING (2026-11-21)

Product-owner direction: "Linear-grade" — calm, minimal, smooth. These amend everything below
(including the Paper reference) where they conflict; the taste rules above still apply.

### Logo

- **Mark:** a geometric flame leaning into its tip, with a four-point **spark cut out of its
  core** (evenodd) — ignition. One outer shape + one negative shape, 24-unit grid, readable at
  16px. Source of truth: `BRAND_MARK_PATH` in `src/components/ui/icons.tsx` (inline SVG, never
  raster).
- **Color:** brand gold `#C8AA6E` in the header (the brand mark is part of the gold allowance);
  the footer mark stays neutral `fg` so the footer never adds a second gold.
- **Lockup:** mark 18px + "Ignita" Geist 600 15px, −0.02em, 8px gap.
- **Assets:** `public/favicon.svg` (mark on a `#0A0A0B` rounded-8 tile, 32-grid),
  `public/apple-touch-icon.png` (180², canvas background), `public/og.png` (1200×630: mark +
  88px wordmark + 32px subcopy "Every ranked match, read at a glance.", `ignita.app` top-right).

### Semantic grading (allowed color exception)

Color may encode what a stat **means**. Only the graded **value** takes the color — never the
label, row, or card; neutral fg still dominates. Values between bands stay neutral. Gold never
grades (gold = CTA / brand / LP bar / MVP / chart terminal only).

| Stat      | Green (`--color-win`)                                   | Yellow (`--color-grade-ok`) | Red (`--color-loss`) |
| --------- | ------------------------------------------------------- | --------------------------- | -------------------- |
| KDA ratio | ≥ 3.0                                                   | 1.5 – 3.0                   | < 1.0                |
| CS / min  | ≥ 8.0                                                   | 6.0 – 8.0                   | < 5.0                |
| KP %      | ≥ 65                                                    | 45 – 65                     | < 30                 |
| Vision    | top decile (≥ 1.8/min, ≥ 45/game, or best in the lobby) | —                           | —                    |

`--color-grade-ok` = `oklch(87% 0.15 100)` — a true yellow. The amber `--color-warning` sat too
close to brand gold at display sizes, so grading gets its own token. Applied to: match-row stat
sublines, compact rows, season-strip cells, summary-band metrics, scoreboard KDA / KP / CS-min /
vision. The season-strip **hero** KDA stays neutral (a colored 48px numeral reads loud).
Implementation: `src/components/stats/grading.ts`.

### Calm surfaces & type

- **Splash art is atmosphere, not a hero.** Desaturated (grayscale 60%), opacity 0.22–0.30,
  blended into the canvas with `mask-image` (left + bottom fade). No gradient scrim overlays.
- **Display sizes:** landing headline 48px (32 mobile); profile name 32px (24 mobile); season
  hero KDA 48px (40 mobile, decimals 60%); summary win rate 32px; stat values 24px. Nothing on
  any screen exceeds 56px. Match-detail outcome word target: 40px (see open items).
- **No filler:** an em-dash "delta" line is not rendered — a real delta rides inline after the
  context facts. Unranked rank cards drop the empty LP track (space reserved, nothing drawn).
- **No decorative icons on labels:** the MVP chip is text only; Victory/Defeat chips use fg text
  - a colored dot (color once, not twice).

### Motion

All 150–300ms (count-ups and draw-ins 600–800ms), ease-out `[0.22, 1, 0.36, 1]`, no bounce,
`prefers-reduced-motion` disables every one. Nothing hides server-rendered content.

| Where                          | Motion                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Page change                    | keyed CSS fade, opacity + 4px, 220ms (no AnimatePresence at the root — an `initial={false}` ancestor blocks every nested mount animation) |
| Match rows                     | CSS rise, 10px, 260ms, 40ms batched stagger (cap 10); virtualized remounts never replay                                                   |
| Compact rows                   | route wrapper stagger 40ms, 6px, 200ms                                                                                                    |
| Scoreboard rows / mobile cards | 8px, 250ms, 40ms stagger                                                                                                                  |
| Row hover                      | surface `#161619` + LED 70% → 100%, 150ms; expanded insight strip fades in 200ms                                                          |
| Numerals                       | count-up on data arrival: hero KDA 800ms, stat values / win rate / LP / rank win rate 700–800ms, LP bar width 800ms; tabular figures      |
| Charts                         | gold advantage clip draw-in 700ms; LP chart draw-in 700ms, replays on LP/KDA switch; form-strip bars grow 320ms, 18ms stagger             |
| Below fold                     | `Reveal`: opacity + 12px, 320ms, once, only for content off-screen at mount                                                               |
| Command palette                | scales from its own center: scale .98, 4px, blur 4px, 190ms in / 140ms out                                                                |
| Select / tooltip popups        | grow from their trigger: scale .98, 4px, blur 2px, 170ms                                                                                  |
| Inputs / buttons               | search shell hairline-strong + 3px fg-7% ring; CTA arrow nudges 2px; press scale .98                                                      |

### Landing (replaces the Paper landing)

Nav / hero (quiet Zed art, "Know why you won.", one subcopy line, the search cluster as the
single gold moment) / facts strip (Regions 16 · Patch live · Tracking none — facts only) /
footer. Removed: example summoner chips, teaser rows ("Seven lanes. Zero noise."), floating
sample cards, and every invented number ("182M matches parsed", "0.38s median lookup").

---

Designed by Opus 5.5 with real Data Dragon imagery (patch **16.23.1**) — champion squares,
items, summoner spells, rune icons, and splash art all render in Paper, so what you see in
the exports is what production will show. One known gap: profile icon `6128` fails to load;
`4568` was used instead. Item icons should fall back to an empty slot fill if an id 404s.

## Language

Mood: **instrument cockpit** — near-black matte surfaces, hairline borders, one family
(Geist, tabular figures), one disciplined gold accent, green/red win/loss LEDs.
Style bar: Linear, Vercel dashboard, loltv.gg.

### Rules (binding)

1. **Gold allowance** — gold is: the primary Search CTA, the brand mark, LP progress bars,
   and ONE achievement accent per view (e.g. the MVP chip). Gold never encodes a number.
   LIVE = neutral chip + green dot. Selected tab underline = white.
2. **Lanes** — every repeated row uses fixed-width `flex-shrink: 0` lanes so all rows share
   vertical lanes; item strips are hard slotted lanes with zero text overlap.
3. **Contrast** — 12px meta text lives around oklch(66–74%); oklch(62%) is reserved for 11px
   uppercase micro-labels. Disabled ≠ loading (two visually distinct states).
4. **Radii** — 4 (item slots) / 6 (small controls, level badges) / 8 (rows, buttons,
   segmented) / 12 (cards, search shell) / full (pills).
5. **Deltas** — positive = win green, negative = loss red, neutral = white. Never gold.
6. **Rank ramp** — 10 tiers, neutral text, tinted borders + colored dots; no glow, no
   unique ring on Challenger (a ring means selected/focus).
7. **Damage breakdown** — flat neutral-grey segments with 2px gaps (physical/magic/true at
   94% / 62% / 40% lightness); true damage is off-white, never gold.

### Palette

| Token                       | Value                                                                                                                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| canvas                      | `#0A0A0B`                                                                                                                                                                                                             |
| panel                       | `#131315`                                                                                                                                                                                                             |
| section                     | `#1B1B1E`                                                                                                                                                                                                             |
| control                     | `#26262A`                                                                                                                                                                                                             |
| control-active / border     | `#2E2E31`                                                                                                                                                                                                             |
| border-strong               | `#3E3E44`                                                                                                                                                                                                             |
| divider (same-surface)      | `rgb(62 62 68 / 75%)` — dividers inside one panel: stats-strip cells, summary-band columns, score-chip rules                                                                                                          |
| fg                          | `oklch(94% 0 0)`                                                                                                                                                                                                      |
| muted-fg                    | `oklch(74% 0 0)`                                                                                                                                                                                                      |
| meta-fg                     | `oklch(68% 0 0)`                                                                                                                                                                                                      |
| faint-fg (11px labels only) | `oklch(62% 0 0)`                                                                                                                                                                                                      |
| popover                     | `#303034`                                                                                                                                                                                                             |
| gold / bright / fg          | `#C8AA6E` / `#E0C98A` / `#17130B`                                                                                                                                                                                     |
| win                         | `oklch(80% 0.14 145)`                                                                                                                                                                                                 |
| loss                        | `oklch(70% 0.12 25)`                                                                                                                                                                                                  |
| team-blue                   | `#5B8DEF`                                                                                                                                                                                                             |
| team-red                    | `#E4545E` (deeper crimson identity fill; loss stays the bright LED)                                                                                                                                                   |
| warning                     | `oklch(80% 0.13 75)` (amber, distinct from gold)                                                                                                                                                                      |
| rank ramp                   | iron `#727278` · bronze `#A87548` · silver `#9CA3AF` · platinum `#3FD6C0` · emerald `#2CBF6E` · diamond `#5B8DEF` · master `#B44ABC` · grandmaster `#E02A2A` · challenger `#F4C542` · gold tier = `var(--color-gold)` |

Type: Geist 40/28/20/16/13 — display heroes 40–120 600/700 tight (−0.03 to −0.04em) ·
heading 20 600 · title 16 600 · UI base 13 · meta 13 (`--color-meta-fg`, 68%).
All numerals tabular (`font-variant-numeric: tabular-nums`). Uppercase survives only in
single chips (LIVE / MVP / VICTORY / DEFEAT).
Spacing 4/8/12/16/20/24/32/40/48/64. Leading 18/21/28.

### Hairline

One border treatment everywhere: `0.5px solid rgb(46 46 49 / 60%)` (token
`--color-hairline`, width `--hairline-width`). Cards, strips, inputs, chips, scoreboards
and the search shell all use it — no full-opacity 1px borders; row dividers use one edge
only. Real crest art is exempt from the gold allowance; role slots use the real Riot
position glyphs.

**Divider (same-surface):** `0.5px solid rgb(62 62 68 / 75%)` (token
`--color-divider`). Every divider that sits **inside one panel** — stats-strip cell edges,
summary-band columns, score-chip rules — uses this instead of the card hairline. It is
deliberately slightly stronger: `0.5px solid #1D1D1F` disappears against `#131315` on 1x
screens, and the seam has to be visible to separate same-surface columns. Card edges keep
`--color-hairline`; never mix the two on one edge.

## Anatomy

### Match row (1200×92, radius 8, 1px border, gap 24)

- LED bar: 3px absolute left.
- Background: `linear-gradient(90deg, win|loss @ 9% alpha → panel 34%)`.

| Lane     | Width (px) | Notes                                                                                     |
| -------- | ---------- | ----------------------------------------------------------------------------------------- |
| Meta     | 144        | 20px left padding                                                                         |
| Champion | 116        | 56px portrait + two 26px columns, gap 4                                                   |
| KDA      | 136        | Geist 20/600 tnum; deaths in loss red on defeats, slashes in border-strong                |
| Stats    | flex 1     |                                                                                           |
| Items    | 222        | 6 × 28px radius-4 slots, gap 3, 8px spacer, 28px round trinket                            |
| Teams    | 102        | 5 × 18px champion icons per side; enemy at 55% opacity, viewed player 1.5px white outline |
| LP       | 64         | right-aligned                                                                             |
| Expand   | 44         | left border                                                                               |

### Compact row (816×64, gap 20, padding 16)

Lanes: 40 / 112 / 112 / flex / 184 (24px items) / 52.

### Scoreboard row (60px tall, padding 0 20, gap 20)

player flex · KDA 120 · damage 168 (bar 120×4) · gold 72 · CS 64 · vision 56 · items 198
(26px slots). Viewed player: 2px gold left edge + 6% gold tint + MVP chip.

### Paddings

| Element                 | Padding    |
| ----------------------- | ---------- |
| Cards                   | 20–24 / 24 |
| Stats-strip hero cell   | 24 / 28    |
| Insight strip columns   | 20 / 24    |
| Team header (56px tall) | 0 20       |
| Content container       | **1200px** |

## Charts (build with `@tanstack/charts/react`)

- LP + sparkline lines: `#D6D6D6`, 1.5px stroke; area fill white 10% → 0.
- Gridlines `#2A2A30`; baseline `#2E2E31`.
- Win/loss dots: `--color-win` / `--color-loss` with a 2px panel-coloured stroke.
- Terminal dot: gold, 2.75–4.5px, 18–20% halo — the chart's only gold.
- Gold advantage: blue `#5B8DEF` at 28% / red `#E4545E` at 40% areas, dashed `#56565E` zero
  line (4/4), minute ticks.
- Damage types: neutral greys at 94% / 62% / 40% lightness.

## Component inventory (React)

`TopNav` · `BrandMark` · `SearchCluster` · `RegionSelect` · `Button` (primary/secondary/
ghost/icon) · `Chip` (Live/MVP/Tag/Count/Mastery) · `SegmentedControl` · `FilterSelect` ·
`Tabs` · `ProfileHeader` (splash hero) · `LiveBanner` · `RankCard` · `RankCrest(tier)` ·
`LpProgress` · `StatsStrip` · `StatCell` · `StatCard` (sparkline) · `FormStrip` ·
`RoleSplit` · `LpChart` · `MatchRow` · `MatchRowCompact` · `MatchInsightStrip` ·
`DamageBreakdown` · `Sparkline` · `DayHeader` · `ItemStrip` · `ChampionPortrait` (level
badge) · `SpellRuneStack` · `TeamIconStrip` · `MasteryHeroCard` · `MostPlayedTable` ·
`MatchHeader` · `Scoreline` · `ObjectivesCard` · `LoadoutCard` · `GoldAdvantageChart` ·
`Scoreboard`/`PlayerRow` · `LoadMore` · `MatchRowSkeleton`.

## Screens (desktop, built in Paper)

1. **Landing** — superseded by "Experience pass amendments → Landing": quiet masked Zed art,
   48px headline, one subcopy line, search cluster (the view's only gold moment), facts strip
   (regions, live patch, no tracking), Riot disclaimer footer. No example data.
2. **Summoner Dashboard** — Ahri splash hero with LIVE banner (both team lineups), 56px name,
   two rank cards (gold LP bars); 1200×168 stats strip led by a 240px hero cell: 48px season
   KDA (decimals at 60%), five 192px cells at 24px values (graded), every label/context/delta 13px,
   context is facts only (`412W 331L`, `Season 2026`, em dash — never sentences), dividers
   `--color-divider`; 816px left column:
   LP chart (20 games) + compact rows; 360px right column: mastery card on splash art +
   Most Played table.
3. **Match History** — profile strip on faint splash, white-underline tabs, 1200×132 summary
   band (columns 200/280/160/150/150/160, 40px win rate leading, 20-bar form strip at 8×20
   with 2px gaps, 20px KDA/KP/CS values, 13px role counts with real position glyphs);
   filter bar;
   7 rows grouped under day headers; Ahri row expanded (tags + gold-advantage sparkline +
   damage breakdown); load-more footer.
4. **Match Detail** — back link; 40px green "Victory" (target — route still renders 88px, see experience amendments) on quiet masked art (Geist 600, −0.035em);
   score chip on `--surface-over-art` (min-width 420, radius 12, padding 16/20): team row on
   top (6px pips + 13px Blue/Red), 40px tabular `38 : 21` with both numbers at `--color-fg`
   and a `--color-border-strong` colon at 10px gaps, gold total 20px/600 baseline-aligned
   24px left of the score with a 13px `vs 54.8k` suffix; objectives (blue/red split bars + first-event times) beside the Loadout card
   (runes, spells, skill order); full-width gold-advantage chart; blue + red scoreboards.
   All numbers reconcile (K/D/A, KP, team gold, +8.4k diff).

## Mobile (390px) — artboards built

All four screens ship as 390px artboards (Landing, Dashboard, Match History, Match Detail);
the build implements responsive-first: lanes collapse into stacks, the scoreboard becomes
player cards, the search cluster goes full-width, charts keep their aspect discipline.
Rule 11 of the mobile mandate applies everywhere: mobile meta never ships below oklch 68%.

The three sections above keep their proportions at 390: the stats strip stacks the hero
cell (40px KDA, decimals at 60%) over a 2×3 grid of 20px values, the summary band keeps the
40px win rate hero with the centered 20-bar form strip over a 2×3 grid, and the score chip
keeps the team row on top with a 36px `38 : 21`. Dividers are `--color-divider` at every
breakpoint.

---

## Review consensus — BINDING (Grok 4.7 · DeepSeek V4.1 · GLM 5.3 Flash · Muse Spark 1.3)

Verdicts: 8 / 8 / 8.5 / 7 — "flagship, once the system obeys its own manifesto." The lane grid,
data math, and mono numerals passed pixel-level verification; the leaks are token discipline.
Everything below overrides anything above it where they conflict.

### Token amendments

| Change                     | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta-fg` lifted           | `oklch(68% 0 0)` — ALL 12px meta (timestamps, queue names, scoreboards, y-axis numerals at 12px, rank lines). `faint-fg oklch(62%)` stays 11px **uppercase labels only**. Nothing scannable ships below 66%.                                                                                                                                                                                                                                              |
| `--surface-over-art` (new) | `rgba(19,19,21,0.92)` + `backdrop-blur(12px)` — every panel sitting on splash art. Nav scrim: canvas at 88%. Match scoreline "38 : 21" gets its own surface chip (24px padding). No bare text on bright art.                                                                                                                                                                                                                                              |
| Gold tier crest            | own token `#B08D4F` (desaturated) so a Gold-tier lobby doesn't read as ten gold accents. **Crest rule (resolved):** every tier uses the real Riot crest art, tone-matched (brightness 92% / saturate 94%) — rank color lives in the art itself. The crest name/ramp label uses the tier token; Gold's label is `#B08D4F`, Challenger's label stays neutral. **The only gold UI in a rank card is the LP bar.** Grandmaster LP bar: gold (never rank-red). |
| Empty item slot            | `bg #161619`, `border 1px #232326` — quieter than any filled slot.                                                                                                                                                                                                                                                                                                                                                                                        |
| Focus ring                 | 2px `--color-fg` at 40%. Never gold.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Chips                      | ONE chip primitive (neutral). Gold is reserved for the MVP chip alone. No three-style chip groups.                                                                                                                                                                                                                                                                                                                                                        |
| Deltas                     | ±0 renders neutral white. Win-rate bars: always white (no red threshold).                                                                                                                                                                                                                                                                                                                                                                                 |
| Viewed player              | lighter row fill + white name. NO gold edge bar (the MVP chip is the one gold; teams lane keeps the 1.5px white outline).                                                                                                                                                                                                                                                                                                                                 |
| `--color-gold-tap`         | not a token — Search CTA is 50px tall, radius 8, the single gold primary. Sign in becomes a ghost text button.                                                                                                                                                                                                                                                                                                                                            |

### Match row — final lane budget (closes the arithmetic to 1200)

`meta 144 (carries the 20px left pad) | 24 | champion 116 | 24 | kda 136 | 24 | stats 172 (right-aligned block, the flex absorber) | 24 | items 222 (6×28 r4 gap 3 + 12px gutter + 28 round trinket, all inside the lane) | 24 | teams 132 | 24 | lp 64 (right) | 24 | expand 44 (flush right)`

Closes exactly: `144 + 116 + 136 + 172 + 222 + 132 + 64 + 44 = 1030` + `7 gaps × 24 = 168` + `2 × 1px border = 1200`.
The 20px left pad lives inside the meta lane, so there is no extra side padding to add.

- Champion lane fits 116 by **stacking the two summoner spells in a 22px column** beside the 56px portrait.
- **Teams lane = 132px**: the lane opponent at 32px, then `+4` and `+4` counts (enemy at 55% opacity). The full 5v5 comp moves into the expansion. No 2×5 grids of 22px squares — those are unreadable.
- Meta hierarchy: `Victory` 15/600 at 94% (the bright line) · queue name 13/400 at 68% · timestamp 12 at 68%.
- Expand chevron: 14px at 70% opacity, the full 44px lane is the tap target, hover + pressed states.
- Skeleton = exact lane clone (meta 3 bars · champion 1 square + 2 chips · KDA 1 bar · items 7 squares · LP 1 bar).

### Row/Compact — named variant (dashboard, 816px, height 64, padding 16, gap 20)

Same **column order** as the full row — result/meta first, then champion, KDA, items, LP.
Lanes: `meta 96 | champion 84 (36px portrait + stacked spells) | kda 96 | stats auto | items 184 (24px) | lp 52`.
Never fork the row; derive from the same lane tokens.

### Charts — one primitive set (TanStack Charts everywhere)

- Line `#D6D6D6` 1.5px · gridlines `#2A2A30` · baseline `#2E2E31` · zero line dashed `#56565E` 4/4.
- Gold-advantage areas: blue `#5B8DEF` at 28% / red `#E4545E` at **40%** (with a 1.5px red stroke on negative segments so "we were behind" is visible).
- Win/loss dots with 2px panel-coloured stroke. **Every chart ends in a gold terminal dot** — including the match-detail gold-advantage chart — plus a terminal value label (12px @ 68%).
- Baron pill anchored to its marker line (+8px, 24px connector rule). Header trio: the lead number (`+8.6k`) largest; `31:42`-style timestamps, never `31M`.
- LP chart y-domain = the data's min/max + padding (never a padded 150-LP range that flattens a climb).
- Display-size tabular numerals ("4.38"): Geist 600, decimals at 60% size, separator letter-spacing `-0.16em`, `font-variant-numeric: tabular-nums`.
- Mini gold-advantage chart reuses the exact same zero/grid/line tokens as the full chart.

### Scoreboard

`table-layout: fixed` · right-aligned numeric headers on the same right edges as their columns (PLAYER + ITEMS left) · items 22px gap 4 · under 1200px: horizontal scroll with sticky player column · rank lines 12px @ 68% · team headers show `63.2k gold` (label every number).

### Other fixes

- Landing: third demo row ends on its border (`mask-image` fade inside a bordered container), never clipped mid-glyph. Nav gets the scrim.
- Dashboard gaps collapse to a 3-step scale: `8 / 16 / 32` (audit every gap).
- Stat strips: every cell has fixed-meaning lines — line 3 context (W/L, patch, season), line 4 delta or em dash.
- Filter "All" dot is neutral; green/red belong to Wins/Losses only.
- Expanded-row body declares its own 3-column template in the spec (it is not part of the 8-lane grid).
- "NEWEST →" hint attaches to the sort control or disappears.
- Chart legends move to header rows, never inside the plot.
- Spec doc resolves its own contradictions: viewed-player edge = white; CTA height = 50px everywhere; count pills = Geist 13 tabular everywhere.
- Hero dead space: match-detail hero height −60px, score block baseline-aligned with the outcome word.

## Mobile mandate (390px — artboards to be built from this)

Survives unchanged: type scale, radius ladder, card padding, tabular numerals, day headers.

1. **Row/390 is a second component, not a squeeze.** Two lines: line 1 = LED + result/time + 40px portrait + KDA + LP + chevron (44px tap target); line 2 = 7 item slots at 24px. Stats and teams move into the expansion; the teams icons are the first thing cut.
2. **Scoreboard → per-player cards**: portrait + name + KDA on line 1, damage bar line 2, `gold / CS / vision` as one meta line, items scroller beneath. Teams become Blue | Red tabs (or sticky team headers).
3. **Objectives** wrap 3+2, split bars kept.
4. **Stat strips**: hero cell full-width, rest in a 2×3 grid.
5. **Landing hero**: splash shrinks to a ~200px top band; rank + last-game cards stack under the search; Search CTA full-width 48px.
6. **Live banner**: one line of meta + `Spectate →`; rosters behind a tap.
7. **Filter bar**: one `Filter` button with a count badge → sheet.
8. **Charts**: y-axis reduces to two labels (peak, zero); Baron marker moves to the caption row.
9. **Profile name**: 32px max on mobile, truncate at 14 chars + ellipsis, tag at 70% on its own line.
10. **Touch**: pressed states for everything; no hover-only affordances; item icons ≥ 32px targets where interactive.
11. Mobile meta never ships below the repaired oklch 68%.
