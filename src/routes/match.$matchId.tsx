import { Link, createFileRoute, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import * as React from "react";

import { useCommandPalette } from "../components/command";
import {
  GoldAdvantageChart,
  GoldAdvantageChartSkeleton,
  LoadoutCard,
  LoadoutCardSkeleton,
  MatchScoreboard,
  MatchScoreboardSkeleton,
  ObjectivesCard,
  ObjectivesCardSkeleton,
  ScoreChip,
} from "../components/match";
import { AlertCircleIcon, ArrowLeftIcon, Button, SearchIcon, Skeleton } from "../components/ui";
import { ApiError } from "../lib/api/client";
import { championSplash } from "../lib/api/ddragon";
import { useItems, useMatch, useTimeline } from "../lib/api/queries";
import {
  buildMatchDetailViewModel,
  parseReferrerParam,
  type MatchReferrer,
} from "../lib/match/detail";
import { isRemakeDuration, normalizeDurationSeconds } from "../lib/match/transform";
import { useMatchAssetLookups } from "../lib/match/use-matches";
import { formatRiotError } from "../lib/riot-id";
import { getPlatformInfo, platformFromMatchId } from "../lib/riot/regions";

export interface MatchRouteSearch {
  from?: string;
  puuid?: string;
}

export const Route = createFileRoute("/match/$matchId")({
  validateSearch: (search: Record<string, unknown>): MatchRouteSearch => ({
    from: typeof search.from === "string" && search.from.trim() ? search.from : undefined,
    puuid: typeof search.puuid === "string" && search.puuid.trim() ? search.puuid : undefined,
  }),
  component: MatchDetailPage,
});

function BackLink({ referrer }: { referrer: MatchReferrer | null }) {
  if (referrer) {
    return (
      <Link
        to="/summoner/$platform/$name/$tag"
        params={{
          platform: referrer.platform,
          name: referrer.name,
          tag: referrer.tag,
        }}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-meta-fg transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        <span>Back to {referrer.label}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-meta-fg transition-colors duration-150 hover:text-fg"
    >
      <ArrowLeftIcon className="h-3.5 w-3.5" />
      <span>Back to search</span>
    </Link>
  );
}

function MatchDetailSkeleton({ referrer }: { referrer: MatchReferrer | null }) {
  return (
    <div className="flex flex-col pb-12">
      {/* Hero + ScoreChip skeleton */}
      <section aria-hidden="true" className="relative overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pt-6 pb-8 sm:px-6 sm:pt-8">
          <BackLink referrer={referrer} />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-14 w-56 sm:h-16 sm:w-64" />
              <Skeleton className="h-3.5 w-72 opacity-65 sm:w-96" />
              <Skeleton className="h-3.5 w-44 opacity-50" />
            </div>

            <div className="inline-flex min-w-[min(420px,100%)] flex-col gap-3 rounded-[12px] bg-panel px-5 py-4 hairline-divider">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3.5 w-12 opacity-65" />
                <Skeleton className="h-3.5 w-12 opacity-65" />
              </div>
              <div className="flex items-baseline gap-6">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-5 w-28 opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content lane skeletons */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ObjectivesCardSkeleton />
          <LoadoutCardSkeleton />
        </div>
        <GoldAdvantageChartSkeleton />
        <MatchScoreboardSkeleton />
      </div>
    </div>
  );
}

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const search = Route.useSearch();
  const { setOpen: openCommandPalette } = useCommandPalette();
  const locationState = useRouterState({
    select: (state) => state.location.state as { puuid?: string; from?: string } | undefined,
  });

  const preferredPuuid = locationState?.puuid ?? search.puuid ?? null;
  const referrer = React.useMemo(
    () => parseReferrerParam(locationState?.from ?? search.from),
    [locationState?.from, search.from],
  );

  const detectedPlatform = platformFromMatchId(matchId);
  const platformInfo = detectedPlatform ? getPlatformInfo(detectedPlatform) : null;
  const isValidMatchId = Boolean(matchId && matchId.includes("_") && detectedPlatform);

  const [retryCountdown, setRetryCountdown] = React.useState(0);

  const lookups = useMatchAssetLookups();
  const itemsQuery = useItems(lookups.version);

  const matchQuery = useMatch(matchId, isValidMatchId);

  const isRemake = matchQuery.data
    ? isRemakeDuration(normalizeDurationSeconds(matchQuery.data.info.gameDuration))
    : false;

  const timelineQuery = useTimeline(matchId, Boolean(matchQuery.data) && !isRemake);

  // Respect Retry-After on 429 rate limits
  React.useEffect(() => {
    const err = matchQuery.error;
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
      void matchQuery.refetch();
    }, waitSeconds * 1000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(retryTimer);
    };
  }, [matchQuery.error, matchQuery.refetch]);

  const detail = React.useMemo(() => {
    if (!matchQuery.data) {
      return null;
    }
    return buildMatchDetailViewModel(
      matchQuery.data,
      timelineQuery.data,
      lookups,
      itemsQuery.data,
      preferredPuuid,
      referrer,
    );
  }, [matchQuery.data, timelineQuery.data, lookups, itemsQuery.data, preferredPuuid, referrer]);

  // Invalid matchId guard
  if (!isValidMatchId) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6">
        <BackLink referrer={referrer} />
        <section className="flex flex-col items-start gap-4 rounded-[12px] bg-panel p-6 hairline-divider sm:p-8">
          <div className="flex items-center gap-2 text-loss">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-fg">
              Invalid match ID
            </h1>
          </div>
          <p className="text-[13px] text-meta-fg tabular">
            {matchId} is not a recognized Riot match identifier.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link to="/">
              <Button variant="secondary" size="md">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Back to search
              </Button>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Error / 404 states
  if (matchQuery.isError && !matchQuery.isFetching) {
    const formatted = formatRiotError(matchQuery.error, retryCountdown);
    const isNotFound = formatted.kind === "not_found";
    const isWarning = formatted.kind === "rate_limited" || formatted.kind === "key_expired";

    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-12 sm:px-6">
        <BackLink referrer={referrer} />

        <section className="flex flex-col items-start gap-4 rounded-[12px] bg-panel p-6 hairline-divider sm:p-8">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className={isWarning ? "h-4 w-4 text-warning" : "h-4 w-4 text-loss"} />
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-fg">
              {isNotFound ? "Match not found" : formatted.message}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-meta-fg tabular">
            <span className="font-medium text-fg">{matchId}</span>
            {platformInfo ? (
              <>
                <span>·</span>
                <span>
                  {platformInfo.short} ({platformInfo.label})
                </span>
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {referrer ? (
              <Link
                to="/summoner/$platform/$name/$tag"
                params={{
                  platform: referrer.platform,
                  name: referrer.name,
                  tag: referrer.tag,
                }}
              >
                <Button variant="secondary" size="md">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  Back to {referrer.label}
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button variant="secondary" size="md">
                  <ArrowLeftIcon className="h-3.5 w-3.5" />
                  Back to search
                </Button>
              </Link>
            )}

            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => openCommandPalette(true)}
            >
              <SearchIcon className="h-3.5 w-3.5" />
              Search Riot ID
            </Button>

            {!isNotFound ? (
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={retryCountdown > 0}
                onClick={() => void matchQuery.refetch()}
              >
                {retryCountdown > 0 ? `Retry in ${retryCountdown}s` : "Retry"}
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  // Full-page lane skeleton while match body resolves
  if (matchQuery.isPending || !detail) {
    return <MatchDetailSkeleton referrer={referrer} />;
  }

  const splashUrl = championSplash(detail.viewedChampionId, 0);
  const outcomeWord = detail.isRemake ? "Remake" : detail.viewedWin ? "Victory" : "Defeat";
  const outcomeColor = detail.isRemake
    ? "text-muted-fg"
    : detail.viewedWin
      ? "text-win"
      : "text-loss";

  const metaItems = [
    detail.queueName,
    detail.mapName,
    detail.durationLabel,
    detail.dateLabel,
    `Patch ${detail.patchLabel}`,
  ];

  const viewedIdentityText = detail.viewedPlayerTag
    ? `${detail.viewedPlayerName}#${detail.viewedPlayerTag}`
    : detail.viewedPlayerName;

  const isTimelineLoading = !detail.isRemake && timelineQuery.isPending;

  return (
    <div className="flex flex-col pb-12">
      {/* MATCH HERO — viewed player's champion splash under dark gradients */}
      <section className="relative overflow-hidden">
        {/* Desktop splash backdrop */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
          <img
            src={splashUrl}
            alt=""
            className="h-full w-full object-cover object-[70%_20%] opacity-45"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, #0A0A0B 0%, rgba(10,10,11,0.92) 34%, rgba(10,10,11,0.56) 68%, rgba(10,10,11,0.48) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,11,0.72) 0%, rgba(10,10,11,0.24) 36%, rgba(10,10,11,0.86) 85%, #0A0A0B 100%)",
            }}
          />
        </div>

        {/* Mobile 390px compact top splash band */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative h-[136px] w-full overflow-hidden sm:hidden"
        >
          <img
            src={splashUrl}
            alt=""
            className="h-full w-full object-cover object-[66%_20%] opacity-55"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,11,0.4) 0%, rgba(10,10,11,0.74) 68%, #0A0A0B 100%)",
            }}
          />
        </div>

        {/* Hero foreground */}
        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 pt-0 pb-7 sm:px-6 sm:pt-7 sm:pb-9">
          <div className="-mt-24 sm:mt-0">
            <BackLink referrer={referrer} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6 pt-3 sm:pt-2 lg:flex-row lg:items-end lg:justify-between lg:gap-8"
          >
            {/* Outcome word + facts meta line */}
            <div className="flex min-w-0 flex-col gap-2.5">
              <h1
                className={`text-[48px] leading-[0.98] font-semibold tracking-[-0.035em] sm:text-[72px] lg:text-[88px] ${outcomeColor}`}
              >
                {outcomeWord}
              </h1>

              {/* Single 13px facts meta line */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-meta-fg tabular">
                {metaItems.map((item, idx) => (
                  <React.Fragment key={item}>
                    {idx > 0 ? (
                      <span aria-hidden="true" className="text-border-strong">
                        ·
                      </span>
                    ) : null}
                    <span className={idx === 0 ? "font-medium text-fg" : undefined}>{item}</span>
                  </React.Fragment>
                ))}
              </div>

              {/* Viewed player perspective label */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-meta-fg">
                <span
                  className={
                    detail.viewedSide === "blue"
                      ? "h-1.5 w-1.5 rounded-full bg-team-blue"
                      : "h-1.5 w-1.5 rounded-full bg-team-red"
                  }
                  aria-hidden="true"
                />
                <span className="font-medium text-fg">{detail.viewedChampionName}</span>
                <span aria-hidden="true" className="text-border-strong">
                  ·
                </span>
                <span>{viewedIdentityText}</span>
                {detail.isDefaultParticipant ? (
                  <>
                    <span aria-hidden="true" className="text-border-strong">
                      ·
                    </span>
                    <span>First participant</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* ScoreChip baseline-aligned with outcome word */}
            <ScoreChip
              blueKills={detail.blueTeam.totalKills}
              redKills={detail.redTeam.totalKills}
              goldTotal={detail.blueTeam.totalGoldLabel}
              opponentGoldTotal={detail.redTeam.totalGoldLabel}
              className="shrink-0"
            />
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT (1200px container, 24px vertical rhythm) */}
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 sm:px-6">
        {/* Objectives + Loadout 2-column row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ObjectivesCard
            objectives={detail.objectives}
            firstEvents={detail.firstEvents}
            timelineLoading={isTimelineLoading}
          />
          <LoadoutCard
            loadout={detail.loadout}
            version={lookups.version}
            timelineLoading={isTimelineLoading}
          />
        </div>

        {/* Full-width Gold-advantage chart (timeline frames or honest end-state bar pair) */}
        <GoldAdvantageChart
          timeline={detail.goldTimeline}
          blueTotalGold={detail.blueTeam.totalGold}
          redTotalGold={detail.redTeam.totalGold}
          durationLabel={detail.durationLabel}
          isLoading={isTimelineLoading}
        />

        {/* Blue & Red Scoreboards */}
        <MatchScoreboard
          blueTeam={detail.blueTeam}
          redTeam={detail.redTeam}
          platform={detail.platform}
          version={lookups.version}
        />
      </div>
    </div>
  );
}
