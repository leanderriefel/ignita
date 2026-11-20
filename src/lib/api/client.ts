/**
 * Browser-only typed client for the /api/riot routes.
 *
 * Deliberately client-side (not SSR loaders): every request goes through the
 * browser's HTTP cache, which respects the Cache-Control + stale-while-
 * revalidate headers our API routes set — so revisits and refocuses rarely
 * touch the Riot API at all. SSR-fetching would double every upstream call
 * (server instance + browser) and burn the dev-key budget.
 */

import type { Platform } from "../riot/regions";
import type {
  ChampionMasteryDTO,
  LeagueEntryDTO,
  LiveGameDTO,
  MatchDTO,
  RiotAccount,
  SummonerDTO,
  TimelineDTO,
} from "../riot/types";

export class ApiError extends Error {
  status: number;
  code: string;
  retryAfter?: number;

  constructor(status: number, code: string, message: string, retryAfter?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

async function get<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  if (typeof window === "undefined") {
    throw new ApiError(500, "client_only", "This API client is browser-only by design");
  }

  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, { headers: { accept: "application/json" } });
  const retryAfter = Number(res.headers.get("retry-after")) || undefined;

  if (!res.ok) {
    let code = "upstream_error";
    let message = `Request failed with status ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      code = body.error ?? code;
      message = body.message ?? message;
    } catch {
      // non-JSON error body — keep the defaults
    }
    throw new ApiError(res.status, code, message, retryAfter);
  }

  return (await res.json()) as T;
}

export interface MatchlistOptions {
  start?: number;
  count?: number;
  queue?: number;
  type?: "RANKED" | "NORMAL" | "TOURNEY" | "TUTORIAL";
}

export const api = {
  account: (platform: Platform, name: string, tag: string) =>
    get<RiotAccount>("/api/riot/account", { platform, name, tag }),

  summoner: (platform: Platform, puuid: string) =>
    get<SummonerDTO>("/api/riot/summoner", { platform, puuid }),

  ranked: (platform: Platform, puuid: string) =>
    get<LeagueEntryDTO[]>("/api/riot/ranked", { platform, puuid }),

  mastery: (platform: Platform, puuid: string, count?: number) =>
    get<ChampionMasteryDTO[]>("/api/riot/mastery", { platform, puuid, count }),

  live: (platform: Platform, puuid: string) =>
    get<LiveGameDTO | null>("/api/riot/live", { platform, puuid }),

  matchIds: (platform: Platform, puuid: string, options: MatchlistOptions = {}) =>
    get<string[]>("/api/riot/matches", { platform, puuid, ...options }),

  match: (matchId: string) => get<MatchDTO>(`/api/riot/match/${matchId}`),

  timeline: (matchId: string) => get<TimelineDTO | null>(`/api/riot/timeline/${matchId}`),
} as const;
