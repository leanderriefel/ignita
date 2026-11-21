import { areaY, defineChart, dot, lineY, ruleY } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import * as React from "react";

export interface MiniGoldPoint {
  minute: number;
  diffK: number;
}

interface InternalPoint extends MiniGoldPoint {
  pos: number;
  neg: number;
}

export interface MiniGoldChartProps {
  curve: readonly MiniGoldPoint[];
  /** Show gold terminal dot (history view) or neutral white (when gold budget is spent elsewhere). */
  goldTerminal?: boolean;
  height?: number;
}

/**
 * Mini team gold-advantage chart built with @tanstack/charts/react.
 * Uses the exact gold-advantage tokens from design-spec.md:
 * blue #5B8DEF @ 28%, red #E4545E @ 40%, dashed #56565E zero line,
 * #D6D6D6 1.5px line, gold terminal dot + subtle halo.
 */
export function MiniGoldChart({ curve, goldTerminal = true, height = 74 }: MiniGoldChartProps) {
  const definition = React.useMemo(() => {
    const rows: InternalPoint[] = curve.map((point) => ({
      minute: point.minute,
      diffK: point.diffK,
      pos: Math.max(0, point.diffK),
      neg: Math.min(0, point.diffK),
    }));

    const last = rows[rows.length - 1];
    const maxAbs = Math.max(1.5, ...rows.map((r) => Math.abs(r.diffK)));
    const yMin = Math.min(-0.6, -maxAbs * 1.12);
    const yMax = Math.max(0.6, maxAbs * 1.12);
    const xMax = Math.max(1, rows[rows.length - 1]?.minute ?? 1);

    const terminalFill = goldTerminal ? "#C8AA6E" : "#EDEDED";

    return defineChart({
      marks: [
        areaY(rows, {
          id: "gold-positive-area",
          x: "minute",
          y1: 0,
          y2: "pos",
          fill: "#5B8DEF",
          fillOpacity: 0.28,
        }),
        areaY(rows, {
          id: "gold-negative-area",
          x: "minute",
          y1: "neg",
          y2: 0,
          fill: "#E4545E",
          fillOpacity: 0.4,
        }),
        ruleY([0], {
          id: "gold-zero-rule",
          stroke: "#56565E",
          strokeWidth: 1,
          strokeDasharray: "4 4",
          strokeOpacity: 1,
        }),
        lineY(rows, {
          id: "gold-line",
          x: "minute",
          y: "diffK",
          stroke: "#D6D6D6",
          strokeWidth: 1.5,
        }),
        ...(last
          ? [
              dot([last], {
                id: "gold-terminal-halo",
                x: "minute",
                y: "diffK",
                r: 7,
                fill: terminalFill,
                fillOpacity: 0.2,
              }),
              dot([last], {
                id: "gold-terminal-dot",
                x: "minute",
                y: "diffK",
                r: 3.25,
                fill: terminalFill,
                stroke: "#1B1B1E",
                strokeWidth: 1.5,
              }),
            ]
          : []),
      ],
      scales: {
        x: {
          scale: scaleLinear().domain([0, xMax]),
          axis: false,
        },
        y: {
          scale: scaleLinear().domain([yMin, yMax]),
          axis: false,
        },
      },
      guides: false,
      margin: { top: 8, right: 8, bottom: 6, left: 6 },
      focus: false,
    });
  }, [curve, goldTerminal]);

  return (
    <Chart
      definition={definition}
      height={height}
      initialWidth={320}
      ariaLabel="Team gold advantage timeline"
      className="w-full"
    />
  );
}
