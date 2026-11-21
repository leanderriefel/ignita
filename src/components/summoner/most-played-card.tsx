import { championSquare } from "../../lib/api/ddragon";
import type { MostPlayedEntry } from "../../lib/match/transform";
import { AssetImage } from "../match/asset-image";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";

export interface MostPlayedCardProps {
  entries: readonly MostPlayedEntry[];
  sampleSize: number;
  version: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Right-column Most Played card computed from recent matches.
 * Win-rate bars are always neutral white (never red threshold per design-spec).
 */
export function MostPlayedCard({
  entries,
  sampleSize,
  version,
  isLoading = false,
  className,
}: MostPlayedCardProps) {
  return (
    <section
      aria-label="Most played champions"
      className={cn("overflow-hidden rounded-[12px] bg-panel hairline-divider", className)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">Most played</h2>
        <span className="text-[13px] text-meta-fg tabular">
          {sampleSize > 0 ? `Last ${sampleSize}` : "—"}
        </span>
      </div>

      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-5 py-3 hairline-divider-t"
            >
              <div className="flex items-center gap-3">
                <Skeleton rounded="sm" className="h-8 w-8 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-1.5 w-24 opacity-60" />
                </div>
              </div>
              <Skeleton className="h-3.5 w-14" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="px-5 py-6 text-[13px] text-meta-fg hairline-divider-t">
          No recent matches
        </div>
      ) : (
        <ul className="m-0 list-none p-0">
          {entries.map((entry) => (
            <li
              key={entry.championId}
              className="flex items-center justify-between gap-3 px-5 py-3 hairline-divider-t"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <AssetImage
                  src={championSquare(version, entry.championId)}
                  alt={entry.championName}
                  className="h-8 w-8 shrink-0 rounded-[6px] hairline-divider"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="truncate font-medium text-fg">{entry.championName}</span>
                    <span className="shrink-0 text-meta-fg tabular">
                      {entry.games} {entry.games === 1 ? "game" : "games"}
                    </span>
                  </div>

                  {/* Win-rate bar: always white per design-spec review consensus */}
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-control">
                      <div
                        style={{ width: `${entry.winRatePct}%` }}
                        className="h-full rounded-full bg-fg/85"
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-[13px] text-fg tabular">
                      {entry.winRatePct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-[64px] shrink-0 flex-col items-end text-[13px] tabular">
                <span className="font-medium text-fg">{entry.kdaRatio}</span>
                <span className="text-meta-fg">KDA</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
