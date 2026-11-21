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
2. **Real icons and real images everywhere.** Rank crests are the actual Riot crest artwork
   (Community Dragon rank-crest assets, tone-matched to dark surfaces) — NOT abstract
   monograms or neutral placeholders. Role/position = real glyphs. Champions, items, spells,
   runes, profile icons, splash art = real Data Dragon imagery (already the case). Real
   artwork is **art**, exempt from the gold allowance. UI glyph icons (search, chevrons,
   back, sort) are crisp stroke SVG icons, never text characters.
3. **Simplified type scale.** Four steps only: **13px UI base** (including meta text) /
   **16px emphasis + section titles** / **20px page titles** / **28–40px display heroes**
   (mono numerals may go up to 72px for the one hero stat per screen). The old
   11/12/13px fragmentation is gone. Meta text ships at 13px in muted/meta colors — the
   contrast floors still apply.
4. **No full-uppercase mini headings.** All labels are sentence case, 13px, muted — regular
   or medium weight. (Uppercase survives nowhere except single chips like LIVE / MVP.)
5. **No eyebrows.** The tiny-label-above-heading pattern is removed entirely. Sections start
   directly with their title.
6. **Minimal copy.** No descriptions where they aren't load-bearing. Hero subcopy: one
   short line max. Cards carry no explanatory text. The data speaks; the chrome stays quiet.
7. Everything else in this document (lane grids, gold allowance, chart tokens, contrast
   floors, mono numerals, the mobile mandate) still applies.

---

Designed by Opus 5.5 with real Data Dragon imagery (patch **16.23.1**) — champion squares,
items, summoner spells, rune icons, and splash art all render in Paper, so what you see in
the exports is what production will show. One known gap: profile icon `6128` fails to load;
`4568` was used instead. Item icons should fall back to an empty slot fill if an id 404s.

## Language

Mood: **instrument cockpit** — near-black matte surfaces, hairline borders, Geist for UI,
**Geist Mono for every numeral**, one disciplined gold accent, green/red win/loss LEDs.
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
| fg                          | `oklch(94% 0 0)`                                                                                                                                                                                                      |
| muted-fg                    | `oklch(74% 0 0)`                                                                                                                                                                                                      |
| meta-fg                     | `oklch(66% 0 0)`                                                                                                                                                                                                      |
| faint-fg (11px labels only) | `oklch(62% 0 0)`                                                                                                                                                                                                      |
| popover                     | `#303034`                                                                                                                                                                                                             |
| gold / bright / fg          | `#C8AA6E` / `#E0C98A` / `#17130B`                                                                                                                                                                                     |
| win                         | `oklch(80% 0.14 145)`                                                                                                                                                                                                 |
| loss                        | `oklch(70% 0.12 25)`                                                                                                                                                                                                  |
| team-blue                   | `#5B8DEF`                                                                                                                                                                                                             |
| team-red                    | `#E4545E` (deeper crimson identity fill; loss stays the bright LED)                                                                                                                                                   |
| warning                     | `oklch(80% 0.13 75)` (amber, distinct from gold)                                                                                                                                                                      |
| rank ramp                   | iron `#727278` · bronze `#A87548` · silver `#9CA3AF` · platinum `#3FD6C0` · emerald `#2CBF6E` · diamond `#5B8DEF` · master `#B44ABC` · grandmaster `#E02A2A` · challenger `#F4C542` · gold tier = `var(--color-gold)` |

Type: Geist 40/28/20/16/14/13/12/11 — hero 40 700 tight · display 28 600 · heading 20 600 ·
title 16 600 · body 14 · caption 12 · micro 11 600 uppercase `0.08em` tracking.
Spacing 4/8/12/16/20/24/32/40/48/64. Leading 18/21/28.

## Anatomy

### Match row (1200×92, radius 8, 1px border, gap 24)

- LED bar: 3px absolute left.
- Background: `linear-gradient(90deg, win|loss @ 9% alpha → panel 34%)`.

| Lane     | Width (px) | Notes                                                                                     |
| -------- | ---------- | ----------------------------------------------------------------------------------------- |
| Meta     | 144        | 20px left padding                                                                         |
| Champion | 116        | 56px portrait + two 26px columns, gap 4                                                   |
| KDA      | 136        | mono 20/600; deaths in loss red on defeats, slashes in border-strong                      |
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

1. **Landing** — 800px hero: Zed splash under gradients, 104px headline "Know why you won.",
   search cluster (Riot ID + region + gold Search — the view's only gold moment), example
   chips; rank card + last-game card float over the art; teaser "Seven lanes. Zero noise."
   with the expanded row + two fading rows; 182M mono numbers strip; Riot disclaimer footer.
2. **Summoner Dashboard** — Ahri splash hero with LIVE banner (both team lineups), 56px name,
   two rank cards (gold LP bars); stats strip led by a 72px season KDA; 816px left column:
   LP chart (20 games) + compact rows; 360px right column: mastery card on splash art +
   Most Played table.
3. **Match History** — profile strip on faint splash, white-underline tabs, summary band
   (64px win rate, 20-bar form strip, KDA/KP/CS-per-min deltas, role split), filter bar;
   7 rows grouped under day headers; Ahri row expanded (tags + gold-advantage sparkline +
   damage breakdown); load-more footer.
4. **Match Detail** — back link; 88px green "Victory" on Ahri splash; 38:21 mono scoreline +
   gold totals; objectives (blue/red split bars + first-event times) beside the Loadout card
   (runes, spells, skill order); full-width gold-advantage chart; blue + red scoreboards.
   All numbers reconcile (K/D/A, KP, team gold, +8.4k diff).

## Mobile (390px) — artboards built

All four screens ship as 390px artboards (Landing, Dashboard, Match History, Match Detail);
the build implements responsive-first: lanes collapse into stacks, the scoreboard becomes
player cards, the search cluster goes full-width, charts keep their aspect discipline.
Rule 11 of the mobile mandate applies everywhere: mobile meta never ships below oklch 68%.

---

## Review consensus — BINDING (Grok 4.7 · DeepSeek V4.1 · GLM 5.3 Flash · Muse Spark 1.3)

Verdicts: 8 / 8 / 8.5 / 7 — "flagship, once the system obeys its own manifesto." The lane grid,
data math, and mono numerals passed pixel-level verification; the leaks are token discipline.
Everything below overrides anything above it where they conflict.

### Token amendments

| Change                     | Value                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta-fg` lifted           | `oklch(68% 0 0)` — ALL 12px meta (timestamps, queue names, scoreboards, y-axis numerals at 12px, rank lines). `faint-fg oklch(62%)` stays 11px **uppercase labels only**. Nothing scannable ships below 66%.                                                                                                                                                                                                |
| `--surface-over-art` (new) | `rgba(19,19,21,0.92)` + `backdrop-blur(12px)` — every panel sitting on splash art. Nav scrim: canvas at 88%. Match scoreline "38 : 21" gets its own surface chip (24px padding). No bare text on bright art.                                                                                                                                                                                                |
| Gold tier crest            | own token `#B08D4F` (desaturated) so a Gold-tier lobby doesn't read as ten gold accents. **Crest rule (resolved):** rank color lives in the crest (red Grandmaster, green Emerald, etc. stay) — EXCEPT gold-adjacent tiers: Challenger renders neutral mono (matching the dashboard crest), Gold uses `#B08D4F`. **The only gold in a rank card is the LP bar.** Grandmaster LP bar: gold (never rank-red). |
| Empty item slot            | `bg #161619`, `border 1px #232326` — quieter than any filled slot.                                                                                                                                                                                                                                                                                                                                          |
| Focus ring                 | 2px `--color-fg` at 40%. Never gold.                                                                                                                                                                                                                                                                                                                                                                        |
| Chips                      | ONE chip primitive (neutral). Gold is reserved for the MVP chip alone. No three-style chip groups.                                                                                                                                                                                                                                                                                                          |
| Deltas                     | ±0 renders neutral white. Win-rate bars: always white (no red threshold).                                                                                                                                                                                                                                                                                                                                   |
| Viewed player              | lighter row fill + white name. NO gold edge bar (the MVP chip is the one gold; teams lane keeps the 1.5px white outline).                                                                                                                                                                                                                                                                                   |
| `--color-gold-tap`         | not a token — Search CTA is 50px tall, radius 8, the single gold primary. Sign in becomes a ghost text button.                                                                                                                                                                                                                                                                                              |

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
- Display-size mono numerals ("4.38"): split int/dec spans, decimals at 60% size, separator letter-spacing `-0.16em`. Never let a mono period take an em advance at 72px.
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
- Spec doc resolves its own contradictions: viewed-player edge = white; CTA height = 50px everywhere; count pills = mono 11 everywhere.
- Hero dead space: match-detail hero height −60px, score block baseline-aligned with the outcome word.

## Mobile mandate (390px — artboards to be built from this)

Survives unchanged: type scale, radius ladder, card padding, mono numerals, day headers.

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
