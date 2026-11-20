# Ignita — Design Spec (v2)

Source of truth for the frontend build. The design lives in Paper:
**[Ignita — v2](https://app.paper.design/file/01M7WSDZDTE444MXEFKAKFVBSQ)** (v1 file is the archive).

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
- Gridlines `#1F1F23`; baseline `#2E2E31`.
- Win/loss dots: `--color-win` / `--color-loss` with a 2px panel-coloured stroke.
- Terminal dot: gold, 2.75–4.5px, 18–20% halo — the chart's only gold.
- Gold advantage: blue `#5B8DEF` at 28% / red `#E4545E` at 32% areas, dashed `#56565E` zero
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

## Mobile (390px) — pass pending

All four screens get mobile artboards next, then the build implements responsive-first:
lanes collapse into stacks, the scoreboard becomes horizontally scrollable or card-based,
the search cluster goes full-width, charts keep their aspect discipline. Review findings on
"what breaks at 390px" will feed this pass.

---

## Review consensus (filled as reviews land)

_Pending: Grok 4.7 · DeepSeek V4.1 · GLM 5.3 Flash · Muse Spark 1.3._
