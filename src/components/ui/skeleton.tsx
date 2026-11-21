import type * as React from "react";

import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: "slot" | "sm" | "md" | "lg" | "full";
}

const ROUNDED_CLASSES = {
  slot: "rounded-[4px]",
  sm: "rounded-[6px]",
  md: "rounded-[8px]",
  lg: "rounded-[12px]",
  full: "rounded-full",
} as const;

export function Skeleton({ rounded = "sm", className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton-shimmer", ROUNDED_CLASSES[rounded], className)}
      {...props}
    />
  );
}

/**
 * Exact lane clone of the 1200px 8-lane match row on desktop and the 2-line
 * mobile card on 390px viewports.
 */
export function MatchRowSkeleton({
  opacity = 1,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{ opacity }}
      className={cn("relative overflow-hidden rounded-[8px] bg-panel hairline", className)}
    >
      {/* Desktop 8-lane layout */}
      <div className="hidden h-[92px] items-center gap-6 lg:flex">
        {/* Meta lane (144px incl. 20px left pad) */}
        <div className="flex w-[144px] shrink-0 flex-col gap-2 pl-5">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3 w-24 opacity-70" />
          <Skeleton className="h-3 w-20 opacity-50" />
        </div>

        {/* Champion lane (116px: 56px portrait + 2 stacked spell/rune columns) */}
        <div className="flex w-[116px] shrink-0 items-center gap-1.5">
          <Skeleton rounded="md" className="h-14 w-14 shrink-0" />
          <div className="flex flex-col gap-1">
            <Skeleton rounded="slot" className="h-[22px] w-[22px]" />
            <Skeleton rounded="slot" className="h-[22px] w-[22px]" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton rounded="full" className="h-[22px] w-[22px]" />
            <Skeleton rounded="full" className="h-[22px] w-[22px] opacity-60" />
          </div>
        </div>

        {/* KDA lane (136px) */}
        <div className="flex w-[136px] shrink-0 flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16 opacity-60" />
        </div>

        {/* Stats lane (flex-1) */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20 opacity-70" />
          <Skeleton className="h-3 w-24 opacity-50" />
        </div>

        {/* Items lane (222px: 6x28 + 12px gutter + 28px trinket) */}
        <div className="flex w-[222px] shrink-0 items-center">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} rounded="slot" className="h-7 w-7" />
            ))}
          </div>
          <div className="w-3 shrink-0" />
          <Skeleton rounded="full" className="h-7 w-7" />
        </div>

        {/* Teams lane (132px) */}
        <div className="flex w-[132px] shrink-0 items-center gap-2.5">
          <Skeleton rounded="sm" className="h-8 w-8 shrink-0" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12 opacity-60" />
          </div>
        </div>

        {/* LP lane (64px) */}
        <div className="flex w-[64px] shrink-0 flex-col items-end gap-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-3 w-6 opacity-50" />
        </div>

        {/* Expand lane (44px) */}
        <div className="flex h-full w-[44px] shrink-0 items-center justify-center hairline-l">
          <Skeleton rounded="full" className="h-3.5 w-3.5 opacity-50" />
        </div>
      </div>

      {/* Mobile 390px 2-line layout */}
      <div className="flex flex-col gap-3 p-3.5 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton rounded="md" className="h-10 w-10 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-28 opacity-60" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-4 w-12" />
            <Skeleton rounded="full" className="h-4 w-4 opacity-50" />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} rounded="slot" className="h-6 w-6" />
          ))}
          <div className="w-1.5 shrink-0" />
          <Skeleton rounded="full" className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
