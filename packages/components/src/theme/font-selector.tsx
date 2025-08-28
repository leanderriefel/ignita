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
import { MONOSPACE_FONTS, TEXT_FONTS, useFont } from "./font-provider"

export const TextFontSelector = ({
  className,
  style,
  ...props
}: ComponentProps<typeof SelectTrigger>) => {
  const { normalFont, setNormalFont } = useFont()

  return (
    <Select
      value={normalFont.id}
      onValueChange={(value) => setNormalFont(value)}
    >
      <SelectTrigger
        className={cn("w-48", className)}
        style={{
          fontFamily: normalFont.family,
          ...style,
        }}
        {...props}
      >
        <SelectValue placeholder="Select a font" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Text Fonts</SelectLabel>
          {TEXT_FONTS.map((font) => (
            <SelectItem
              key={font.id}
              value={font.id}
              style={{ fontFamily: font.family }}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export const MonospaceFontSelector = ({
  className,
  style,
  ...props
}: ComponentProps<typeof SelectTrigger>) => {
  const { monospaceFont, setMonospaceFont } = useFont()

  return (
    <Select
      value={monospaceFont.id}
      onValueChange={(value) => setMonospaceFont(value)}
    >
      <SelectTrigger
        className={cn("w-48", className)}
        style={{
          fontFamily: monospaceFont.family,
          ...style,
        }}
        {...props}
      >
        <SelectValue placeholder="Select a monospace font" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Monospace Fonts</SelectLabel>
          {MONOSPACE_FONTS.map((font) => (
            <SelectItem
              key={font.id}
              value={font.id}
              style={{ fontFamily: font.family }}
            >
              {font.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
