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
      {/* Desktop splash art backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
        {splashUrl ? (
          <img
            src={splashUrl}
            alt=""
            className="h-full w-full object-cover object-[70%_20%] opacity-45"
          />
        ) : (
          <div className="h-full w-full bg-panel/40" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #0A0A0B 0%, rgba(10,10,11,0.92) 32%, rgba(10,10,11,0.58) 68%, rgba(10,10,11,0.5) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,11,0.68) 0%, rgba(10,10,11,0.22) 34%, rgba(10,10,11,0.84) 84%, #0A0A0B 100%)",
          }}
        />
      </div>

      {/* Mobile 390px compact top splash band */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative h-[140px] w-full overflow-hidden sm:hidden"
      >
        {splashUrl ? (
          <img
            src={splashUrl}
            alt=""
            className="h-full w-full object-cover object-[65%_20%] opacity-55"
          />
        ) : (
          <div className="h-full w-full bg-panel/50" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,11,0.35) 0%, rgba(10,10,11,0.72) 68%, #0A0A0B 100%)",
          }}
        />
      </div>

      {/* Hero foreground container */}
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 pt-0 pb-6 sm:px-6 sm:pt-8 sm:pb-8">
        {liveGame && summoner ? (
          <LiveBanner
            liveGame={liveGame}
            puuid={summoner.puuid}
            champions={champions}
            className="-mt-12 sm:mt-0"
          />
        ) : null}

        <div
          className={cn(
            "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8",
            !liveGame && "-mt-14 sm:mt-0",
          )}
        >
          {/* Identity block: avatar + Riot ID + region/level */}
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-panel hairline-divider sm:h-[72px] sm:w-[72px]">
              <AssetImage
                src={iconSrc}
                alt={`${gameName} profile icon`}
                priority
                className="h-full w-full"
              />
              {summoner ? (
                <span className="absolute right-1 bottom-1 rounded-[6px] bg-canvas/90 px-1.5 py-0 text-[13px] leading-[18px] font-semibold text-fg tabular hairline">
                  {summoner.summonerLevel}
                </span>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-1.5">
              {/* Mobile Mandate #9: 32px max, truncate 14ch + ellipsis, tag at 70% on its own line */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-2.5">
                <h1 className="max-w-[14ch] truncate text-[32px] leading-[1.05] font-semibold tracking-[-0.03em] text-fg sm:max-w-none sm:text-[44px] lg:text-[52px]">
                  {gameName}
                </h1>
                <span className="text-[16px] leading-tight font-normal text-fg/70 sm:text-[20px] sm:text-meta-fg">
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
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="flex items-center gap-4 sm:gap-5">
            <Skeleton rounded="lg" className="h-14 w-14 shrink-0 sm:h-[72px] sm:w-[72px]" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-52 sm:h-12 sm:w-64" />
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
