import { areaY, barX, defineChart, dot, lineY, ruleX, ruleY, text } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { tooltip } from "@tanstack/charts/tooltip";
import { motion } from "motion/react";
import * as React from "react";

import type { GoldCurvePoint, GoldTimelineModel } from "../../lib/match/detail";
import { formatCompactNumber } from "../../lib/match/transform";
import { Chip } from "../ui/chip";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";

export interface GoldAdvantageChartProps {
  timeline: GoldTimelineModel | null;
  blueTotalGold: number;
  redTotalGold: number;
  durationLabel: string;
  isLoading?: boolean;
  className?: string;
}

interface EndStateBarRow {
  team: string;
  teamId: 100 | 200;
  goldK: number;
  label: string;
}

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

function formatMinuteTick(minute: number): string {
  const whole = Math.max(0, Math.round(minute));
  return `${whole}:00`;
}

function formatGoldTick(val: number): string {
  if (Math.abs(val) < 0.05) {
    return "0";
  }
  const rounded = Math.abs(val) >= 10 ? Math.round(val) : Number(val.toFixed(1));
  return `${val > 0 ? "+" : ""}${rounded}k`;
}

/**
 * Full-width team gold-advantage chart built with @tanstack/charts/react.
 * - Prefers live Riot Timeline-v5 frames (team 100 minus team 200 per minute).
 * - Spec tokens: #D6D6D6 1.5px line, #E4545E 1.5px negative stroke, #2A2A30 gridlines,
 *   #2E2E31 baseline, dashed #56565E zero line, blue #5B8DEF @ 28% / red #E4545E @ 40%,
 *   ONE gold terminal dot (#C8AA6E) + halo + 13px terminal label, Baron markers.
 * - Mobile 390px: y-axis reduces to 2 labels (peak, 0) and Baron pills move to caption row.
 * - When timeline is null: falls back to an honest TanStack Charts end-state bar pair.
 */
export function GoldAdvantageChart({
  timeline,
  blueTotalGold,
  redTotalGold,
  durationLabel,
  isLoading = false,
  className,
}: GoldAdvantageChartProps) {
  const isCompact = useIsCompactViewport();
  const [focusedPoint, setFocusedPoint] = React.useState<GoldCurvePoint | null>(null);

  const timelineDefinition = React.useMemo(() => {
    if (!timeline || timeline.frames.length < 2) {
      return null;
    }

    const areaRows = timeline.areaPoints;
    const frameRows = timeline.frames;
    const terminal = frameRows[frameRows.length - 1]!;

    const maxAbsRaw = Math.max(2, ...frameRows.map((p) => Math.abs(p.diffK)));
    const niceCeiling = Math.ceil(maxAbsRaw * 1.18);
    const yMin = -niceCeiling;
    const yMax = niceCeiling;
    const xMax = Math.max(1, timeline.durationMinutes);

    // Compact mobile y-axis: peak + zero only (Mobile Mandate #8)
    const peakSign = timeline.peakLeadDiffK < 0 ? -1 : 1;
    const mobilePeak = peakSign * niceCeiling;

    const yTickConfig = isCompact
      ? {
          values: [0, mobilePeak] as const,
          size: 0,
          format: formatGoldTick,
        }
      : {
          values: [yMin, Math.round(yMin / 2), 0, Math.round(yMax / 2), yMax] as const,
          size: 0,
          format: formatGoldTick,
        };

    // Minute ticks at clean 5m or 10m intervals
    const stepMin = xMax > 32 ? 10 : 5;
    const xTickValues: number[] = [];
    for (let m = 0; m < xMax - 2; m += stepMin) {
      xTickValues.push(m);
    }

    // Baron markers on desktop (vertical ruleX + on-curve dot; pill anchored in top rail)
    const barons = timeline.baronMarkers;
    const blueBarons = barons.filter((b) => b.team === "blue");
    const redBarons = barons.filter((b) => b.team === "red");
    const desktopBaronMarks = !isCompact
      ? [
          ruleX(barons, {
            id: "baron-rules",
            x: "minute",
            stroke: "#56565E",
            strokeWidth: 1,
            strokeDasharray: "2 3",
            strokeOpacity: 0.85,
          }),
          ...(blueBarons.length > 0
            ? [
                dot(blueBarons, {
                  id: "baron-dots-blue",
                  x: "minute",
                  y: "diffK",
                  r: 3.5,
                  fill: "#5B8DEF",
                  stroke: "#131315",
                  strokeWidth: 1.5,
                }),
              ]
            : []),
          ...(redBarons.length > 0
            ? [
                dot(redBarons, {
                  id: "baron-dots-red",
                  x: "minute",
                  y: "diffK",
                  r: 3.5,
                  fill: "#E4545E",
                  stroke: "#131315",
                  strokeWidth: 1.5,
                }),
              ]
            : []),
        ]
      : [];

    // Mobile still plots the subtle Baron dots on the line; pills move to caption row
    const mobileBaronDots = isCompact
      ? [
          ...(blueBarons.length > 0
            ? [
                dot(blueBarons, {
                  id: "baron-dots-blue-mobile",
                  x: "minute",
                  y: "diffK",
                  r: 3,
                  fill: "#5B8DEF",
                  stroke: "#131315",
                  strokeWidth: 1.5,
                }),
              ]
            : []),
          ...(redBarons.length > 0
            ? [
                dot(redBarons, {
                  id: "baron-dots-red-mobile",
                  x: "minute",
                  y: "diffK",
                  r: 3,
                  fill: "#E4545E",
                  stroke: "#131315",
                  strokeWidth: 1.5,
                }),
              ]
            : []),
        ]
      : [];

    return defineChart({
      marks: [
        areaY(areaRows, {
          id: "gold-blue-area",
          x: "minute",
          y1: 0,
          y2: "pos",
          fill: "#5B8DEF",
          fillOpacity: 0.28,
        }),
        areaY(areaRows, {
          id: "gold-red-area",
          x: "minute",
          y1: "neg",
          y2: 0,
          fill: "#E4545E",
          fillOpacity: 0.4,
        }),
        ruleY([0], {
          id: "gold-zero-line",
          stroke: "#56565E",
          strokeWidth: 1,
          strokeDasharray: "4 4",
          strokeOpacity: 1,
        }),
        ...desktopBaronMarks,
        // Overall #D6D6D6 1.5px curve (used for hover focus via real frames)
        lineY(frameRows, {
          id: "gold-line-main",
          x: "minute",
          y: "diffK",
          stroke: "#D6D6D6",
          strokeWidth: 1.5,
        }),
        // 1.5px red stroke overlay on negative segments so red leads read clearly
        lineY(areaRows, {
          id: "gold-line-negative",
          x: "minute",
          y: (d) => (d.diffK <= 0 ? d.diffK : null),
          stroke: "#E4545E",
          strokeWidth: 1.5,
        }),
        ...mobileBaronDots,
        // ONE gold terminal dot + halo + 13px terminal value label
        dot([terminal], {
          id: "gold-terminal-halo",
          x: "minute",
          y: "diffK",
          r: 8.5,
          fill: "#C8AA6E",
          fillOpacity: 0.2,
        }),
        dot([terminal], {
          id: "gold-terminal-dot",
          x: "minute",
          y: "diffK",
          r: 4,
          fill: "#C8AA6E",
          stroke: "#131315",
          strokeWidth: 2,
        }),
        text([terminal], {
          id: "gold-terminal-label",
          x: "minute",
          y: "diffK",
          text: () => timeline.finalLabel,
          fill: "oklch(68% 0 0)",
          fontSize: 13,
          fontWeight: 500,
          anchor: "end",
          dy: terminal.diffK >= 0 ? -12 : 18,
        }),
      ],
      scales: {
        x: {
          scale: scaleLinear().domain([0, xMax]),
          axis: {
            line: { stroke: "#2E2E31", strokeWidth: 1, strokeOpacity: 1 },
            ticks: {
              values: isCompact ? [0, Math.round(xMax / 2), Math.round(xMax)] : xTickValues,
              size: 0,
              format: formatMinuteTick,
            },
            tickLabels: {
              fontSize: 13,
            },
          },
        },
        y: {
          scale: scaleLinear().domain([yMin, yMax]),
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
      margin: { top: 18, right: 16, bottom: 26, left: 48 },
      tooltip,
    });
  }, [timeline, isCompact]);

  // Honest end-state fallback bar pair when timeline is null
  const endStateDefinition = React.useMemo(() => {
    if (timeline) {
      return null;
    }

    const blueK = Number((blueTotalGold / 1000).toFixed(1));
    const redK = Number((redTotalGold / 1000).toFixed(1));
    const rows: EndStateBarRow[] = [
      { team: "Blue", teamId: 100, goldK: blueK, label: formatCompactNumber(blueTotalGold) },
      { team: "Red", teamId: 200, goldK: redK, label: formatCompactNumber(redTotalGold) },
    ];
    const maxGoldK = Math.max(10, blueK, redK);
    const leaderRow = blueK >= redK ? rows[0]! : rows[1]!;

    return defineChart({
      marks: [
        barX(rows, {
          id: "end-state-gold-bars",
          x1: 0,
          x2: "goldK",
          y: "team",
          fill: (d) => (d.teamId === 100 ? "#5B8DEF" : "#E4545E"),
          fillOpacity: 0.72,
          maxThickness: 26,
          radius: 4,
        }),
        // Single gold terminal dot marking the leading team's end-state total
        dot([leaderRow], {
          id: "end-state-terminal-halo",
          x: "goldK",
          y: "team",
          r: 8,
          fill: "#C8AA6E",
          fillOpacity: 0.2,
        }),
        dot([leaderRow], {
          id: "end-state-terminal-dot",
          x: "goldK",
          y: "team",
          r: 3.75,
          fill: "#C8AA6E",
          stroke: "#131315",
          strokeWidth: 2,
        }),
        text(rows, {
          id: "end-state-values",
          x: "goldK",
          y: "team",
          text: (d) => `${d.label} gold`,
          fill: "oklch(68% 0 0)",
          fontSize: 13,
          fontWeight: 500,
          anchor: "start",
          dx: 12,
        }),
      ],
      scales: {
        x: {
          scale: scaleLinear().domain([0, maxGoldK * 1.28]),
          grid: { stroke: "#2A2A30", strokeWidth: 0.75, strokeOpacity: 1 },
          axis: {
            line: { stroke: "#2E2E31", strokeWidth: 1, strokeOpacity: 1 },
            ticks: {
              count: isCompact ? 3 : 5,
              size: 0,
              format: (v: number) => `${Math.round(v)}k`,
            },
            tickLabels: { fontSize: 13 },
          },
        },
        y: {
          scale: scaleBand().domain(["Blue", "Red"]).padding(0.38),
          axis: {
            line: false,
            ticks: { size: 0 },
            tickLabels: { fontSize: 13 },
          },
        },
      },
      theme: {
        foreground: "oklch(94% 0 0)",
        muted: "oklch(68% 0 0)",
        grid: "#2A2A30",
        background: "#131315",
      },
      margin: { top: 12, right: 20, bottom: 26, left: 48 },
      focus: false,
    });
  }, [timeline, blueTotalGold, redTotalGold, isCompact]);

  const endDiffGold = blueTotalGold - redTotalGold;
  const endDiffK = Number((endDiffGold / 1000).toFixed(1));
  const endDiffLabel =
    Math.abs(endDiffK) < 0.05
      ? "±0.0k"
      : `${endDiffK > 0 ? "+" : "-"}${Math.abs(endDiffK).toFixed(1)}k`;
  const endDiffTeam = Math.abs(endDiffK) < 0.05 ? "even" : endDiffK > 0 ? "blue" : "red";

  const activeLeadLabel = timeline ? timeline.finalLabel : endDiffLabel;
  const activeLeadTeam = timeline ? timeline.finalTeam : endDiffTeam;

  return (
    <section
      aria-label="Gold advantage"
      className={cn(
        "flex flex-col gap-4 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6",
        className,
      )}
    >
      {/* Header row (chart legend lives here, never inside the plot) */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-baseline gap-3 tabular">
            <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">Gold advantage</h2>
            <span className="text-[20px] leading-none font-semibold tracking-[-0.02em] text-fg">
              {activeLeadLabel}
            </span>
            <span className="text-[13px] text-meta-fg">
              {activeLeadTeam === "blue" ? "Blue" : activeLeadTeam === "red" ? "Red" : "Even"} at{" "}
              {durationLabel}
            </span>
          </div>

          {/* Focused readout or summary meta */}
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-meta-fg tabular">
            {focusedPoint ? (
              <span className="text-fg">
                {focusedPoint.timeLabel} · {focusedPoint.diffK >= 0 ? "Blue" : "Red"}{" "}
                {focusedPoint.diffK > 0 ? "+" : ""}
                {focusedPoint.diffK.toFixed(1)}k · Blue {formatCompactNumber(focusedPoint.blueGold)}{" "}
                vs Red {formatCompactNumber(focusedPoint.redGold)}
              </span>
            ) : timeline ? (
              <span>
                Peak {timeline.peakLeadLabel}{" "}
                {timeline.peakLeadTeam === "blue"
                  ? "Blue"
                  : timeline.peakLeadTeam === "red"
                    ? "Red"
                    : ""}{" "}
                at {timeline.peakLeadTimeLabel}
              </span>
            ) : (
              <span>End-state team gold · Timeline unavailable</span>
            )}
          </div>
        </div>

        {/* Header legend */}
        <div className="flex items-center gap-4 text-[13px] text-meta-fg">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-team-blue" aria-hidden="true" />
            Blue
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-team-red" aria-hidden="true" />
            Red
          </span>
        </div>
      </div>

      {/* Mobile Baron markers caption row (Mobile Mandate #8) */}
      {isCompact && timeline && timeline.baronMarkers.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-[13px] tabular">
          {timeline.baronMarkers.map((baron) => (
            <Chip key={baron.id} variant="neutral">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  baron.team === "blue" ? "bg-team-blue" : "bg-team-red",
                )}
                aria-hidden="true"
              />
              <span>Baron {baron.timeLabel}</span>
            </Chip>
          ))}
        </div>
      ) : null}

      {/* Chart body with a 700ms left-to-right draw-in */}
      {isLoading ? (
        <Skeleton rounded="md" className="h-[240px] w-full opacity-75" />
      ) : timelineDefinition ? (
        <motion.div
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.6 }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-full flex-col tabular"
        >
          {/* Desktop Baron pills anchored directly above their vertical marker lines */}
          {!isCompact && timeline && timeline.baronMarkers.length > 0 ? (
            <div className="relative mb-0.5 hidden h-8 w-full sm:block" aria-label="Baron kills">
              {timeline.baronMarkers.map((baron) => {
                const rawRatio = Math.max(0, Math.min(1, baron.minute / timeline.durationMinutes));
                const pillRatio = Math.max(0.06, Math.min(0.94, rawRatio));
                return (
                  <div
                    key={baron.id}
                    style={{
                      left: `calc(48px + (100% - 64px) * ${pillRatio})`,
                    }}
                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                  >
                    <Chip
                      variant="neutral"
                      className="bg-section px-2 py-0 text-[13px] leading-[22px] text-fg hairline-divider"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          baron.team === "blue" ? "bg-team-blue" : "bg-team-red",
                        )}
                        aria-hidden="true"
                      />
                      <span>Baron {baron.timeLabel}</span>
                    </Chip>
                    <span aria-hidden="true" className="h-3 w-px bg-[#56565E]/80" />
                  </div>
                );
              })}
            </div>
          ) : null}

          <Chart
            definition={timelineDefinition}
            height={240}
            initialWidth={1120}
            ariaLabel="Team gold advantage per minute"
            onFocusChange={(point) => {
              const datum = point?.datum as GoldCurvePoint | undefined;
              setFocusedPoint(datum && !datum.isZeroCrossing ? datum : null);
            }}
          />
        </motion.div>
      ) : endStateDefinition ? (
        <motion.div
          initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.6 }}
          animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full tabular"
        >
          <Chart
            definition={endStateDefinition}
            height={148}
            initialWidth={1120}
            ariaLabel="End-state team gold comparison"
          />
        </motion.div>
      ) : null}
    </section>
  );
}

export function GoldAdvantageChartSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-36 opacity-65" />
        </div>
        <Skeleton className="h-3.5 w-24 opacity-60" />
      </div>
      <Skeleton rounded="md" className="h-[240px] w-full opacity-75" />
    </div>
  );
}
