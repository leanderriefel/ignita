import { useQuery } from "@tanstack/react-query";

import { api, type MatchlistOptions } from "./client";
import { fetchChampions, fetchItems, fetchRunes, fetchSpells, fetchVersions } from "./ddragon";
import type { Platform } from "../riot/regions";

const isBrowser = typeof window !== "undefined";

// ---------------------------------------------------------------------------
// Riot API (via our cached proxy routes)
// ---------------------------------------------------------------------------

export function useAccount(platform: Platform, name: string, tag: string, enabled = true) {
  return useQuery({
    queryKey: ["riot", "account", platform, name.toLowerCase(), tag.toLowerCase()],
    queryFn: () => api.account(platform, name, tag),
    enabled: isBrowser && enabled && Boolean(name) && Boolean(tag),
    staleTime: 10 * 60_000,
  });
}

export function useSummoner(platform: Platform, puuid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["riot", "summoner", platform, puuid],
    queryFn: () => api.summoner(platform, puuid as string),
    enabled: isBrowser && enabled && Boolean(puuid),
    staleTime: 30 * 60_000,
  });
}

export function useRanked(platform: Platform, puuid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["riot", "ranked", platform, puuid],
    queryFn: () => api.ranked(platform, puuid as string),
    enabled: isBrowser && enabled && Boolean(puuid),
    staleTime: 5 * 60_000,
  });
}

export function useMastery(
  platform: Platform,
  puuid: string | undefined,
  count?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: ["riot", "mastery", platform, puuid, count ?? "all"],
    queryFn: () => api.mastery(platform, puuid as string, count),
    enabled: isBrowser && enabled && Boolean(puuid),
    staleTime: 6 * 60 * 60_000,
  });
}

export function useLiveGame(platform: Platform, puuid: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["riot", "live", platform, puuid],
    queryFn: () => api.live(platform, puuid as string),
    enabled: isBrowser && enabled && Boolean(puuid),
    staleTime: 30_000,
    // While a game is live, quietly keep the banner fresh.
    refetchInterval: (query) => (query.state.data ? 60_000 : false),
  });
}

export function useMatchIds(
  platform: Platform,
  puuid: string | undefined,
  options: MatchlistOptions = {},
) {
  return useQuery({
    queryKey: ["riot", "matchlist", platform, puuid, options],
    queryFn: () => api.matchIds(platform, puuid as string, options),
    enabled: isBrowser && Boolean(puuid),
    staleTime: 2 * 60_000,
  });
}

/** Match bodies are immutable — treat them as static once fetched. */
export function useMatch(matchId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["riot", "match", matchId],
    queryFn: () => api.match(matchId as string),
    enabled: isBrowser && enabled && Boolean(matchId),
    staleTime: 30 * 24 * 60 * 60_000,
    gcTime: 7 * 24 * 60 * 60_000,
  });
}

export function useTimeline(matchId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ["riot", "timeline", matchId],
    queryFn: () => api.timeline(matchId as string),
    enabled: isBrowser && enabled && Boolean(matchId),
    staleTime: 30 * 24 * 60 * 60_000,
    gcTime: 7 * 24 * 60 * 60_000,
  });
}

// ---------------------------------------------------------------------------
// Data Dragon (public CDN — no key, no rate budget)
// ---------------------------------------------------------------------------

export function useDDragonVersion() {
  return useQuery({
    queryKey: ["ddragon", "version"],
    queryFn: fetchVersions,
    enabled: isBrowser,
    staleTime: 24 * 60 * 60_000,
    select: (versions: string[]) => versions[0],
  });
}

export function useChampions(version: string | undefined) {
  return useQuery({
    queryKey: ["ddragon", "champions", version],
    queryFn: () => fetchChampions(version as string),
    enabled: isBrowser && Boolean(version),
    staleTime: 7 * 24 * 60 * 60_000,
  });
}

export function useItems(version: string | undefined) {
  return useQuery({
    queryKey: ["ddragon", "items", version],
    queryFn: () => fetchItems(version as string),
    enabled: isBrowser && Boolean(version),
    staleTime: 7 * 24 * 60 * 60_000,
  });
}

export function useSpells(version: string | undefined) {
  return useQuery({
    queryKey: ["ddragon", "spells", version],
    queryFn: () => fetchSpells(version as string),
    enabled: isBrowser && Boolean(version),
    staleTime: 7 * 24 * 60 * 60_000,
  });
}

export function useRunes(version: string | undefined) {
  return useQuery({
    queryKey: ["ddragon", "runes", version],
    queryFn: () => fetchRunes(version as string),
    enabled: isBrowser && Boolean(version),
    staleTime: 7 * 24 * 60 * 60_000,
  });
}
