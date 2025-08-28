import type { ComponentProps } from "react"

import { cn } from "@ignita/lib"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { AVAILABLE_THEMES, useTheme } from "./theme-provider"

export const ThemeSelector = ({
  className,
  ...props
}: ComponentProps<typeof SelectTrigger>) => {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme.id} onValueChange={(value) => setTheme(value)}>
      <SelectTrigger className={cn("w-48", className)} {...props}>
        <SelectValue placeholder="Select a theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Light</SelectLabel>
          {AVAILABLE_THEMES.filter((theme) => theme.variant === "light").map(
            (theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ),
          )}
          <SelectLabel>Dark</SelectLabel>
          {AVAILABLE_THEMES.filter((theme) => theme.variant === "dark").map(
            (theme) => (
              <SelectItem key={theme.id} value={theme.id}>
                {theme.name}
              </SelectItem>
            ),
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
