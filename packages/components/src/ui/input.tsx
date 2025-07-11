import { Slot } from "radix-ui"

import { cn } from "@ignita/lib"

export type InputProps = React.ComponentProps<"input"> & { asChild?: boolean }

export const Input = ({ asChild, className, ...props }: InputProps) => {
  const Comp = asChild ? Slot.Root : "input"
  return (
    <Comp
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md",
        "border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm",
        "file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      autoComplete="off"
      autoCapitalize="off"
      autoCorrect="off"
      {...props}
    />
  )
}
