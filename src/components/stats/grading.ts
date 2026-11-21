/**
 * Semantic stat grading — colour encodes what a value MEANS, never decoration.
 *
 * Spec rule (design-spec "Semantic grading"): only the graded VALUE takes the colour; labels,
 * rows and cards stay neutral. Gold never grades. Values between the bands stay neutral fg.
 *
 *   KDA ratio   good >= 3.0   ok 1.5-3.0   poor < 1.0
 *   CS / min    good >= 8.0   ok 6.0-8.0   poor < 5.0
 *   KP %        good >= 65    ok 45-65     poor < 30
 *   Vision      good = top-decile (>= 1.8 / min, >= 45 / game, or best in lobby); never poor
 */

export type StatGrade = "good" | "ok" | "poor" | "neutral";

export const GRADE_CLASS: Record<StatGrade, string> = {
  good: "text-win",
  ok: "text-grade-ok",
  poor: "text-loss",
  neutral: "",
};

function band(
  value: number | null | undefined,
  good: number,
  ok: number,
  poorBelow: number,
): StatGrade {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "neutral";
  }
  if (value >= good) {
    return "good";
  }
  if (value >= ok) {
    return "ok";
  }
  if (value < poorBelow) {
    return "poor";
  }
  return "neutral";
}

export function gradeKda(ratio: number | null | undefined): StatGrade {
  return band(ratio, 3, 1.5, 1);
}

export function gradeCsPerMin(csPerMin: number | null | undefined): StatGrade {
  return band(csPerMin, 8, 6, 5);
}

export function gradeKp(kpPct: number | null | undefined): StatGrade {
  return band(kpPct, 65, 45, 30);
}

export function gradeVisionPerMin(perMin: number | null | undefined): StatGrade {
  return perMin !== null && perMin !== undefined && perMin >= 1.8 ? "good" : "neutral";
}

export function gradeVisionPerGame(perGame: number | null | undefined): StatGrade {
  return perGame !== null && perGame !== undefined && perGame >= 45 ? "good" : "neutral";
}

/** First number in a display string ("4.38", "61%", "7.2/m"), or null. */
export function leadingNumber(text: string | null | undefined): number | null {
  if (!text) {
    return null;
  }
  const match = /-?\d+(?:\.\d+)?/.exec(text.replace(/,/g, ""));
  return match ? Number(match[0]) : null;
}

/** Grade a stat-strip / summary-band cell by its metric id. Unknown ids stay neutral. */
export function gradeByMetricId(id: string, value: string): StatGrade {
  const n = leadingNumber(value);
  switch (id) {
    case "season-kda":
    case "kda":
      return gradeKda(n);
    case "cs-per-min":
    case "cs-min":
      return gradeCsPerMin(n);
    case "kill-participation":
    case "kp":
      return gradeKp(n);
    case "vision-per-game":
      return gradeVisionPerGame(n);
    default:
      return "neutral";
  }
}

export function gradeClass(grade: StatGrade, fallback = "text-fg"): string {
  return grade === "neutral" ? fallback : GRADE_CLASS[grade];
}
