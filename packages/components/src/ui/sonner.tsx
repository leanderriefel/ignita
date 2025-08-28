"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useTheme } from "../theme/theme-provider"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme.variant}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      richColors
      closeButton
      position="top-center"
      {...props}
    />
  )
}

export { Toaster }
