import { type VariantProps } from "class-variance-authority"

declare const buttonStyles: (
  props?:
    | ({
        variant?:
          | "link"
          | "primary"
          | "secondary"
          | "destructive"
          | "outline"
          | "ghost"
          | null
          | undefined
        size?: "sm" | "md" | "lg" | "square" | null | undefined
      } & import("class-variance-authority/types").ClassProp)
    | undefined,
) => string
export type ButtonProps = VariantProps<typeof buttonStyles> &
  React.ComponentProps<"button"> & {
    asChild?: boolean
  }
export declare const Button: ({
  variant,
  size,
  asChild,
  className,
  ...props
}: ButtonProps) => import("react").JSX.Element
export {}
//# sourceMappingURL=button.d.ts.map
