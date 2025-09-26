"use client"

import { cn } from "@ignita/lib"

export const Loading = ({
  className,
  variant = "primary",
}: {
  className?: string
  variant?: "primary" | "secondary" | "none"
}) => {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-b-2",
        {
          "border-primary": variant === "primary",
          "border-secondary": variant === "secondary",
        },
        className,
      )}
    />
  )
}
