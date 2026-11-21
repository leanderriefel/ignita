import { useQueries, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { api } from "../api/client";
import {
  useChampions,
  useDDragonVersion,
  useInfiniteMatchIds,
  useRunes,
  useSpells,
} from "../api/queries";
import type { Platform } from "../riot/regions";
import type { MatchDTO } from "../riot/types";
import { FALLBACK_DDRAGON_VERSION, type MatchAssetLookups } from "./transform";

const isBrowser = typeof window !== "undefined";
const MATCH_STALE_TIME = 30 * 24 * 60 * 60_000;
const MATCH_GC_TIME = 7 * 24 * 60 * 60_000;

/** Dashboard overview stats + LP trajectory window (1 matchlist call at count=40). */
export const STATS_WINDOW_SIZE = 40;
/** Exported alias consumed by the dashboard overview route for its stats window. */
export const PAGE_SIZE = STATS_WINDOW_SIZE;
/** Infinite-scroll page size for the Matches tab (20 match IDs per page, unbounded depth). */
export const MATCH_HISTORY_PAGE_SIZE = 20;

export interface UseMatchesOptions {
  /**
   * Optional set of match IDs prioritized for fetching (e.g. rows near the
   * virtualizer viewport + initial summary window). Matches already present in
   * the TanStack Query cache always resolve immediately without refetching.
   * When omitted, every ID in `matchIds` is fetched progressively.
   */
  activeIds?: ReadonlySet<string>;
}

/**
 * Fetches match bodies progressively for an ordered list of match IDs.
 * Uses the exact same query key as `useMatch(matchId)` so cache entries are
 * shared across Dashboard, Match History, and Match Detail without duplicate calls.
 */
export function useMatches(matchIds: readonly string[], options?: UseMatchesOptions) {
  const queryClient = useQueryClient();
  const activeIds = options?.activeIds;

  const queries = useQueries({
    queries: matchIds.map((matchId) => {
      const hasCachedBody =
        isBrowser &&
        Boolean(matchId) &&
        queryClient.getQueryData<MatchDTO>(["riot", "match", matchId]) !== undefined;
      const shouldFetch = !activeIds || activeIds.has(matchId) || hasCachedBody;

      return {
        queryKey: ["riot", "match", matchId] as const,
        queryFn: () => api.match(matchId),
        enabled: isBrowser && Boolean(matchId) && shouldFetch,
        staleTime: MATCH_STALE_TIME,
        gcTime: MATCH_GC_TIME,
      };
    }),
  });

  const byId = React.useMemo(() => {
    const map = new Map<
      string,
      {
        data: MatchDTO | undefined;
        isPending: boolean;
        isFetching: boolean;
        isError: boolean;
        error: unknown;
      }
    >();
    matchIds.forEach((id, index) => {
      const q = queries[index];
      map.set(id, {
        data: q?.data,
        isPending: q ? q.isPending : true,
        isFetching: q ? q.isFetching : false,
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

  const pendingCount = queries.filter((q) =>
    activeIds ? q.isPending && q.fetchStatus !== "idle" : q.isPending,
  ).length;

  return {
    queries,
    byId,
    resolvedMatches,
    pendingCount,
    isAnyPending: pendingCount > 0,
  };
}

/**
 * Infinite-scrolling match-v5 ID list (`start = 0, 20, 40, ...`, `count = 20`).
 * Continues deep into match history until Riot returns fewer than 20 IDs.
 */
export function useInfiniteMatchHistoryIds(
  platform: Platform,
  puuid: string | undefined,
  queue: number | undefined,
  enabled = true,
) {
  const query = useInfiniteMatchIds(platform, puuid, {
    queue,
    pageSize: MATCH_HISTORY_PAGE_SIZE,
    enabled,
  });

  const matchIds = React.useMemo(() => {
    const pages = query.data?.pages;
    if (!pages || pages.length === 0) {
      return [];
    }
    const seen = new Set<string>();
    const out: string[] = [];
    for (const page of pages) {
      for (const id of page) {
        if (!seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
      }
    }
    return out;
  }, [query.data?.pages]);

  return {
    matchIds,
    pageCount: query.data?.pages.length ?? 0,
    isInitialLoading: query.isPending,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
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
  const { data: runes } = useRunes(version);

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
