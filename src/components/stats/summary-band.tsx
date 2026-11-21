import { cn } from "../ui/cn";
import { useAnimatedNumericText } from "../ui/motion";
import { gradeByMetricId, gradeClass } from "./grading";
import { ROLE_LABELS, RoleIcon, type RoleId } from "../ui/role-icons";
import type { StatDeltaTone } from "./season-strip";

export interface SummaryMetricItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaTone?: StatDeltaTone;
}

export interface RoleSplitEntry {
  role: RoleId;
  games: number;
}

export interface SummaryBandProps {
  winRate: string;
  wins: number;
  losses: number;
  winRateDelta?: string;
  winRateDeltaTone?: StatDeltaTone;
  /** Up to 20 most recent games (true = win, false = loss). */
  recentForm: readonly boolean[];
  formLabel?: string;
  formContext?: string;
  /** Exactly 3 metrics: e.g. KDA, KP, CS / min. */
  metrics: readonly [SummaryMetricItem, SummaryMetricItem, SummaryMetricItem];
  roles: readonly RoleSplitEntry[];
  className?: string;
}

export const MOCK_SUMMARY_BAND_DATA: Omit<SummaryBandProps, "className"> = {
  winRate: "65%",
  wins: 13,
  losses: 7,
  winRateDelta: "+5%",
  winRateDeltaTone: "positive",
  recentForm: [
    true,
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    true,
    true,
    false,
    false,
    true,
    true,
    false,
    true,
    true,
    false,
    true,
  ],
  formLabel: "Last 20",
  formContext: "13W 7L",
  metrics: [
    {
      id: "kda",
      label: "KDA",
      value: "4.12",
      delta: "+0.38",
      deltaTone: "positive",
    },
    {
      id: "kp",
      label: "KP",
      value: "62%",
      delta: "+3%",
      deltaTone: "positive",
    },
    {
      id: "cs-min",
      label: "CS / min",
      value: "8.2",
      delta: "-0.2",
      deltaTone: "negative",
    },
  ],
  roles: [
    { role: "mid", games: 14 },
    { role: "top", games: 4 },
    { role: "support", games: 2 },
  ],
};

const DELTA_TONE_CLASSES: Record<StatDeltaTone, string> = {
  positive: "text-win",
  negative: "text-loss",
  neutral: "text-fg",
};

/**
 * Match-history summary band — 1200x132 minimum on a single panel surface with
 * hairline-divider seams. Columns follow 200/280/160/150/150/160 proportions.
 * Zero gold accents.
 */
function AnimatedValue({ value, className }: { value: string; className?: string }) {
  const text = useAnimatedNumericText(value);
  return <div className={className}>{text}</div>;
}

export function SummaryBand({
  winRate,
  wins,
  losses,
  winRateDelta,
  winRateDeltaTone = "neutral",
  recentForm,
  formLabel = "Form",
  formContext,
  metrics,
  roles,
  className,
}: SummaryBandProps) {
  const formBars = recentForm.slice(0, 20);
  const formWins = formBars.filter(Boolean).length;
  const formLosses = formBars.length - formWins;

  return (
    <section
      aria-label="Recent match summary"
      className={cn(
        "w-full max-w-[1200px] overflow-hidden rounded-[12px] bg-panel hairline-divider",
        className,
      )}
    >
      <div className="grid min-h-[132px] grid-cols-2 lg:grid-cols-[minmax(200px,200fr)_minmax(280px,280fr)_minmax(160px,160fr)_minmax(150px,150fr)_minmax(150px,150fr)_minmax(160px,160fr)]">
        {/* Column 1 (200): Winrate hero 40px/600 */}
        <div className="col-span-2 flex flex-col justify-between px-5 py-4 max-lg:hairline-divider-b lg:col-span-1 lg:hairline-divider-r">
          <span className="text-[13px] leading-[1.385] font-normal text-meta-fg">Win rate</span>

          <div className="flex flex-col gap-2">
            <AnimatedValue
              value={winRate}
              className="text-[32px] leading-none font-semibold tracking-[-0.03em] text-fg tabular"
            />
            <div className="flex items-center gap-2 text-[13px] leading-[1.385] font-normal tabular">
              <span className="text-meta-fg">
                {wins}W {losses}L
              </span>
              {winRateDelta ? (
                <span className={DELTA_TONE_CLASSES[winRateDeltaTone]}>{winRateDelta}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Column 2 (280): 20-bar form strip, 8x20px, 2px gaps, radius 2px, 80% win/loss, vertically centered */}
        <div className="col-span-2 flex flex-col justify-between px-5 py-4 max-lg:hairline-divider-b lg:col-span-1 lg:hairline-divider-r">
          <div className="flex items-center justify-between gap-2 text-[13px] leading-[1.385] font-normal text-meta-fg">
            <span>{formLabel}</span>
            {formContext ? <span className="tabular">{formContext}</span> : null}
          </div>

          <div
            role="img"
            aria-label={`Recent ${formBars.length} games: ${formWins} wins, ${formLosses} losses`}
            className="flex flex-1 items-center py-2"
          >
            <div className="flex items-center gap-[2px]">
              {formBars.map((isWin, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  style={{ animationDelay: `${index * 18}ms` }}
                  className={cn(
                    "form-bar h-[20px] w-[8px] shrink-0 rounded-[2px]",
                    isWin ? "bg-win/80" : "bg-loss/80",
                  )}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px] leading-[1.385] font-normal text-meta-fg tabular">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>

        {/* Columns 3, 4, 5 (160 / 150 / 150): Secondary metrics 20px/600 */}
        {metrics.map((metric, index) => {
          const tone = metric.deltaTone ?? "neutral";
          const isLeftOnMobile = index % 2 === 0;
          const isTopRowMobile = index < 2;

          return (
            <div
              key={metric.id}
              className={cn(
                "flex flex-col justify-between px-5 py-4 lg:hairline-divider-r",
                isLeftOnMobile && "max-lg:hairline-divider-r",
                isTopRowMobile && "max-lg:hairline-divider-b",
              )}
            >
              <span className="text-[13px] leading-[1.385] font-normal text-meta-fg">
                {metric.label}
              </span>

              <div className="flex flex-col gap-2">
                <AnimatedValue
                  value={metric.value}
                  className={cn(
                    "text-[20px] leading-none font-semibold tracking-[-0.02em] tabular transition-colors duration-300",
                    gradeClass(gradeByMetricId(metric.id, metric.value)),
                  )}
                />
                {metric.delta.trim() && metric.delta.trim() !== "—" ? (
                  <span
                    className={cn(
                      "text-[13px] leading-[1.385] font-normal tabular",
                      DELTA_TONE_CLASSES[tone],
                    )}
                  >
                    {metric.delta}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}

        {/* Column 6 (160): Role counts 13px tabular with 14px inline position SVGs (never gold) */}
        <div className="flex flex-col justify-between px-5 py-4">
          <span className="text-[13px] leading-[1.385] font-normal text-meta-fg">Roles</span>

          <div className="mt-2 flex flex-col gap-1.5 text-[13px] leading-[1.385] tabular">
            {roles.slice(0, 3).map((entry) => (
              <div key={entry.role} className="flex items-center justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-2 text-muted-fg">
                  <RoleIcon
                    role={entry.role}
                    className="h-[14px] w-[14px] shrink-0 text-muted-fg"
                  />
                  <span className="truncate">{ROLE_LABELS[entry.role]}</span>
                </span>
                <span className="shrink-0 font-medium text-fg">{entry.games}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
