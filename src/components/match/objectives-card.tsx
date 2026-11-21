import type { FirstEventSummary, MatchObjectivePair } from "../../lib/match/detail";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/skeleton";

export interface ObjectivesCardProps {
  objectives: readonly MatchObjectivePair[];
  firstEvents: readonly FirstEventSummary[];
  timelineLoading?: boolean;
  className?: string;
}

/**
 * Five match objective pairs (Baron, Dragons, Towers, Voidgrubs, Inhibitors)
 * rendered as blue/red split bars with tabular counts in a 3+2 grid, plus
 * first-event timestamps when available. Zero gold accents.
 */
export function ObjectivesCard({
  objectives,
  firstEvents,
  timelineLoading = false,
  className,
}: ObjectivesCardProps) {
  return (
    <section
      aria-label="Objectives"
      className={cn(
        "flex flex-col justify-between gap-5 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] leading-[1.3] font-semibold text-fg">Objectives</h2>
        <div className="flex items-center gap-3 text-[13px] text-meta-fg">
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

      {/* 3+2 grid: Baron / Dragons / Towers on row 1, Voidgrubs / Inhibitors on row 2 */}
      <div className="grid grid-cols-6 gap-x-4 gap-y-5">
        {objectives.map((item, index) => {
          const total = item.blue + item.red;
          const bluePct = total > 0 ? (item.blue / total) * 100 : 0;
          const redPct = total > 0 ? (item.red / total) * 100 : 0;
          const spanClass = index < 3 ? "col-span-2" : "col-span-3";

          return (
            <div key={item.id} className={cn("flex flex-col gap-2 tabular", spanClass)}>
              <span className="text-[13px] text-meta-fg">{item.label}</span>

              <div className="flex items-baseline justify-between gap-2 text-[20px] leading-none font-semibold tracking-[-0.02em]">
                <span className={item.blue > 0 ? "text-fg" : "text-muted-fg"}>{item.blue}</span>
                <span className={item.red > 0 ? "text-fg" : "text-muted-fg"}>{item.red}</span>
              </div>

              <div
                aria-label={`${item.label}: Blue ${item.blue}, Red ${item.red}`}
                className="flex h-1.5 w-full gap-[2px] overflow-hidden rounded-[2px] bg-control"
              >
                {item.blue > 0 ? (
                  <div style={{ width: `${bluePct}%` }} className="h-full bg-team-blue" />
                ) : null}
                {item.red > 0 ? (
                  <div style={{ width: `${redPct}%` }} className="h-full bg-team-red" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* First-event timestamps meta row */}
      {timelineLoading ? (
        <div className="flex items-center gap-4 pt-4 hairline-divider-t">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-24 opacity-70" />
          <Skeleton className="h-3.5 w-24 opacity-50" />
        </div>
      ) : firstEvents.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-4 text-[13px] text-meta-fg tabular hairline-divider-t">
          {firstEvents.map((event) => (
            <div key={event.id} className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  event.team === "blue" ? "bg-team-blue" : "bg-team-red",
                )}
                aria-hidden="true"
              />
              <span>{event.label}</span>
              <span className="font-medium text-fg">
                {event.timeLabel ?? (event.team === "blue" ? "Blue" : "Red")}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function ObjectivesCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between gap-5 rounded-[12px] bg-panel p-5 hairline-divider sm:p-6"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3.5 w-20 opacity-60" />
      </div>
      <div className="grid grid-cols-6 gap-x-4 gap-y-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className={cn("flex flex-col gap-2", idx < 3 ? "col-span-2" : "col-span-3")}
          >
            <Skeleton className="h-3.5 w-16 opacity-70" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-5" />
            </div>
            <Skeleton className="h-1.5 w-full opacity-75" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 pt-4 hairline-divider-t">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-24 opacity-70" />
        <Skeleton className="h-3.5 w-24 opacity-50" />
      </div>
    </div>
  );
}
