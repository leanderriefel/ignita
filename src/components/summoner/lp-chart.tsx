import { areaY, defineChart, dot, lineY, text } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import * as React from "react";

import type { PerformancePoint, PerformanceSeries } from "../../lib/match/transform";
import { cn } from "../ui/cn";
import { SegmentedControl } from "../ui/segmented-control";
import { Skeleton } from "../ui/skeleton";

export type ChartDisplayMode = "lp_estimated" | "kda";

export interface LpChartProps {
  series: PerformanceSeries | null;
  canShowLp: boolean;
  mode: ChartDisplayMode;
  onModeChange: (mode: ChartDisplayMode) => void;
  isLoading?: boolean;
  className?: string;
}

const DELTA_TONE_CLASS = {
  positive: "text-win",
  negative: "text-loss",
  neutral: "text-fg",
} as const;

function useIsCompactViewport(): boolean {
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return compact;
}

/**
 * Dashboard LP / KDA performance trajectory built strictly with @tanstack/charts/react.
 * Spec tokens:
 * - Line #D6D6D6 1.5px, white 10% -> 0 area wash
 * - Gridlines #2A2A30, baseline #2E2E31
 * - Win/loss dots with 2px panel-colored stroke (#131315)
 * - ONE gold terminal dot (#C8AA6E) + 20% halo + 13px value label
 * - Y-domain = data min/max + padding (never flat padded range)
 * - Mobile 390px y-axis reduces to 2 labels (peak, bottom)
 */
export function LpChart({
  series,
  canShowLp,
  mode,
  onModeChange,
  isLoading = false,
  className,
}: LpChartProps) {
  const isCompact = useIsCompactViewport();
  const [focusedPoint, setFocusedPoint] = React.useState<PerformancePoint | null>(null);

  const definition = React.useMemo(() => {
    if (!series || series.points.length === 0) {
      return null;
    }

    const points = series.points;
    const nonTerminal = points.slice(0, -1);
    const winPoints = nonTerminal.filter((p) => p.win);
    const lossPoints = nonTerminal.filter((p) => !p.win);
    const terminal = points[points.length - 1]!;

    const values = points.map((p) => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const rawSpan = maxVal - minVal;
    const pad =
      series.mode === "lp_estimated"
        ? Math.max(12, Math.round(rawSpan * 0.22))
        : Math.max(0.8, Number((rawSpan * 0.2).toFixed(1)));

    const domainMin =
      series.mode === "kda"
        ? Math.max(0, Number((minVal - pad).toFixed(1)))
        : Math.floor(minVal - pad);
    const domainMax =
      series.mode === "kda" ? Number((maxVal + pad).toFixed(1)) : Math.ceil(maxVal + pad);

    const xMax = Math.max(2, points.length);

    const formatY = (val: number) =>
      series.mode === "lp_estimated" ? `${Math.round(val)}` : val.toFixed(1);

    const yTickConfig = isCompact
      ? {
          values: [domainMin, domainMax] as const,
          size: 0,
          format: formatY,
        }
      : {
          count: 4,
          size: 0,
          format: formatY,
        };

    return defineChart({
      marks: [
        areaY(points, {
          id: "perf-area",
          x: "index",
          y1: domainMin,
          y2: "value",
          fill: "url(#ignita-lp-wash)",
          fillOpacity: 1,
        }),
        lineY(points, {
          id: "perf-line",
          x: "index",
          y: "value",
          stroke: "#D6D6D6",
          strokeWidth: 1.5,
        }),
        ...(winPoints.length > 0
          ? [
              dot(winPoints, {
                id: "perf-win-dots",
                x: "index",
                y: "value",
                r: 3.5,
                fill: "var(--color-win)",
                stroke: "#131315",
                strokeWidth: 2,
              }),
            ]
          : []),
        ...(lossPoints.length > 0
          ? [
              dot(lossPoints, {
                id: "perf-loss-dots",
                x: "index",
                y: "value",
                r: 3.5,
                fill: "var(--color-loss)",
                stroke: "#131315",
                strokeWidth: 2,
              }),
            ]
          : []),
        // Single gold terminal dot + halo
        dot([terminal], {
          id: "perf-terminal-halo",
          x: "index",
          y: "value",
          r: 8.5,
          fill: "#C8AA6E",
          fillOpacity: 0.2,
        }),
        dot([terminal], {
          id: "perf-terminal-dot",
          x: "index",
          y: "value",
          r: 4,
          fill: "#C8AA6E",
          stroke: "#131315",
          strokeWidth: 2,
        }),
        text([terminal], {
          id: "perf-terminal-label",
          x: "index",
          y: "value",
          text: () => series.terminalLabel,
          fill: "oklch(68% 0 0)",
          fontSize: 13,
          fontWeight: 500,
          anchor: "end",
          dy: -12,
        }),
      ],
      gradients: [
        {
          id: "ignita-lp-wash",
          y1: 0,
          y2: 1,
          stops: [
            { offset: 0, color: "#FFFFFF", opacity: 0.1 },
            { offset: 1, color: "#FFFFFF", opacity: 0 },
          ],
        },
      ],
      scales: {
        x: {
          scale: scaleLinear().domain([1, xMax]),
          axis: {
            line: { stroke: "#2E2E31", strokeWidth: 1, strokeOpacity: 1 },
            ticks: {
              values: isCompact ? [1, points.length] : undefined,
              count: isCompact ? undefined : Math.min(5, points.length),
              size: 0,
              format: (v: number) => `G${Math.round(v)}`,
            },
            tickLabels: {
              fontSize: 13,
            },
          },
        },
        y: {
          scale: scaleLinear().domain([domainMin, domainMax]),
          grid: { stroke: "#2A2A30", strokeWidth: 0.75, strokeOpacity: 1 },
          axis: {
            line: false,
            ticks: yTickConfig,
            tickLabels: {
              fontSize: 13,
            },
          },
        },
      },
      theme: {
        foreground: "oklch(94% 0 0)",
        muted: "oklch(68% 0 0)",
        grid: "#2A2A30",
        background: "#131315",
      },
      margin: { top: 22, right: 14, bottom: 26, left: 42 },
      tooltip,
    });
  }, [series, isCompact]);

  const title = series?.mode === "lp_estimated" ? "LP trajectory" : "KDA trend";

  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col gap-4 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6",
        className,
      )}
    >
      {/* Header row (chart legend + controls live here, never inside the plot) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">{title}</h2>
            {series ? (
              <span
                className={cn(
                  "text-[13px] font-medium tabular",
                  DELTA_TONE_CLASS[series.summaryDeltaTone],
                )}
              >
                {series.summaryDeltaLabel}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[13px] text-meta-fg tabular">
            {focusedPoint ? (
              <span className="text-fg">
                {focusedPoint.gameLabel} · {focusedPoint.championName} · {focusedPoint.kdaText} ·{" "}
                <span className={focusedPoint.win ? "text-win" : "text-loss"}>
                  {focusedPoint.deltaLabel}
                </span>
              </span>
            ) : series ? (
              <>
                <span>{series.sourceLabel}</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-win" aria-hidden="true" />
                  Win
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-loss" aria-hidden="true" />
                  Loss
                </span>
              </>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        {canShowLp ? (
          <SegmentedControl<ChartDisplayMode>
            aria-label="Chart metric"
            value={mode}
            onValueChange={onModeChange}
            options={[
              { value: "lp_estimated", label: "LP" },
              { value: "kda", label: "KDA" },
            ]}
          />
        ) : null}
      </div>

      {/* Chart body */}
      {isLoading ? (
        <Skeleton rounded="md" className="h-[210px] w-full opacity-75" />
      ) : definition ? (
        <div className="w-full tabular">
          <Chart
            definition={definition}
            height={210}
            initialWidth={760}
            ariaLabel={`${title} across recent matches`}
            onFocusChange={(point) => {
              const datum = point?.datum as PerformancePoint | undefined;
              setFocusedPoint(datum ?? null);
            }}
          />
        </div>
      ) : (
        <div className="flex h-[210px] items-center justify-center rounded-[8px] bg-section/40 text-[13px] text-meta-fg hairline-divider">
          Not enough recent matches to chart
        </div>
      )}
    </section>
  );
}
