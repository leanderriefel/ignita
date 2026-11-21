import {
  Tabs as UiTabs,
  TabsIndicator as UiTabsIndicator,
  TabsList as UiTabsList,
  TabsPanel as UiTabsPanel,
  TabsTab as UiTabsTab,
} from "@ui-sdk/react/tabs";
import type * as React from "react";

import { cn } from "./cn";

export function Tabs<T extends string = string>({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof UiTabs<T>>, "className"> & {
  className?: string;
}) {
  return <UiTabs<T> className={cn("w-full", className)} {...props} />;
}

export function TabsList({
  className,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof UiTabsList>, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <UiTabsList
      className={cn(
        "flex items-center gap-5 overflow-x-auto hairline-b",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    >
      {children}
      <UiTabsIndicator />
    </UiTabsList>
  );
}

export function TabsTab({
  className,
  children,
  count,
  dot,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof UiTabsTab>, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
  count?: number;
  dot?: "win" | "loss";
}) {
  return (
    <UiTabsTab
      className={cn(
        "inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 text-[13px] font-medium whitespace-nowrap select-none",
        "text-meta-fg transition-colors duration-150 ease-out hover:text-muted-fg",
        "data-selected:text-fg data-disabled:cursor-not-allowed data-disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {children}
      {typeof count === "number" ? (
        <span className="rounded-[6px] bg-control px-1.5 py-0 text-[13px] leading-[18px] font-medium text-meta-fg tabular hairline">
          {count}
        </span>
      ) : null}
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot === "win" ? "bg-win" : "bg-loss")}
          aria-hidden="true"
        />
      ) : null}
    </UiTabsTab>
  );
}

export function TabsPanel({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<typeof UiTabsPanel>, "className"> & {
  className?: string;
}) {
  return <UiTabsPanel className={cn("outline-none", className)} {...props} />;
}
