import { Button as UiButton } from "@ui-sdk/react/button";
import type * as React from "react";

import { cn } from "./cn";
import { SpinnerIcon } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "cta";

export interface ButtonProps extends Omit<
  React.ComponentPropsWithoutRef<typeof UiButton>,
  "className" | "children"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-gold-fg font-semibold hover:bg-gold-bright active:bg-gold/90 data-pressed:bg-gold/90",
  secondary:
    "bg-control text-fg font-medium hairline hover:bg-control-active hover:hairline-strong active:bg-section",
  ghost:
    "bg-transparent text-muted-fg font-medium hover:text-fg hover:bg-control/60 active:bg-control",
  icon: "bg-panel text-muted-fg hairline hover:text-fg hover:bg-control hover:hairline-strong active:bg-control-active",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-[8px] gap-1.5",
  md: "h-9 px-3.5 text-[13px] rounded-[8px] gap-2",
  cta: "h-[50px] px-5 text-[13px] rounded-[8px] gap-2",
};

const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 w-8 p-0 rounded-[6px]",
  md: "h-9 w-9 p-0 rounded-[8px]",
  cta: "h-[50px] w-[50px] p-0 rounded-[8px]",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const sizeClass = variant === "icon" ? ICON_SIZE_CLASSES[size] : SIZE_CLASSES[size];

  return (
    <UiButton
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-loading={loading ? "" : undefined}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none",
        "transition-[background-color,color,border-color,opacity,transform] duration-150 ease-out active:scale-[0.99]",
        // Disabled vs loading are two visually distinct states per spec.
        disabled && !loading && "cursor-not-allowed opacity-45 active:scale-100",
        loading && "cursor-progress opacity-85 active:scale-100",
        VARIANT_CLASSES[variant],
        sizeClass,
        className,
      )}
      {...props}
    >
      {loading ? <SpinnerIcon className="h-3.5 w-3.5 shrink-0" /> : null}
      {children}
    </UiButton>
  );
}
