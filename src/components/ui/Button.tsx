"use client"

import { cva, VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonStyles = cva(
  "font-semibold rounded-md cursor-pointer transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:bg-secondary/50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-destructive/50",
        outline:
          "border border-input bg-border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:bg-transparent disabled:text-muted-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground disabled:bg-transparent disabled:text-muted-foreground",
      },
      size: {
        sm: "px-4 py-1 text-sm",
        md: "px-6 py-2 text-md",
        lg: "px-8 py-3 text-lg",
        square: "p-3 text-md",
      },
      disabled: {
        false: null,
        true: "cursor-default",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export type ButtonProps = VariantProps<typeof buttonStyles> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }

export const Button = ({ variant, size, className, ...props }: ButtonProps) => {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      {...props}
    />
  )
}
