import { cn } from "../ui/cn";

export type StatDeltaTone = "positive" | "negative" | "neutral";

export interface SeasonStatItem {
  id: string;
  label: string;
  value: string;
  /** Factual metadata only (e.g. "412W 331L", "Season 2026", "—") — never sentences. */
  context: string;
  delta: string;
  deltaTone?: StatDeltaTone;
}

export interface SeasonStripProps {
  hero: SeasonStatItem;
  stats: readonly SeasonStatItem[];
  className?: string;
}

export const MOCK_SEASON_STRIP_DATA: Omit<SeasonStripProps, "className"> = {
  hero: {
    id: "season-kda",
    label: "Season KDA",
    value: "4.38",
    context: "Season 2026",
    delta: "+0.42",
    deltaTone: "positive",
  },
  stats: [
    {
      id: "win-rate",
      label: "Win rate",
      value: "55.5%",
      context: "412W 331L",
      delta: "+2.1%",
      deltaTone: "positive",
    },
    {
      id: "cs-per-min",
      label: "CS / min",
      value: "8.4",
      context: "252 avg",
      delta: "+0.3",
      deltaTone: "positive",
    },
    {
      id: "kill-participation",
      label: "Kill participation",
      value: "61%",
      context: "743 games",
      delta: "±0%",
      deltaTone: "neutral",
    },
    {
      id: "gold-per-min",
      label: "Gold / min",
      value: "448",
      context: "Patch 16.23",
      delta: "+14",
      deltaTone: "positive",
    },
    {
      id: "vision-per-game",
      label: "Vision / game",
      value: "26.4",
      context: "—",
      delta: "-1.2",
      deltaTone: "negative",
    },
  ],
};

const DELTA_TONE_CLASSES: Record<StatDeltaTone, string> = {
  positive: "text-win",
  negative: "text-loss",
  neutral: "text-fg",
};

function splitDecimal(value: string): { whole: string; decimals: string | null } {
  const dotIndex = value.indexOf(".");
  if (dotIndex === -1) {
    return { whole: value, decimals: null };
  }
  return {
    whole: value.slice(0, dotIndex),
    decimals: value.slice(dotIndex + 1),
  };
}

/**
 * Dashboard season stats strip — single 1200px surface with a 240px hero cell
 * (72px/600 KDA with 60% / 43px decimals) and five equal secondary stat cells.
 * Zero gold accents.
 */
export function SeasonStrip({ hero, stats, className }: SeasonStripProps) {
  const { whole, decimals } = splitDecimal(hero.value);
  const heroDeltaTone = hero.deltaTone ?? "neutral";
  const secondaryCells = stats.slice(0, 5);

  return (
    <section
      aria-label="Season statistics"
      className={cn(
        "w-full max-w-[1200px] overflow-hidden rounded-[12px] bg-panel hairline-divider",
        className,
      )}
    >
      <div className="grid min-h-[168px] grid-cols-2 lg:grid-cols-[240px_repeat(5,minmax(0,1fr))]">
        {/* Hero cell: 240px track, padding 24/28, 72px/600 with 43px decimals */}
        <div className="col-span-2 flex flex-col justify-between gap-2 px-7 py-6 max-lg:hairline-divider-b lg:col-span-1 lg:hairline-divider-r">
          <span className="text-[13px] leading-[1.385] font-normal text-meta-fg">{hero.label}</span>

          <div className="inline-flex items-baseline leading-none font-semibold text-fg tabular">
            <span className="text-[56px] tracking-[-0.03em] lg:text-[72px]">{whole}</span>
            {decimals !== null ? (
              <>
                <span className="text-[34px] tracking-[-0.16em] lg:text-[43px]">.</span>
                <span className="text-[34px] tracking-[-0.03em] lg:text-[43px]">{decimals}</span>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] leading-[1.385] font-normal text-meta-fg tabular">
              {hero.context}
            </span>
            <span
              className={cn(
                "text-[13px] leading-[1.385] font-normal tabular",
                DELTA_TONE_CLASSES[heroDeltaTone],
              )}
            >
              {hero.delta}
            </span>
          </div>
        </div>

        {/* Five equal tracks, padding 20/24, values 28px/600 */}
        {secondaryCells.map((item, index) => {
          const tone = item.deltaTone ?? "neutral";
          const isLast = index === secondaryCells.length - 1;
          const isOddLastOnMobile = secondaryCells.length % 2 === 1 && isLast;
          const isBottomRowMobile = index >= secondaryCells.length - (isOddLastOnMobile ? 1 : 2);
          const isLeftColMobile = index % 2 === 0 && !isOddLastOnMobile;

          return (
            <div
              key={item.id}
              className={cn(
                "flex flex-col justify-between gap-2 px-6 py-5",
                isOddLastOnMobile && "max-lg:col-span-2",
                !isBottomRowMobile && "max-lg:hairline-divider-b",
                isLeftColMobile && "max-lg:hairline-divider-r",
                !isLast && "lg:hairline-divider-r",
              )}
            >
              <span className="text-[13px] leading-[1.385] font-normal text-meta-fg">
                {item.label}
              </span>

              <div className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-fg tabular">
                {item.value}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[13px] leading-[1.385] font-normal text-meta-fg tabular">
                  {item.context}
                </span>
                <span
                  className={cn(
                    "text-[13px] leading-[1.385] font-normal tabular",
                    DELTA_TONE_CLASSES[tone],
                  )}
                >
                  {item.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
