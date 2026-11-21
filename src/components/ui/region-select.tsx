import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";

import { getPlatformInfo, PLATFORMS, type Platform } from "../../lib/riot/regions";
import { cn } from "./cn";
import { CheckIcon, ChevronDownIcon } from "./icons";

export interface RegionSelectProps {
  value: Platform;
  onValueChange: (platform: Platform) => void;
  variant?: "embedded" | "standalone";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const REGION_ITEMS = PLATFORMS.map((platform) => ({
  value: platform.id,
  label: platform.short,
}));

export function RegionSelect({
  value,
  onValueChange,
  variant = "standalone",
  disabled = false,
  className,
  "aria-label": ariaLabel = "Region",
}: RegionSelectProps) {
  const active = getPlatformInfo(value);

  return (
    <Select<Platform>
      items={REGION_ITEMS}
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) {
          onValueChange(next);
        }
      }}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex shrink-0 cursor-pointer items-center justify-between gap-1.5 text-[13px] font-medium text-fg select-none",
          "transition-colors duration-150 ease-out",
          "data-disabled:cursor-not-allowed data-disabled:opacity-45",
          variant === "embedded"
            ? "h-10 rounded-[6px] px-3 hover:bg-control/60"
            : "h-9 rounded-[8px] bg-panel px-3 hairline hover:bg-control hover:hairline-strong",
          className,
        )}
      >
        <SelectValue>{active.short}</SelectValue>
        <ChevronDownIcon className="h-3.5 w-3.5 text-meta-fg transition-transform duration-150 [[data-open]>&]:rotate-180" />
      </SelectTrigger>

      <SelectContent
        side="bottom"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          "z-50 max-h-72 w-52 overflow-y-auto rounded-[10px] bg-popover p-1 text-[13px] text-fg hairline-strong",
          "shadow-[0_12px_32px_rgba(0,0,0,0.55)] outline-none",
        )}
      >
        {PLATFORMS.map((platform) => (
          <SelectItem
            key={platform.id}
            value={platform.id}
            label={`${platform.short} ${platform.label}`}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-2 rounded-[6px] px-2.5 py-1.5 text-[13px] select-none outline-none",
              "text-muted-fg transition-colors duration-100",
              "data-highlighted:bg-control-active data-highlighted:text-fg",
              "data-selected:text-fg",
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="w-10 shrink-0 font-semibold text-fg tabular">{platform.short}</span>
              <span className="truncate text-meta-fg">{platform.label}</span>
            </span>
            <SelectItemIndicator className="text-fg">
              <CheckIcon className="h-3.5 w-3.5" />
            </SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
