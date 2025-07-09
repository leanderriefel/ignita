import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@ignita/lib"

const buttonStyles = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary border-primary-darker text-primary-foreground hover:bg-primary-darker [&_svg]:fill-primary-foreground border shadow-xs",
        secondary:
          "bg-secondary/70 text-secondary-foreground hover:bg-secondary border-secondary [&_svg]:fill-secondary-foreground border shadow-xs",
        destructive:
          "bg-destructive/70 border-destructive hover:bg-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [&_svg]:fill-destructive-foreground text-destructive-foreground border shadow-xs",
        outline:
          "hover:bg-accent hover:text-accent-foreground border shadow-xs",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary [&_svg]:fill-primary underline underline-offset-4",
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
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  )
}
