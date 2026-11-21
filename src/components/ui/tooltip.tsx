import {
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipShortcut as UiTooltipShortcut,
  TooltipTrigger as UiTooltipTrigger,
} from "@ui-sdk/react/tooltip";
import type * as React from "react";

import { cn } from "./cn";

export function Tooltip({
  delay = 350,
  ...props
}: React.ComponentPropsWithoutRef<typeof UiTooltip>) {
  return <UiTooltip delay={delay} {...props} />;
}

export const TooltipTrigger = UiTooltipTrigger;

export function TooltipContent({
  sideOffset = 6,
  className,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof UiTooltipContent>, "className"> & {
  className?: string;
}) {
  return (
    <UiTooltipContent
      sideOffset={sideOffset}
      className={cn(
        "z-50 inline-flex items-center gap-2 rounded-[6px] bg-popover px-2.5 py-1.5 text-[13px] text-fg hairline-strong",
        "shadow-[0_8px_20px_rgba(0,0,0,0.45)]",
        className,
      )}
      {...props}
    >
      {children}
    </UiTooltipContent>
  );
}

export function TooltipShortcut({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof UiTooltipShortcut>, "className"> & {
  className?: string;
}) {
  return (
    <UiTooltipShortcut
      className={cn(
        "rounded-[4px] bg-control px-1.5 py-0 text-[13px] leading-[18px] text-meta-fg hairline",
        className,
      )}
      {...props}
    />
  );
}
