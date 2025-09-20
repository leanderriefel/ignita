"use client"

import { cn } from "@ignita/lib"

export const Loading = ({ className }: { className?: string }) => {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-b-2 border-primary",
        className,
      )}
    />
  )
}
