"use client"

import { forwardRef, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@ignita/lib"

import { Button } from "./button"

const inputStyles = cva(
  "flex w-full rounded-lg border bg-background/50 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_input]:bg-transparent",
  {
    variants: {
      variant: {
        default: "border-input",
        outline: "border bg-background shadow-xs hover:text-foreground",
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, size, asChild, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword)
    }

    const Comp = asChild ? Slot.Root : "input"

    if (isPassword) {
      return (
        <div className={cn("relative", className)}>
          <Comp
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={cn(inputStyles({ variant, size }), "pr-10")}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            {...props}
          />
          <Button
            size="square"
            variant="ghost"
            onClick={togglePasswordVisibility}
            className="absolute top-1/2 right-0 -translate-y-1/2 hover:bg-transparent"
          >
            {showPassword ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeOffIcon className="size-4" />
            )}
          </Button>
        </div>
      )
    }

    return (
      <Comp
        ref={ref}
        type={type}
        className={cn(inputStyles({ variant, size }), className)}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        {...props}
      />
    )
  },
)

Input.displayName = "Input"
