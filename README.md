# Ignita

A League of Legends match-history dashboard — full ranked history, live games, champion performance — pulled from the Riot Games API and rendered as a dark, precise, fast "instrument cockpit". Desktop-first, fully responsive on mobile.

**This application isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends © Riot Games, Inc.**

## Stack

| Layer          | Choice                                                                                                                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | [TanStack Start](https://tanstack.com/start) (SSR + server routes), React 19, TanStack Router                                                                                                      |
| Toolchain      | [Vite+](https://viteplus.dev) 1.7 — Vite 8 + Rolldown, **Oxlint**, **Oxfmt**, tsrs type-checks, Vitest. Managed via the `vp` CLI.                                                                  |
| Data           | TanStack Query (SSR-integrated) + selective `localStorage` persistence + aggressive HTTP caching                                                                                                   |
| UI primitives  | Vercel [UI SDK](https://ui-sdk.dev) (`@ui-sdk/react`, unstyled behaviors) styled with Tailwind CSS v4 + design tokens                                                                              |
| Motion         | [`motion`](https://motion.dev) (`motion/react`) — page transitions, layout tabs, staggered lists                                                                                                   |
| Virtualization | TanStack Virtual for the match-history list                                                                                                                                                        |
| Backend        | Server routes under `src/routes/api/riot/*` — an in-memory-cached, rate-guarded Riot API proxy (dev keys allow 20 req/s and 100 req/2min per region, so caching is a feature, not an optimization) |
| Deploy         | Vercel (Nitro preset auto-detects the environment)                                                                                                                                                 |

## Commands

```sh
vp install        # install dependencies (wraps npm)
vp dev            # dev server on :3000
vp check          # format (oxfmt) + lint (oxlint) + type checks in one pass
vp fmt            # format only
vp test           # Vitest
vp build          # production build (Vite 8 + Rolldown + Nitro)
```

## Environment

```sh
cp .env.example .env
```

`RIOT_API_KEY` is a personal development key — it rotates every ~24h, so regenerate it at
[developer.riotgames.com](https://developer.riotgames.com/) when the UI starts reporting an
expired key. The key lives only on the server (never shipped to the browser).

## Architecture notes

- **The browser never talks to Riot directly.** All calls go through `/api/riot/*`, which sets
  `Cache-Control` per endpoint (match bodies are immutable → cached 30 days; live games → 30s).
  Combined with query-level `staleTime` and localStorage persistence, revisits barely touch
  the rate budget.
- **Platform routing** follows Riot's model: platform hosts (`euw1`, `na1`, `kr`, `eun1`, …) for
  summoner/league/mastery/spectator, regional hosts (`americas`/`europe`/`asia`/`sea`) for
  accounts and match-v5. Match IDs embed their platform (`EUW1_…`), so match routes self-route.
- **Data Dragon** (champion squares, items, runes, profile icons) is a public CDN and is fetched
  directly from the browser — no key, no budget.
