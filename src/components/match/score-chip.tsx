import { cn } from "../ui/cn";

export interface ScoreChipProps {
  blueKills: number;
  redKills: number;
  goldTotal: string;
  opponentGoldTotal: string;
  blueLabel?: string;
  redLabel?: string;
  className?: string;
}

export const MOCK_SCORE_CHIP_DATA: Omit<ScoreChipProps, "className"> = {
  blueKills: 38,
  redKills: 21,
  goldTotal: "63.2k",
  opponentGoldTotal: "54.8k",
  blueLabel: "Blue",
  redLabel: "Red",
};

/**
 * Match-detail score block sitting over hero splash art.
 * Min-width 420px, radius 12px, padding 16/20, surface-over-art + hairline-divider.
 * Zero gold accents.
 */
export function ScoreChip({
  blueKills,
  redKills,
  goldTotal,
  opponentGoldTotal,
  blueLabel = "Blue",
  redLabel = "Red",
  className,
}: ScoreChipProps) {
  return (
    <div
      role="group"
      aria-label={`${blueLabel} ${blueKills} to ${redLabel} ${redKills}, team gold ${goldTotal} versus ${opponentGoldTotal}`}
      className={cn(
        "surface-over-art inline-flex min-w-[min(420px,100%)] flex-col gap-2 rounded-[12px] px-5 py-4 hairline-divider",
        className,
      )}
    >
      {/* Team row: 6px radius-full pips + 13px sentence-case labels, 8px above score */}
      <div className="flex items-center gap-4 text-[13px] leading-[1.385] font-normal text-meta-fg">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-team-blue" aria-hidden="true" />
          <span>{blueLabel}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-team-red" aria-hidden="true" />
          <span>{redLabel}</span>
        </span>
      </div>

      {/* Baseline-aligned score + team gold totals */}
      <div className="flex flex-wrap items-baseline tabular">
        <div className="inline-flex items-baseline text-[36px] leading-none font-semibold tracking-[-0.03em] sm:text-[40px]">
          <span className="text-fg">{blueKills}</span>
          <span aria-hidden="true" className="mx-[10px] font-normal text-border-strong">
            :
          </span>
          <span className="text-fg">{redKills}</span>
        </div>

        <span className="ml-6 text-[20px] leading-none font-semibold tracking-[-0.02em] text-fg">
          {goldTotal}
        </span>

        <span className="ml-2 text-[13px] leading-none font-normal text-meta-fg">
          vs {opponentGoldTotal}
        </span>
      </div>
    </div>
  );
}
