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
  startTime?: number;
  endTime?: number;
}

/**
 * Lightweight client-side pacer for `api.match()` calls.
 *
 * Riot dev keys allow 20 req/1s per regional host. When a page of 20–40 match
 * IDs hydrates simultaneously, firing all fetches in one tick trips the short
 * 1s window on the proxy and forces 4s/15s TanStack retries. Pacing network
 * fetches to <=14/s with max 6 concurrent requests keeps hydration streaming
 * smoothly while letting instant browser HTTP cache hits (<25ms) bypass the
 * 1s bucket completely.
 */
const MAX_CONCURRENT_MATCH_FETCHES = 6;
const MAX_NETWORK_MATCH_FETCHES_PER_SEC = 14;
const NETWORK_WINDOW_MS = 1_050;
const CACHE_HIT_THRESHOLD_MS = 25;

interface QueuedTask<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

const matchQueue: QueuedTask<unknown>[] = [];
const networkHitTimestamps: number[] = [];
let activeMatchFetches = 0;
let matchCooldownUntil = 0;
let matchDrainTimer: ReturnType<typeof setTimeout> | null = null;

function pruneNetworkHits(now: number) {
  const cutoff = now - NETWORK_WINDOW_MS;
  while (networkHitTimestamps.length > 0 && networkHitTimestamps[0]! < cutoff) {
    networkHitTimestamps.shift();
  }
}

function scheduleMatchDrain(delayMs: number) {
  if (matchDrainTimer !== null) {
    return;
  }
  matchDrainTimer = setTimeout(
    () => {
      matchDrainTimer = null;
      drainMatchQueue();
    },
    Math.max(16, delayMs),
  );
}

function drainMatchQueue() {
  if (matchQueue.length === 0) {
    return;
  }

  const now = Date.now();
  if (now < matchCooldownUntil) {
    scheduleMatchDrain(matchCooldownUntil - now);
    return;
  }

  pruneNetworkHits(now);

  while (matchQueue.length > 0 && activeMatchFetches < MAX_CONCURRENT_MATCH_FETCHES) {
    pruneNetworkHits(Date.now());
    if (networkHitTimestamps.length >= MAX_NETWORK_MATCH_FETCHES_PER_SEC) {
      const oldest = networkHitTimestamps[0] ?? Date.now();
      scheduleMatchDrain(oldest + NETWORK_WINDOW_MS - Date.now() + 10);
      return;
    }

    const task = matchQueue.shift();
    if (!task) {
      return;
    }

    activeMatchFetches += 1;
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();

    void task
      .fn()
      .then((value) => {
        const elapsed =
          (typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt;
        if (elapsed >= CACHE_HIT_THRESHOLD_MS) {
          networkHitTimestamps.push(Date.now());
        }
        task.resolve(value);
      })
      .catch((err: unknown) => {
        networkHitTimestamps.push(Date.now());
        if (err instanceof ApiError && err.status === 429) {
          const waitSec = Math.min(15, Math.max(1, Math.ceil(err.retryAfter ?? 2)));
          matchCooldownUntil = Math.max(matchCooldownUntil, Date.now() + waitSec * 1000);
        }
        task.reject(err);
      })
      .finally(() => {
        activeMatchFetches -= 1;
        drainMatchQueue();
      });
  }
}

function scheduleMatchFetch<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    matchQueue.push({
      fn,
      resolve: resolve as (value: unknown) => void,
      reject,
    });
    drainMatchQueue();
  });
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

  match: (matchId: string) => scheduleMatchFetch(() => get<MatchDTO>(`/api/riot/match/${matchId}`)),

  timeline: (matchId: string) => get<TimelineDTO | null>(`/api/riot/timeline/${matchId}`),
} as const;
