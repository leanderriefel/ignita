import type { LeagueEntryDTO } from "../../lib/riot/types";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";
import { formatTierName, normalizeTier, RANK_DOT_CLASSES, RankCrest } from "./rank-crest";

export interface RankCardProps {
  queueLabel: string;
  entry?: LeagueEntryDTO;
  /** Whether the LP progress bar uses gold (Dashboard's gold allowance). */
  goldBar?: boolean;
  className?: string;
}

function computeLpProgressPct(tier: string, lp: number): number {
  const safeLp = Math.max(0, lp);
  const normalized = normalizeTier(tier);
  if (normalized === "master" || normalized === "grandmaster" || normalized === "challenger") {
    // Apex tiers have no 100 LP ceiling; scale smoothly against 1000 LP reference.
    return Math.min(100, Math.max(10, Math.round((safeLp / 1000) * 100)));
  }
  return Math.min(100, Math.max(0, safeLp));
}

/**
 * Surface-over-art ranked card with real Community Dragon crest, tier + LP,
 * gold LP progress bar (the Dashboard's gold allowance), and tabular W/L.
 */
export function RankCard({ queueLabel, entry, goldBar = true, className }: RankCardProps) {
  const tier = normalizeTier(entry?.tier);
  const isRanked = Boolean(entry && tier !== "unranked");
  const totalGames = entry ? entry.wins + entry.losses : 0;
  const winRatePct = totalGames > 0 ? Math.round(((entry?.wins ?? 0) / totalGames) * 100) : 0;
  const lpProgress = isRanked && entry ? computeLpProgressPct(entry.tier, entry.leaguePoints) : 0;

  return (
    <div
      className={cn(
        "surface-over-art flex flex-col gap-3 rounded-[12px] px-5 py-4 hairline-divider",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="text-meta-fg">{queueLabel}</span>
        {isRanked && entry ? (
          <span className="font-medium text-fg tabular">{entry.leaguePoints} LP</span>
        ) : (
          <span className="text-meta-fg tabular">—</span>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        <RankCrest tier={entry?.tier} size={52} />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span
              className={cn("h-1.5 w-1.5 shrink-0 rounded-full", RANK_DOT_CLASSES[tier])}
              aria-hidden="true"
            />
            <span className="truncate text-[16px] leading-[1.25] font-semibold text-fg">
              {formatTierName(tier, entry?.rank)}
            </span>
          </div>

          {/* LP progress bar — the Dashboard's disciplined gold moment */}
          <div
            role="progressbar"
            aria-label={`${queueLabel} LP progress`}
            aria-valuenow={isRanked ? lpProgress : 0}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 w-full overflow-hidden rounded-full bg-control"
          >
            {isRanked ? (
              <div
                style={{ width: `${lpProgress}%` }}
                className={cn(
                  "h-full rounded-full transition-[width] duration-300 ease-out",
                  goldBar ? "bg-gold" : "bg-fg/80",
                )}
              />
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 text-[13px] tabular">
            {isRanked && entry ? (
              <>
                <span className="text-meta-fg">
                  {entry.wins}W {entry.losses}L
                </span>
                <span className="text-muted-fg">{winRatePct}%</span>
              </>
            ) : (
              <span className="text-meta-fg">No games played</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RankCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "surface-over-art flex flex-col gap-3 rounded-[12px] px-5 py-4 hairline-divider",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-12 opacity-70" />
      </div>
      <div className="flex items-center gap-3.5">
        <Skeleton rounded="md" className="h-[52px] w-[52px] shrink-0" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton rounded="full" className="h-1.5 w-full opacity-70" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20 opacity-60" />
            <Skeleton className="h-3 w-8 opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
