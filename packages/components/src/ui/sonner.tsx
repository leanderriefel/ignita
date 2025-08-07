"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "../theme/theme-provider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme satisfies ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      richColors
      position="bottom-right"
      {...props}
    />
  )
}

export { Toaster }
