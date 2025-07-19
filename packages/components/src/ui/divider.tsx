"use client"

import type { ReactNode } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@ignita/lib"

const dividerStyles = cva("bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "inline-flex h-full w-px",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      size: "sm",
      className: "h-px",
    },
    {
      orientation: "horizontal",
      size: "md",
      className: "h-px",
    },
    {
      orientation: "horizontal",
      size: "lg",
      className: "h-0.5",
    },
    {
      orientation: "vertical",
      size: "sm",
      className: "w-px",
    },
    {
      orientation: "vertical",
      size: "md",
      className: "w-px",
    },
    {
      orientation: "vertical",
      size: "lg",
      className: "w-0.5",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    size: "md",
  },
})

interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerStyles> {
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
  size,
  children,
  gap = "mx-4",
  ...props
}: DividerProps) => {
  if (orientation === "vertical") {
    return (
      <div
        className={cn(dividerStyles({ orientation, size }), className)}
        {...props}
      />
    )
  }

  // If there's no children, render a simple horizontal divider
  if (!children) {
    return (
      <div
        className={cn(dividerStyles({ orientation, size }), className)}
        {...props}
      />
    )
  }

  // Render a divider with text in the center
  return (
    <div className="relative flex w-full items-center">
      <div className={cn(dividerStyles({ orientation, size }), "flex-grow")} />
      <div className={cn("text-muted-foreground flex-shrink-0 text-sm", gap)}>
        {children}
      </div>
      <div className={cn(dividerStyles({ orientation, size }), "flex-grow")} />
    </div>
  )
}
