/**
 * Server-only Riot API fetch layer.
 *
 * Personal dev keys allow 20 req/1s and 100 req/2min per region, so every
 * request goes through three protections:
 *
 *   1. TTL cache (per server instance, keyed by full URL)
 *   2. In-flight dedupe (concurrent identical requests share one upstream call)
 *   3. Per-host rate limiter with a global cooldown when Riot answers 429
 *
 * Consumers additionally set `Cache-Control` headers so the browser (and any
 * CDN in front of this app) caches before we get hit again.
 */

const SHORT_WINDOW_MS = 1_000;
const SHORT_MAX = 20;
const LONG_WINDOW_MS = 120_000;
const LONG_MAX = 100;

interface CacheEntry<T> {
  expiresAt: number;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Timestamps of accepted requests, per host. */
const shortHits = new Map<string, number[]>();
const longHits = new Map<string, number[]>();
/** Host → epoch ms until which we hold back after a Riot 429. */
const cooldowns = new Map<string, number>();

export type RiotErrorCode =
  | "not_found"
  | "rate_limited"
  | "key_invalid"
  | "missing_api_key"
  | "bad_request"
  | "upstream_error";

export class RiotApiError extends Error {
  status: number;
  code: RiotErrorCode;
  retryAfter?: number;

  constructor(status: number, code: RiotErrorCode, message: string, retryAfter?: number) {
    super(message);
    this.name = "RiotApiError";
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

function pruneHits(list: number[], now: number, windowMs: number): number[] {
  const cutoff = now - windowMs;
  while (list.length > 0 && list[0] < cutoff) {
    list.shift();
  }
  return list;
}

function checkRateLimit(host: string): number {
  const now = Date.now();

  const short = pruneHits(shortHits.get(host) ?? [], now, SHORT_WINDOW_MS);
  const long = pruneHits(longHits.get(host) ?? [], now, LONG_WINDOW_MS);

  const cooldownUntil = cooldowns.get(host) ?? 0;
  if (now < cooldownUntil) {
    return Math.ceil((cooldownUntil - now) / 1000);
  }

  if (long.length >= LONG_MAX) {
    // Oldest long-window hit + 120s = when a slot frees up.
    const retryAfter = Math.max(1, Math.ceil(((long[0] ?? now) + LONG_WINDOW_MS - now) / 1000));
    return retryAfter;
  }
  if (short.length >= SHORT_MAX) {
    const retryAfter = Math.max(1, Math.ceil(((short[0] ?? now) + SHORT_WINDOW_MS - now) / 1000));
    return retryAfter;
  }

  short.push(now);
  long.push(now);
  shortHits.set(host, short);
  longHits.set(host, long);
  return 0;
}

function register429(host: string, retryAfterSeconds: number) {
  const until = Date.now() + Math.max(retryAfterSeconds, 1) * 1000;
  const current = cooldowns.get(host) ?? 0;
  cooldowns.set(host, Math.max(current, until));
}

function apiKey(): string {
  const key = process.env.RIOT_API_KEY;
  if (!key) {
    throw new RiotApiError(503, "missing_api_key", "RIOT_API_KEY is not configured on the server");
  }
  return key;
}

/**
 * Fetch a Riot API URL with caching, dedupe, and rate protection.
 * `ttlMs` controls the in-memory cache; HTTP caching is set per route.
 */
export async function riotFetch<T>(url: string, ttlMs: number): Promise<T> {
  const cached = cache.get(url) as CacheEntry<T> | undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const existing = inflight.get(url) as Promise<T> | undefined;
  if (existing) {
    return existing;
  }

  const host = new URL(url).host;
  const retryAfter = checkRateLimit(host);
  if (retryAfter > 0) {
    throw new RiotApiError(
      429,
      "rate_limited",
      `Local rate budget exhausted for ${host}; retry in ${retryAfter}s`,
      retryAfter,
    );
  }

  const promise = (async () => {
    const res = await fetch(url, {
      headers: { "X-Riot-Token": apiKey() },
    });

    if (res.status === 200) {
      const value = (await res.json()) as T;
      cache.set(url, { expiresAt: Date.now() + ttlMs, value });
      return value;
    }

    if (res.status === 404) {
      // Negative caching: remember "not found" briefly so bursts of
      // searches for the same missing summoner don't hammer upstream.
      const empty = undefined as unknown as T;
      cache.set(url, { expiresAt: Date.now() + 30_000, value: empty });
      throw new RiotApiError(404, "not_found", "Riot API returned 404 for this resource");
    }

    if (res.status === 429) {
      const retryAfterHeader = Number(res.headers.get("retry-after")) || 5;
      register429(host, retryAfterHeader);
      throw new RiotApiError(429, "rate_limited", "Riot API rate limit hit", retryAfterHeader);
    }

    if (res.status === 401 || res.status === 403) {
      throw new RiotApiError(
        503,
        "key_invalid",
        "Riot API key is missing, invalid, or expired (dev keys rotate every 24h)",
      );
    }

    if (res.status === 400) {
      throw new RiotApiError(400, "bad_request", "Riot API rejected the request as malformed");
    }

    throw new RiotApiError(502, "upstream_error", `Riot API responded with status ${res.status}`);
  })();

  inflight.set(url, promise as Promise<unknown>);
  try {
    return await promise;
  } finally {
    inflight.delete(url);
  }
}

/** Cache-Control values used by the API routes. */
export const HTTP_CACHE = {
  account: "public, max-age=600, stale-while-revalidate=3600",
  summoner: "public, max-age=1800, stale-while-revalidate=86400",
  ranked: "public, max-age=300, stale-while-revalidate=1800",
  mastery: "public, max-age=3600, stale-while-revalidate=86400",
  live: "public, max-age=30, stale-while-revalidate=30",
  matchlist: "public, max-age=120, stale-while-revalidate=600",
  /** Match bodies are immutable — cache hard. */
  match: "public, max-age=2592000, stale-while-revalidate=86400",
  timeline: "public, max-age=2592000, stale-while-revalidate=86400",
} as const;

/** Server-side in-memory TTLs (match the HTTP story). */
export const TTL = {
  account: 10 * 60_000,
  summoner: 30 * 60_000,
  ranked: 5 * 60_000,
  mastery: 6 * 60 * 60_000,
  live: 60_000,
  matchlist: 2 * 60_000,
  match: 30 * 24 * 60 * 60_000,
  timeline: 30 * 24 * 60 * 60_000,
} as const;

export function jsonOk(data: unknown, cacheControl: string): Response {
  return Response.json(data, {
    headers: {
      "cache-control": cacheControl,
    },
  });
}

export function jsonError(err: unknown): Response {
  if (err instanceof RiotApiError) {
    const headers: Record<string, string> = { "cache-control": "no-store" };
    if (err.retryAfter) {
      headers["retry-after"] = String(err.retryAfter);
    }
    return Response.json(
      { error: err.code, message: err.message },
      { status: err.status, headers },
    );
  }
  return Response.json(
    { error: "upstream_error", message: "Unexpected server error" },
    { status: 500, headers: { "cache-control": "no-store" } },
  );
}
