import {
  SegmentedControl as UiSegmentedControl,
  SegmentedControlIndicator as UiSegmentedControlIndicator,
  SegmentedControlItem as UiSegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import type * as React from "react";

import { cn } from "./cn";

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  options: SegmentedOption<T>[];
  "aria-label": string;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string = string>({
  value,
  defaultValue,
  onValueChange,
  options,
  "aria-label": ariaLabel,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <UiSegmentedControl<T>
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => {
        if (next !== null) {
          onValueChange?.(next);
        }
      }}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[8px] bg-panel p-0.5 hairline",
        "data-disabled:opacity-45",
        className,
      )}
    >
      <UiSegmentedControlIndicator className="rounded-[6px] bg-control hairline" />
      {options.map((option) => (
        <UiSegmentedControlItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            "relative inline-flex h-7 cursor-pointer items-center justify-center gap-1.5 rounded-[6px] px-2.5 text-[13px] font-medium whitespace-nowrap select-none",
            "text-meta-fg transition-colors duration-150 ease-out hover:text-muted-fg",
            "data-checked:text-fg data-disabled:cursor-not-allowed data-disabled:opacity-45",
          )}
        >
          {option.label}
        </UiSegmentedControlItem>
      ))}
    </UiSegmentedControl>
  );
}

export { UiSegmentedControl, UiSegmentedControlIndicator, UiSegmentedControlItem };
