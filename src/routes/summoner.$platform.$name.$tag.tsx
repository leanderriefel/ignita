import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import * as React from "react";

import { useCommandPalette } from "../components/command";
import { MatchRowCompact, MatchRowCompactSkeleton } from "../components/match";
import { SeasonStrip } from "../components/stats";
import {
  LpChart,
  MasteryCard,
  MatchHistoryTab,
  MostPlayedCard,
  ProfileHero,
  ProfileHeroSkeleton,
  type ChartDisplayMode,
} from "../components/summoner";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  SearchIcon,
  Skeleton,
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
} from "../components/ui";
import { ApiError } from "../lib/api/client";
import {
  useAccount,
  useLiveGame,
  useMastery,
  useMatchIds,
  useRanked,
  useSummoner,
} from "../lib/api/queries";
import { encodeReferrerParam } from "../lib/match/detail";
import {
  buildMatchRowViewModel,
  computeMostPlayed,
  computePerformanceSeries,
  computeSeasonStripData,
  resolveChampionIdentity,
} from "../lib/match/transform";
import { PAGE_SIZE, useMatchAssetLookups, useMatches } from "../lib/match/use-matches";
import { useRecentSearches } from "../lib/preferences";
import { formatRiotError } from "../lib/riot-id";
import { getPlatformInfo, isPlatform, type Platform } from "../lib/riot/regions";
import type { MatchDTO } from "../lib/riot/types";

export type SummonerTab = "overview" | "matches";

export const Route = createFileRoute("/summoner/$platform/$name/$tag")({
  validateSearch: (search: Record<string, unknown>): { tab?: SummonerTab } => ({
    tab: search.tab === "matches" ? "matches" : undefined,
  }),
  component: SummonerDashboardPage,
});

function SeasonStripSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-[1200px] overflow-hidden rounded-[12px] bg-panel hairline-divider"
    >
      <div className="grid min-h-[168px] grid-cols-2 lg:grid-cols-[240px_repeat(5,minmax(0,1fr))]">
        <div className="col-span-2 flex flex-col justify-between gap-3 px-7 py-6 max-lg:hairline-divider-b lg:col-span-1 lg:hairline-divider-r">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-14 w-32" />
          <Skeleton className="h-3.5 w-24 opacity-65" />
        </div>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between gap-3 px-6 py-5 lg:hairline-divider-r lg:last:border-r-0"
          >
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3.5 w-20 opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SummonerDashboardPage() {
  const { platform, name, tag } = Route.useParams();
  const { tab: searchTab } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setOpen: openCommandPalette } = useCommandPalette();
  const { recordSearch } = useRecentSearches();

  const validPlatform: Platform | null = isPlatform(platform) ? platform : null;
  const platformInfo = validPlatform ? getPlatformInfo(validPlatform) : null;
  const safePlatform: Platform = validPlatform ?? "kr";

  const activeTab: SummonerTab = searchTab === "matches" ? "matches" : "overview";
  const [chartMode, setChartMode] = React.useState<ChartDisplayMode>("lp_estimated");
  const [retryCountdown, setRetryCountdown] = React.useState(0);

  const lookups = useMatchAssetLookups();

  // 1. Resolve Riot Account -> PUUID
  const accountQuery = useAccount(safePlatform, name, tag, Boolean(validPlatform));
  const puuid = accountQuery.data?.puuid;
  const displayName = accountQuery.data?.gameName ?? name;
  const displayTag = accountQuery.data?.tagLine ?? tag;

  // Persist successful profile visits into recent searches
  React.useEffect(() => {
    if (!validPlatform || !accountQuery.data) {
      return;
    }
    recordSearch({
      platform: validPlatform,
      gameName: accountQuery.data.gameName ?? name,
      tagLine: accountQuery.data.tagLine ?? tag,
    });
  }, [validPlatform, accountQuery.data, name, tag, recordSearch]);

  // Respect Retry-After on 429 rate limits (matches landing behavior)
  React.useEffect(() => {
    const err = accountQuery.error;
    if (!(err instanceof ApiError) || err.status !== 429) {
      setRetryCountdown(0);
      return;
    }

    const waitSeconds = Math.max(1, Math.ceil(err.retryAfter ?? 5));
    setRetryCountdown(waitSeconds);

    const intervalId = window.setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const retryTimer = window.setTimeout(() => {
      void accountQuery.refetch();
    }, waitSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(retryTimer);
    };
  }, [accountQuery.error, accountQuery.refetch]);

  // 2. Parallel summoner telemetry once PUUID resolves
  const summonerQuery = useSummoner(safePlatform, puuid);
  const rankedQuery = useRanked(safePlatform, puuid);
  const masteryQuery = useMastery(safePlatform, puuid, 10);
  const liveGameQuery = useLiveGame(safePlatform, puuid);
  const matchIdsQuery = useMatchIds(safePlatform, puuid, { start: 0, count: PAGE_SIZE });

  const recentMatchIds = matchIdsQuery.data ?? [];
  const {
    byId: recentById,
    resolvedMatches: recentMatches,
    isAnyPending: recentMatchesPending,
  } = useMatches(recentMatchIds);

  // Read cached previous-20 matches if already fetched (e.g. from Matches tab Load More)
  // without triggering extra Riot API calls on initial dashboard mount.
  const priorMatches = React.useMemo<MatchDTO[]>(() => {
    if (!puuid) {
      return [];
    }
    const priorIds = queryClient.getQueryData<string[]>([
      "riot",
      "matchlist",
      safePlatform,
      puuid,
      { start: PAGE_SIZE, count: PAGE_SIZE },
    ]);
    if (!priorIds || priorIds.length === 0) {
      return [];
    }
    const found: MatchDTO[] = [];
    for (const id of priorIds) {
      const cached = queryClient.getQueryData<MatchDTO>(["riot", "match", id]);
      if (cached) {
        found.push(cached);
      }
    }
    return found;
  }, [puuid, safePlatform, queryClient, activeTab]);

  // Top-mastery champion splash (fallback to most-recent match champion)
  const splashChampionId = React.useMemo(() => {
    const topMastery = masteryQuery.data?.[0];
    if (topMastery) {
      return resolveChampionIdentity(topMastery.championId, undefined, lookups.champions).id;
    }
    if (puuid && recentMatches[0]) {
      const player = recentMatches[0].info.participants.find((p) => p.puuid === puuid);
      if (player) {
        return resolveChampionIdentity(player.championId, player.championName, lookups.champions)
          .id;
      }
    }
    return null;
  }, [masteryQuery.data, recentMatches, puuid, lookups.champions]);

  // Computed dashboard aggregates
  const seasonStripData = React.useMemo(() => {
    if (!puuid) {
      return null;
    }
    return computeSeasonStripData(
      recentMatches,
      priorMatches,
      puuid,
      rankedQuery.data,
      lookups.version,
    );
  }, [recentMatches, priorMatches, puuid, rankedQuery.data, lookups.version]);

  const lpProbe = React.useMemo(() => {
    if (!puuid) {
      return null;
    }
    return computePerformanceSeries(
      recentMatches,
      puuid,
      rankedQuery.data,
      "lp_estimated",
      lookups.champions,
    );
  }, [recentMatches, puuid, rankedQuery.data, lookups.champions]);

  const canShowLp = lpProbe?.mode === "lp_estimated";
  const effectiveChartMode: ChartDisplayMode = canShowLp ? chartMode : "kda";

  const performanceSeries = React.useMemo(() => {
    if (!puuid) {
      return null;
    }
    return computePerformanceSeries(
      recentMatches,
      puuid,
      rankedQuery.data,
      effectiveChartMode,
      lookups.champions,
    );
  }, [recentMatches, puuid, rankedQuery.data, effectiveChartMode, lookups.champions]);

  const mostPlayed = React.useMemo(() => {
    if (!puuid) {
      return [];
    }
    return computeMostPlayed(recentMatches, puuid, lookups.champions);
  }, [recentMatches, puuid, lookups.champions]);

  const recentFourIds = recentMatchIds.slice(0, 4);

  const matchNavSearch = React.useMemo(
    () =>
      puuid
        ? {
            from: encodeReferrerParam(safePlatform, displayName, displayTag),
            puuid,
          }
        : undefined,
    [safePlatform, displayName, displayTag, puuid],
  );

  const handleTabChange = React.useCallback(
    (next: SummonerTab | null) => {
      if (!next) {
        return;
      }
      void navigate({
        to: "/summoner/$platform/$name/$tag",
        params: { platform, name, tag },
        search: next === "matches" ? { tab: "matches" } : {},
        replace: true,
      });
    },
    [navigate, platform, name, tag],
  );

  // Invalid platform guard
  if (!validPlatform || !platformInfo) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start gap-4 rounded-[12px] bg-panel p-6 hairline-divider">
          <div className="flex items-center gap-2 text-loss">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <h1 className="text-[20px] font-semibold text-fg">Unknown region</h1>
          </div>
          <p className="text-[13px] text-meta-fg">
            &ldquo;{platform}&rdquo; is not a recognized Riot platform.
          </p>
          <Link to="/">
            <Button variant="secondary" size="sm">
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              Back to search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Account resolution error states (404, 429, 503/key_expired)
  if (accountQuery.isError && !accountQuery.isFetching) {
    const formatted = formatRiotError(accountQuery.error, retryCountdown);
    const isNotFound = formatted.kind === "not_found";
    const isWarning = formatted.kind === "rate_limited" || formatted.kind === "key_expired";

    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-meta-fg transition-colors hover:text-fg"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            <span>Back to search</span>
          </Link>
        </div>

        <section className="flex flex-col items-start gap-4 rounded-[12px] bg-panel p-6 hairline-divider sm:p-8">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className={isWarning ? "h-4 w-4 text-warning" : "h-4 w-4 text-loss"} />
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-fg">
              {isNotFound ? "Summoner not found" : formatted.message}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-meta-fg tabular">
            <span className="text-fg font-medium">
              {name}#{tag}
            </span>
            <span>·</span>
            <span>
              {platformInfo.short} ({platformInfo.label})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/">
              <Button variant="secondary" size="md">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Back to search
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => openCommandPalette(true)}
            >
              <SearchIcon className="h-3.5 w-3.5" />
              Search another Riot ID
            </Button>

            {!isNotFound ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={retryCountdown > 0}
                onClick={() => void accountQuery.refetch()}
              >
                {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : "Retry"}
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  const isAccountPending = accountQuery.isPending;

  return (
    <div className="flex flex-col pb-12">
      {/* Profile Hero */}
      {isAccountPending ? (
        <ProfileHeroSkeleton />
      ) : (
        <ProfileHero
          gameName={displayName}
          tagLine={displayTag}
          platformInfo={platformInfo}
          version={lookups.version}
          summoner={summonerQuery.data}
          rankedEntries={rankedQuery.data}
          rankedLoading={rankedQuery.isPending}
          liveGame={liveGameQuery.data}
          splashChampionId={splashChampionId}
          champions={lookups.champions}
          goldRankBars={activeTab === "overview"}
        />
      )}

      {/* Main container with Tabs (Overview / Matches) */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 sm:px-6">
        <Tabs<SummonerTab> value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-8">
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab
              value="matches"
              count={recentMatchIds.length > 0 ? recentMatchIds.length : undefined}
            >
              Matches
            </TabsTab>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsPanel value="overview" className="flex flex-col gap-8">
            {/* Season / Recent Stats Strip */}
            {isAccountPending ||
            matchIdsQuery.isPending ||
            (recentMatches.length === 0 && recentMatchesPending) ? (
              <SeasonStripSkeleton />
            ) : seasonStripData ? (
              <SeasonStrip {...seasonStripData} />
            ) : null}

            {/* 2-Column Dashboard Grid (816px left + 360px right, 32px gap) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,816fr)_minmax(0,360fr)] lg:items-start">
              {/* Left Column: LP/KDA Chart + 4 Compact Recent Matches */}
              <div className="flex min-w-0 flex-col gap-8">
                <LpChart
                  series={performanceSeries}
                  canShowLp={canShowLp}
                  mode={effectiveChartMode}
                  onModeChange={setChartMode}
                  isLoading={
                    isAccountPending ||
                    matchIdsQuery.isPending ||
                    (recentMatches.length === 0 && recentMatchesPending)
                  }
                />

                <section aria-label="Recent matches" className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">
                      Recent matches
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleTabChange("matches")}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-meta-fg transition-colors duration-150 hover:text-fg"
                    >
                      <span>All matches</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {isAccountPending || matchIdsQuery.isPending ? (
                    <div className="flex flex-col gap-2">
                      <MatchRowCompactSkeleton opacity={1} />
                      <MatchRowCompactSkeleton opacity={0.8} />
                      <MatchRowCompactSkeleton opacity={0.6} />
                      <MatchRowCompactSkeleton opacity={0.4} />
                    </div>
                  ) : recentFourIds.length === 0 ? (
                    <div className="rounded-[8px] bg-panel px-5 py-8 text-[13px] text-meta-fg hairline-divider">
                      No recent matches found
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {recentFourIds.map((matchId, index) => {
                        const state = recentById.get(matchId);
                        const vm =
                          state?.data && puuid
                            ? buildMatchRowViewModel(state.data, puuid, lookups)
                            : null;

                        if (!vm) {
                          return (
                            <MatchRowCompactSkeleton
                              key={matchId}
                              opacity={Math.max(0.4, 1 - index * 0.15)}
                            />
                          );
                        }

                        return (
                          <motion.div
                            key={matchId}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.04,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <MatchRowCompact
                              match={vm}
                              version={lookups.version}
                              matchNavSearch={matchNavSearch}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

              {/* Right Column: Mastery + Most Played (16px gap) */}
              <aside className="flex min-w-0 flex-col gap-4">
                <MasteryCard
                  masteries={masteryQuery.data}
                  champions={lookups.champions}
                  version={lookups.version}
                  isLoading={isAccountPending || masteryQuery.isPending}
                />

                <MostPlayedCard
                  entries={mostPlayed}
                  sampleSize={recentMatches.length}
                  version={lookups.version}
                  isLoading={
                    isAccountPending ||
                    matchIdsQuery.isPending ||
                    (recentMatches.length === 0 && recentMatchesPending)
                  }
                />
              </aside>
            </div>
          </TabsPanel>

          {/* MATCHES TAB */}
          <TabsPanel value="matches">
            {puuid ? (
              <MatchHistoryTab
                platform={safePlatform}
                puuid={puuid}
                matchNavSearch={matchNavSearch}
                lookups={lookups}
              />
            ) : (
              <div className="flex flex-col gap-4">
                <MatchRowCompactSkeleton opacity={1} />
                <MatchRowCompactSkeleton opacity={0.7} />
              </div>
            )}
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}
