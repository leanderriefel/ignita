# Ignita — Frontend Build Plan

Executed in three phases under one owner (Opus 5.5, high effort), each phase ending with
`vp fmt` + `vp check` + `vp build` + a screenshot review pass before the next starts.
Design source of truth: [design-spec.md](design-spec.md). The Paper file "Ignita — v2"
(01M7WSDZDTE444MXEFKAKFVBSQ) is the visual reference — read it via the Paper MCP tools
(get_screenshot for any component you translate).

## Conventions (already in the repo)

- TanStack Start file-based routes under `src/routes/` — `__root.tsx` shell exists.
- Server routes `src/routes/api/riot/*` are DONE and live-tested. Do not modify them.
- Data hooks are DONE in `src/lib/api/queries.ts` (useAccount, useSummoner, useRanked,
  useMastery, useLiveGame, useMatchIds, useMatch, useTimeline, useDDragonVersion,
  useChampions, useItems, useSpells, useRunes). Queue labels in `src/lib/api/queues.ts`.
  Types in `src/lib/riot/types.ts`. Platform list in `src/lib/riot/regions.ts`.
- Styling: Tailwind CSS v4 (`@tailwindcss/vite` is wired in vite.config.ts). Design tokens
  go in `src/styles.css` as a Tailwind `@theme` block derived from design-spec.md, plus the
  component layer. Fonts: `@fontsource-variable/geist` + `@fontsource-variable/geist-mono`
  (already installed — import them in `__root.tsx` or styles.css).
- UI behaviors: `@ui-sdk/react` (unstyled, data-attributes). Declare `@layer ui-sdk;` at the
  top of the global stylesheet (above `@import "tailwindcss"`). Use its parts for Button,
  Tabs, Select/Combobox, Tooltip, Command (⌘K palette), Toast — styled with our tokens.
  Anything simpler stays a plain element.
- Charts: `@tanstack/charts/react` ONLY. Token set in design-spec.md ("Charts" section).
- Animation: `motion/react` — page transitions keyed on pathname in `__root.tsx`, layoutId
  tab underlines, staggered list entrances (0.05s), count-up numerals for hero stats,
  whileInView reveals. Everything fast and quiet (150–250ms, ease-out; no bounce).
- Virtualization: `@tanstack/react-virtual` for the match list (dynamic measurement via
  `measureElement` + `data-index`).
- Formatting/lint: run `npx vp fmt` before commits; `vp check` must pass (Oxlint + Oxfmt).
  Double quotes + semicolons (Oxfmt enforces).
- Responsive-first: every component ships its desktop AND 390px variant in the same file,
  per the design-spec "Mobile mandate".

## Routes to build

| Path                                     | Screen                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`                                      | Landing (hero + search + teaser)                                                                                              |
| `/summoner/$platform/$name/$tag`         | Dashboard (tabs: Overview · Matches · Champions; the live banner renders above when `useLiveGame` returns data)               |
| `/match/$matchId`                        | Match detail (lazy `useTimeline` tab for the gold chart if the timeline is absent → chart falls back to per-frame match data) |
| `/summoner/$platform/$name/$tag/m` alias | Optional: route param for preselected tab                                                                                     |

Search flow: the ⌘K palette (Command from @ui-sdk) + the hero SearchCluster both resolve a
Riot ID → `useAccount` → navigate to `/summoner/{platform}/{gameName}/{tagLine}`. Region
select persists in localStorage. Recent searches persist in localStorage (last 5).

Match list: `useMatchIds` (paged: start/count 20, "Load more" bumps count) →
`useMatch` per id rendered progressively (row skeletons hydrate in place; the immutable
match cache makes revisits instant). Filter state maps to the matchlist `queue`/`type`
params client-side (re-query on change).

## Phase 1 — Foundation + Landing

1. `src/styles.css`: full token `@theme` (design-spec palette + type + spacing + radii),
   base layer (scrollbars, focus ring, selection), `@layer ui-sdk;` declaration, Geist
   font imports.
2. `src/components/ui/*`: Button, Chip, SegmentedControl, Tabs, SearchCluster,
   RegionSelect, Tooltip, Skeleton primitives — styled per spec.
3. `__root.tsx`: fonts, meta (title "Ignita — League match history", theme-color, OG),
   AnimatedOutlet (page transitions), footer with the Riot disclaimer.
4. Landing route: nav (scrim over splash), hero with real splash art (ddragon Zed_0.jpg
   under gradients + surface tokens), SearchCluster with live `useAccount` resolution +
   error states (404 → "No summoner found", 429 → "Rate limited by Riot — retry in Xs",
   key_expired → "API key expired — dev keys rotate every 24h"), teaser rows, numbers
   strip.
5. ⌘K command palette: recent searches, region picker, navigation.
6. Verify: fmt/check/build + screenshots (desktop 1440 + 390) → review wave.

## Phase 2 — Dashboard + Match History

1. Profile hero (splash of most-played champion, surface-over-art cards, LIVE banner).
2. Rank cards (RankCrest SVG neutral, gold LP bars, W/L mono lines).
3. Stats strip (fixed-meaning lines per cell; count-up animation).
4. LP chart + sparklines (TanStack Charts, the chart token set; y-domain = data min/max).
5. Match rows — full 1200px lane budget + Row/Compact variant (same order), LED bars,
   9% tints, champion portraits with level badges, spell stacks, item strips with empty-slot
   fallbacks, teams lane (32px opponent + counts), LP lane, 44px expand tap targets.
6. Match list page: day headers, filter bar (queue/champion/result segmented/sort),
   virtualized list, progressive hydration, expanded insight strip (tags + gold-advantage
   mini chart + damage breakdown), load more.
7. Most Played + Mastery cards (right column).
8. Verify + review wave.

## Phase 3 — Match Detail + Polish

1. Match header (Victory at 64px, scoreline on surface chip, objectives with blue/red
   split bars + first-event times, Loadout card: runes/spells/skill order).
2. Gold-advantage chart (timeline data when present; blue 28% / red 40% areas, dashed zero,
   Baron marker anchored, terminal dot + value label).
3. Scoreboards (table-layout fixed, right-aligned numeric headers, viewed player = lighter
   fill + MVP chip, rank lines at 12px/68%, item scroller under 1200px with sticky player
   column).
4. Motion polish: staggered scoreboard rows, chart entrance, tab layoutId, AnimatePresence
   page transitions everywhere.
5. Responsive QA: 390px variants per the mobile mandate (two-line rows, per-player scoreboard
   cards, Blue|Red tabs, 3+2 objectives, Filter sheet).
6. Full verification wave + fixes.

## After build

- `vp build` → deploy to Vercel (`vercel.json` framework preset exists; set RIOT_API_KEY
  env var; Nitro auto-detects the Vercel preset at build time).
- Domain: ignita.app.
