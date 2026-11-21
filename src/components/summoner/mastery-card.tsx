import { championSquare, type ChampionIndex } from "../../lib/api/ddragon";
import { resolveChampionIdentity } from "../../lib/match/transform";
import type { ChampionMasteryDTO } from "../../lib/riot/types";
import { AssetImage } from "../match/asset-image";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";

export interface MasteryCardProps {
  masteries?: ChampionMasteryDTO[];
  champions?: ChampionIndex;
  version: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Right-column Mastery card showing Top 3 champion masteries with real squares,
 * neutral M-level chips, and tabular mastery points. Zero gold accents.
 */
export function MasteryCard({
  masteries,
  champions,
  version,
  isLoading = false,
  className,
}: MasteryCardProps) {
  const topThree = (masteries ?? []).slice(0, 3);

  return (
    <section
      aria-label="Champion mastery"
      className={cn("overflow-hidden rounded-[12px] bg-panel hairline-divider", className)}
    >
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">Mastery</h2>
        <span className="text-[13px] text-meta-fg">Top 3</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-5 py-3.5 hairline-divider-t"
            >
              <div className="flex items-center gap-3">
                <Skeleton rounded="md" className="h-10 w-10 shrink-0" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-16 opacity-60" />
                </div>
              </div>
              <Skeleton rounded="full" className="h-5 w-12" />
            </div>
          ))}
        </div>
      ) : topThree.length === 0 ? (
        <div className="px-5 py-6 text-[13px] text-meta-fg hairline-divider-t">No mastery data</div>
      ) : (
        <ul className="m-0 list-none p-0">
          {topThree.map((entry) => {
            const champ = resolveChampionIdentity(entry.championId, undefined, champions);
            return (
              <li
                key={entry.championId}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hairline-divider-t"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <AssetImage
                    src={championSquare(version, champ.id)}
                    alt={champ.name}
                    className="h-10 w-10 shrink-0 rounded-[8px] hairline-divider"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[13px] font-semibold text-fg">{champ.name}</span>
                    <span className="text-[13px] text-meta-fg tabular">
                      {entry.championPoints.toLocaleString("en-US")} pts
                    </span>
                  </div>
                </div>

                <Chip variant="neutral" className="tabular">
                  M{entry.championLevel}
                </Chip>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
