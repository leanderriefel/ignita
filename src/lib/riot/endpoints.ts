/**
 * Typed Riot API endpoint helpers (server-only).
 * All durations/counts are clamped to documented limits before hitting upstream.
 */

import {
  platformHost,
  platformFromMatchId,
  regionalHost,
  regionRouteFor,
  type Platform,
} from "./regions";
import { riotFetch, TTL } from "./http";
import type {
  ChampionMasteryDTO,
  LeagueEntryDTO,
  LiveGameDTO,
  MatchDTO,
  RiotAccount,
  SummonerDTO,
  TimelineDTO,
} from "./types";

/** account-v1 — regional host, 10 min cache (renames make it stale, puuid is permanent). */
export function getAccountByRiotId(
  platform: Platform,
  gameName: string,
  tagLine: string,
): Promise<RiotAccount> {
  const url = `https://${regionalHost(regionRouteFor(platform))}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  return riotFetch<RiotAccount>(url, TTL.account);
}

/** summoner-v4 — platform host. */
export function getSummonerByPuuid(platform: Platform, puuid: string): Promise<SummonerDTO> {
  const url = `https://${platformHost(platform)}/lol/summoner/v4/summoners/by-puuid/${encodeURIComponent(puuid)}`;
  return riotFetch<SummonerDTO>(url, TTL.summoner);
}

/** league-v4 — platform host, puuid-scoped. Empty result is a valid state. */
export async function getLeagueEntries(
  platform: Platform,
  puuid: string,
): Promise<LeagueEntryDTO[]> {
  const url = `https://${platformHost(platform)}/lol/league/v4/entries/by-puuid/${encodeURIComponent(puuid)}`;
  const entries = await riotFetch<LeagueEntryDTO[]>(url, TTL.ranked);
  return entries ?? [];
}

/**
 * champion-mastery-v4 — platform host, puuid-scoped.
 * `count` only limits on the /top sub-route; without it we return the full list.
 */
export async function getChampionMasteries(
  platform: Platform,
  puuid: string,
  count?: number,
): Promise<ChampionMasteryDTO[]> {
  const base = `https://${platformHost(platform)}/lol/champion-mastery/v4/champion-masteries/by-puuid/${encodeURIComponent(puuid)}`;
  const url = count ? `${base}/top?count=${count}` : base;
  const masteries = await riotFetch<ChampionMasteryDTO[]>(url, TTL.mastery);
  return masteries ?? [];
}

/** spectator-v5 — 404 means "not in game", normalized to null. */
export async function getLiveGame(platform: Platform, puuid: string): Promise<LiveGameDTO | null> {
  const url = `https://${platformHost(platform)}/lol/spectator/v5/active-games/by-summoner/${encodeURIComponent(puuid)}`;
  try {
    return await riotFetch<LiveGameDTO>(url, TTL.live);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "not_found") {
      return null;
    }
    throw err;
  }
}

export interface MatchlistQuery {
  start?: number;
  count?: number;
  queue?: number;
  type?: "RANKED" | "NORMAL" | "TOURNEY" | "TUTORIAL";
  startTime?: number; // epoch seconds
  endTime?: number; // epoch seconds
}

/** match-v5 matchlist — regional host. `count` clamped to 0–100. */
export function getMatchIds(
  platform: Platform,
  puuid: string,
  query: MatchlistQuery = {},
): Promise<string[]> {
  const params = new URLSearchParams();
  if (query.start !== undefined) {
    params.set("start", String(Math.max(0, Math.floor(query.start))));
  }
  const count =
    query.count === undefined ? 20 : Math.min(100, Math.max(1, Math.floor(query.count)));
  params.set("count", String(count));
  if (query.queue !== undefined) {
    params.set("queue", String(query.queue));
  }
  if (query.type !== undefined) {
    params.set("type", query.type);
  }
  if (query.startTime !== undefined) {
    params.set("startTime", String(Math.floor(query.startTime)));
  }
  if (query.endTime !== undefined) {
    params.set("endTime", String(Math.floor(query.endTime)));
  }
  const url = `https://${regionalHost(regionRouteFor(platform))}/lol/match/v5/matches/by-puuid/${encodeURIComponent(puuid)}/ids?${params.toString()}`;
  return riotFetch<string[]>(url, TTL.matchlist);
}

/** match-v5 match detail — immutable body, served from the platform embedded in the match id. */
export function getMatch(matchId: string): Promise<MatchDTO> {
  const platform = platformFromMatchId(matchId);
  if (!platform) {
    throw new Error(`Cannot infer platform from match id: ${matchId}`);
  }
  const url = `https://${regionalHost(regionRouteFor(platform))}/lol/match/v5/matches/${encodeURIComponent(matchId)}`;
  return riotFetch<MatchDTO>(url, TTL.match);
}

/** match-v5 timeline — not every match has one; 404 is normalized to null. */
export async function getTimeline(matchId: string): Promise<TimelineDTO | null> {
  const platform = platformFromMatchId(matchId);
  if (!platform) {
    throw new Error(`Cannot infer platform from match id: ${matchId}`);
  }
  const url = `https://${regionalHost(regionRouteFor(platform))}/lol/match/v5/matches/${encodeURIComponent(matchId)}/timeline`;
  try {
    return await riotFetch<TimelineDTO>(url, TTL.timeline);
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as { code?: string }).code === "not_found") {
      return null;
    }
    throw err;
  }
}
