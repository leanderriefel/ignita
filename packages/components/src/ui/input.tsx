"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@ignita/lib"

const inputStyles = cva(
  "flex w-full rounded-lg border bg-transparent text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_input]:bg-transparent",
  {
    variants: {
      variant: {
        default: "border-input",
        outline: "border-input hover:border-ring/50",
      },
      size: {
        sm: "h-8 px-2.5 py-1 text-xs",
        md: "h-9 px-3 py-1",
        lg: "h-10 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
)

export type InputProps = VariantProps<typeof inputStyles> &
  React.ComponentProps<"input"> & { asChild?: boolean }

export const Input = ({
  variant,
  size,
  asChild,
  className,
  ...props
}: InputProps) => {
  const Comp = asChild ? Slot.Root : "input"
  return (
    <Comp
      className={cn(inputStyles({ variant, size }), className)}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      {...props}
    />
  )
}
