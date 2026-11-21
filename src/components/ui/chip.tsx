import type * as React from "react";

import { cn } from "./cn";

export type ChipVariant = "neutral" | "live" | "mvp" | "tag" | "victory" | "defeat" | "count";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  interactive?: boolean;
}

const VARIANT_CLASSES: Record<ChipVariant, string> = {
  neutral: "bg-panel text-muted-fg hairline rounded-full px-2.5 py-0.5 text-[13px] font-medium",
  tag: "bg-section text-fg hairline rounded-full px-2.5 py-0.5 text-[13px] font-normal",
  live: "bg-panel text-fg hairline rounded-full px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.04em]",
  mvp: "bg-gold/10 text-gold border-[0.5px] border-gold/35 rounded-full px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.04em]",
  victory:
    "bg-panel text-fg hairline rounded-full px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.04em]",
  defeat:
    "bg-panel text-fg hairline rounded-full px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-[0.04em]",
  count:
    "bg-control text-meta-fg hairline rounded-[6px] px-1.5 py-0 text-[13px] font-medium tabular leading-[18px]",
};

export function Chip({
  variant = "neutral",
  interactive = false,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap select-none",
        VARIANT_CLASSES[variant],
        interactive &&
          "cursor-pointer transition-[background-color,border-color,color] duration-150 ease-out hover:bg-control hover:text-fg hover:hairline-strong active:bg-control-active",
        className,
      )}
      {...props}
    >
      {variant === "live" ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-win" aria-hidden="true" />
      ) : null}
      {variant === "victory" ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-win" aria-hidden="true" />
      ) : null}
      {variant === "defeat" ? (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-loss" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}
