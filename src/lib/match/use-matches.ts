import { useQueries } from "@tanstack/react-query";
import * as React from "react";

import { api } from "../api/client";
import { useChampions, useDDragonVersion, useRunes, useSpells } from "../api/queries";
import type { Platform } from "../riot/regions";
import type { MatchDTO } from "../riot/types";
import { FALLBACK_DDRAGON_VERSION, type MatchAssetLookups } from "./transform";

const isBrowser = typeof window !== "undefined";
const MATCH_STALE_TIME = 30 * 24 * 60 * 60_000;
const MATCH_GC_TIME = 7 * 24 * 60 * 60_000;
const MATCHLIST_STALE_TIME = 2 * 60_000;

export const PAGE_SIZE = 20;
export const MAX_MATCH_PAGES = 5; // 100 matches cap per Riot match-v5 page window

/**
 * Fetches match bodies progressively for an ordered list of match IDs.
 * Uses the exact same query key as `useMatch(matchId)` so cache entries are
 * shared across Dashboard, Match History, and Match Detail without duplicate calls.
 */
export function useMatches(matchIds: readonly string[]) {
  const queries = useQueries({
    queries: matchIds.map((matchId) => ({
      queryKey: ["riot", "match", matchId] as const,
      queryFn: () => api.match(matchId),
      enabled: isBrowser && Boolean(matchId),
      staleTime: MATCH_STALE_TIME,
      gcTime: MATCH_GC_TIME,
    })),
  });

  const byId = React.useMemo(() => {
    const map = new Map<
      string,
      { data: MatchDTO | undefined; isPending: boolean; isError: boolean; error: unknown }
    >();
    matchIds.forEach((id, index) => {
      const q = queries[index];
      map.set(id, {
        data: q?.data,
        isPending: q ? q.isPending : true,
        isError: q ? q.isError : false,
        error: q?.error ?? null,
      });
    });
    return map;
  }, [matchIds, queries]);

  const resolvedMatches = React.useMemo(() => {
    const list: MatchDTO[] = [];
    for (const q of queries) {
      if (q.data) {
        list.push(q.data);
      }
    }
    return list;
  }, [queries]);

  const pendingCount = queries.filter((q) => q.isPending).length;

  return {
    queries,
    byId,
    resolvedMatches,
    pendingCount,
    isAnyPending: pendingCount > 0,
  };
}

/**
 * Fetches sequential 20-match ID pages (`start = 0, 20, 40...`).
 * Page 0 uses `{ start: 0, count: 20, queue }` so when `queue === undefined`,
 * it shares cache cleanly with the Overview tab.
 */
export function usePagedMatchIds(
  platform: Platform,
  puuid: string | undefined,
  queue: number | undefined,
  pageCount: number,
) {
  const safePages = Math.max(1, Math.min(MAX_MATCH_PAGES, pageCount));
  const pageIndices = React.useMemo(
    () => Array.from({ length: safePages }, (_, idx) => idx),
    [safePages],
  );

  const queries = useQueries({
    queries: pageIndices.map((pageIndex) => {
      const options =
        queue !== undefined
          ? { start: pageIndex * PAGE_SIZE, count: PAGE_SIZE, queue }
          : { start: pageIndex * PAGE_SIZE, count: PAGE_SIZE };
      return {
        queryKey: ["riot", "matchlist", platform, puuid, options] as const,
        queryFn: () => api.matchIds(platform, puuid as string, options),
        enabled: isBrowser && Boolean(puuid),
        staleTime: MATCHLIST_STALE_TIME,
      };
    }),
  });

  const matchIds = React.useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const q of queries) {
      if (q.data) {
        for (const id of q.data) {
          if (!seen.has(id)) {
            seen.add(id);
            out.push(id);
          }
        }
      }
    }
    return out;
  }, [queries]);

  const firstPage = queries[0];
  const lastPage = queries[queries.length - 1];
  const isFetchingNextPage = queries.length > 1 && Boolean(lastPage?.isFetching);
  const hasMore =
    safePages < MAX_MATCH_PAGES && Boolean(lastPage?.data && lastPage.data.length >= PAGE_SIZE);

  return {
    matchIds,
    isInitialLoading: Boolean(firstPage?.isPending),
    isFetchingNextPage,
    hasMore,
    error: firstPage?.error ?? lastPage?.error ?? null,
    refetchFirst: firstPage?.refetch,
  };
}

/**
 * Bundles cached Data Dragon metadata (version, champions, spells, runes).
 * Zero Riot API rate budget.
 */
export function useMatchAssetLookups(): MatchAssetLookups {
  const { data: liveVersion } = useDDragonVersion();
  const version = liveVersion ?? FALLBACK_DDRAGON_VERSION;
  const { data: champions } = useChampions(version);
  const { data: spells } = useSpells(version);
  const { data: runes } = useRunes();

  return React.useMemo(
    () => ({
      version,
      champions,
      spells,
      runes,
    }),
    [version, champions, spells, runes],
  );
}
