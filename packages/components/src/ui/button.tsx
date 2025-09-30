"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@ignita/lib"

const buttonStyles = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "border border-primary-darker bg-primary text-primary-foreground shadow-xs hover:bg-primary-darker [&_svg]:fill-primary-foreground",
        secondary:
          "border border-secondary bg-secondary/70 text-secondary-foreground shadow-xs hover:bg-secondary [&_svg]:fill-secondary-foreground",
        destructive:
          "border border-destructive bg-destructive/70 text-destructive-foreground shadow-xs hover:bg-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [&_svg]:fill-destructive-foreground",
        outline:
          "border bg-background shadow-xs hover:bg-border hover:text-foreground",
        ghost: "hover:bg-foreground/10 hover:text-foreground",
        link: "text-foreground underline underline-offset-4 transition-all hover:text-foreground/80 [&_svg]:fill-foreground hover:[&_svg]:fill-foreground/80",
      },
      size: {
        xs: "h-7 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5",
        sm: "h-8 gap-1.5 rounded-lg px-3 has-[>svg]:px-2.5",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        square: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

export type ButtonProps = VariantProps<typeof buttonStyles> &
  React.ComponentProps<"button"> & { asChild?: boolean }

export const Button = ({
  variant,
  size,
  asChild,
  className,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      type={props.type ?? "button"}
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  )
}
