import { championSplash, profileIcon, type ChampionIndex } from "../../lib/api/ddragon";
import type { PlatformInfo } from "../../lib/riot/regions";
import type { LeagueEntryDTO, LiveGameDTO, SummonerDTO } from "../../lib/riot/types";
import { AssetImage, safeProfileIconId } from "../match/asset-image";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";
import { LiveBanner } from "./live-banner";
import { RankCard, RankCardSkeleton } from "./rank-card";

export interface ProfileHeroProps {
  gameName: string;
  tagLine: string;
  platformInfo: PlatformInfo;
  version: string;
  summoner?: SummonerDTO;
  rankedEntries?: LeagueEntryDTO[];
  rankedLoading?: boolean;
  liveGame?: LiveGameDTO | null;
  splashChampionId?: string | null;
  champions?: ChampionIndex;
  /** Gold LP bars belong to the Overview tab; suppress on Matches tab to obey one-gold rule. */
  goldRankBars?: boolean;
  className?: string;
}

/**
 * Summoner profile hero with most-played champion splash under dark gradients,
 * optional LIVE banner, profile icon + Riot ID + region/level meta, and two
 * surface-over-art RankCards (Solo/Duo + Flex).
 */
export function ProfileHero({
  gameName,
  tagLine,
  platformInfo,
  version,
  summoner,
  rankedEntries,
  rankedLoading = false,
  liveGame,
  splashChampionId,
  champions,
  goldRankBars = true,
  className,
}: ProfileHeroProps) {
  const soloEntry = rankedEntries?.find((entry) => entry.queueType === "RANKED_SOLO_5x5");
  const flexEntry = rankedEntries?.find((entry) => entry.queueType === "RANKED_FLEX_SR");
  const splashUrl = splashChampionId ? championSplash(splashChampionId, 0) : null;
  const iconSrc = summoner ? profileIcon(version, safeProfileIconId(summoner.profileIconId)) : null;

  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* Quiet art: desaturated, low-opacity, masked into the canvas (no scrim washes) */}
      {splashUrl ? (
        <div
          aria-hidden="true"
          className="profile-art pointer-events-none absolute inset-x-0 top-0 h-[150px] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[70%]"
        >
          <img
            src={splashUrl}
            alt=""
            decoding="async"
            className="h-full w-full object-cover object-[70%_20%]"
          />
        </div>
      ) : null}

      {/* Mobile spacer keeps the identity block below the art band */}
      <div aria-hidden="true" className="h-[120px] sm:hidden" />

      {/* Hero foreground container */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pt-0 pb-6 sm:px-6 sm:pt-12 sm:pb-10">
        {liveGame && summoner ? (
          <LiveBanner
            liveGame={liveGame}
            puuid={summoner.puuid}
            champions={champions}
            className="-mt-8 sm:mt-0"
          />
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8",
            !liveGame && "-mt-8 sm:mt-0",
          )}
        >
          {/* Identity block: avatar + Riot ID + region/level */}
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-panel hairline-divider sm:h-16 sm:w-16">
              <AssetImage
                src={iconSrc}
                alt={`${gameName} profile icon`}
                priority
                className="h-full w-full"
              />
              {summoner ? <span className="sr-only">Level {summoner.summonerLevel}</span> : null}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              {/* Mobile Mandate #9: 32px max, truncate 14ch + ellipsis, tag at 70% on its own line */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2">
                <h1 className="max-w-[14ch] truncate text-[24px] leading-[1.15] font-semibold tracking-[-0.025em] text-fg sm:max-w-none sm:text-[32px]">
                  {gameName}
                </h1>
                <span className="text-[16px] leading-tight font-normal text-meta-fg sm:text-[20px]">
                  #{tagLine}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[13px] text-meta-fg tabular">
                <span className="text-muted-fg font-medium">{platformInfo.short}</span>
                <span>·</span>
                <span>{platformInfo.label}</span>
                {summoner ? (
                  <>
                    <span>·</span>
                    <span>Level {summoner.summonerLevel}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          {/* Two surface-over-art rank cards */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[540px] lg:shrink-0">
            {rankedLoading ? (
              <>
                <RankCardSkeleton />
                <RankCardSkeleton />
              </>
            ) : (
              <>
                <RankCard queueLabel="Ranked Solo/Duo" entry={soloEntry} goldBar={goldRankBars} />
                <RankCard queueLabel="Ranked Flex" entry={flexEntry} goldBar={goldRankBars} />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <section aria-hidden="true" className="relative overflow-hidden">
      <div aria-hidden="true" className="h-[120px] sm:hidden" />
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pt-0 pb-6 sm:px-6 sm:pt-12 sm:pb-10">
        <div className="-mt-8 flex flex-col gap-6 sm:mt-0 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <Skeleton rounded="lg" className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-7 w-48 sm:h-9 sm:w-60" />
              <Skeleton className="h-3.5 w-40 opacity-65" />
            </div>
          </div>
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:w-[540px] lg:shrink-0">
            <RankCardSkeleton />
            <RankCardSkeleton />
          </div>
        </div>
      </div>
    </section>
  );
}
