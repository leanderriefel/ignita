"use client"

import type { ReactNode } from "react"

import { cn } from "@ignita/lib"

interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The orientation of the divider.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Optional text to display in the center of the divider.
   */
  children?: ReactNode
  /**
   * The gap between the divider and the text.
   * @default "mx-4"
   */
  gap?: string
}

export const Divider = ({
  className,
  orientation = "horizontal",
  children,
  gap = "mx-4",
  ...props
}: DividerProps) => {
  if (orientation === "vertical") {
    return (
      <div
        className={cn("bg-border inline-flex h-full w-px", className)}
        {...props}
      />
    )
  }

  // If there's no children, render a simple horizontal divider
  if (!children) {
    return <div className={cn("bg-border h-px w-full", className)} {...props} />
  }

  // Render a divider with text in the center
  return (
    <div className="relative flex w-full items-center">
      <div className="bg-border h-px flex-grow" />
      <div className={cn("text-muted-foreground flex-shrink-0 text-sm", gap)}>
        {children}
      </div>
      <div className="bg-border h-px flex-grow" />
    </div>
  )
}
