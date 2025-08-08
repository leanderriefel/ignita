"use client"

import { useCallback, useRef, useState } from "react"

import { cn } from "@ignita/lib"

import { Input } from "./input"

type ColorpickerProps = {
  value: string
  onChange?: (hex: string) => void
  onChangeEnd?: (hex: string) => void
  className?: string
  style?: React.CSSProperties
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : { r: 255, g: 0, b: 0 }
}

const rgbToHex = (r: number, g: number, b: number) =>
  `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
    .toString(16)
    .padStart(2, "0")}`

const rgbToHsv = (r: number, g: number, b: number) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      default:
        h = (rn - gn) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  const s = max === 0 ? 0 : d / max
  const v = max
  return { h, s, v }
}

const hsvToRgb = (h: number, s: number, v: number) => {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0,
    g = 0,
    b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

export const Colorpicker = ({
  value,
  onChange,
  onChangeEnd,
  className,
  style,
}: ColorpickerProps) => {
  // Parse initial value
  const initialRgb = hexToRgb(value)
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b)

  // Local state for current picker position
  const [hue, setHue] = useState(initialHsv.h)
  const [sat, setSat] = useState(initialHsv.s)
  const [val, setVal] = useState(initialHsv.v)

  const draggingRef = useRef<null | "sv" | "hue">(null)
  const svRef = useRef<HTMLDivElement>(null)
  const hueRef = useRef<HTMLDivElement>(null)

  // Generate current hex from local state
  const { r, g, b } = hsvToRgb(hue, sat, val)
  const currentHex = rgbToHex(r, g, b)

  const updateColor = useCallback(
    (h: number, s: number, v: number, final = false) => {
      setHue(h)
      setSat(s)
      setVal(v)
      const { r, g, b } = hsvToRgb(h, s, v)
      const newHex = rgbToHex(r, g, b)
      if (final) {
        onChangeEnd?.(newHex)
      } else {
        onChange?.(newHex)
      }
    },
    [onChange, onChangeEnd],
  )

  const updateSVFromPointer = useCallback(
    (clientX: number, clientY: number, final = false) => {
      const el = svRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = clamp((clientX - rect.left) / rect.width, 0, 1)
      const y = clamp((clientY - rect.top) / rect.height, 0, 1)
      const s = x
      const v = 1 - y
      updateColor(hue, s, v, final)
    },
    [hue, updateColor],
  )

  const updateHueFromPointer = useCallback(
    (clientX: number, final = false) => {
      const el = hueRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = clamp((clientX - rect.left) / rect.width, 0, 1)
      const h = x * 360
      updateColor(h, sat, val, final)
    },
    [sat, val, updateColor],
  )

  const handleSVPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      draggingRef.current = "sv"
      updateSVFromPointer(e.clientX, e.clientY)
    },
    [updateSVFromPointer],
  )

  const handleHuePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      draggingRef.current = "hue"
      updateHueFromPointer(e.clientX)
    },
    [updateHueFromPointer],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      if (draggingRef.current === "sv") {
        updateSVFromPointer(e.clientX, e.clientY)
      } else if (draggingRef.current === "hue") {
        updateHueFromPointer(e.clientX)
      }
    },
    [updateSVFromPointer, updateHueFromPointer],
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      if (draggingRef.current === "sv") {
        updateSVFromPointer(e.clientX, e.clientY, true)
      } else if (draggingRef.current === "hue") {
        updateHueFromPointer(e.clientX, true)
      }
      draggingRef.current = null
    },
    [updateSVFromPointer, updateHueFromPointer],
  )

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value.trim()
      if (!/^#?[0-9a-fA-F]{6}$/.test(v)) return
      const withHash = v.startsWith("#") ? v : `#${v}`
      const rgb = hexToRgb(withHash)
      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      setHue(hsv.h)
      setSat(hsv.s)
      setVal(hsv.v)
      onChange?.(withHash)
    },
    [onChange],
  )

  const handleHexBlur = useCallback(() => {
    onChangeEnd?.(currentHex)
  }, [currentHex, onChangeEnd])

  return (
    <div className={cn("flex w-full flex-col gap-3", className)} style={style}>
      <div className="relative aspect-square w-full rounded-lg border border-border p-px">
        <div
          ref={svRef}
          role="slider"
          aria-label="Saturation and value"
          tabIndex={0}
          onPointerDown={handleSVPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-full w-full rounded-[inherit] select-none"
          style={{
            backgroundColor: `hsl(${hue} 100% 50%)`,
            backgroundImage:
              "linear-gradient(to top, black, transparent), linear-gradient(to right, white, transparent)",
          }}
        >
          <div
            className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[2px] border-background shadow-sm ring-1 ring-ring/30"
            style={{
              left: `${sat * 100}%`,
              top: `${(1 - val) * 100}%`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative h-5 flex-1 cursor-pointer rounded-md border border-border p-1">
          <div
            ref={hueRef}
            role="slider"
            aria-label="Hue"
            tabIndex={0}
            onPointerDown={handleHuePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative size-full rounded-sm select-none"
            style={{
              background:
                "linear-gradient(90deg, #f00 0%, #ff0 16.66%, #0f0 33.33%, #0ff 50%, #00f 66.66%, #f0f 83.33%, #f00 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute h-full w-2.5 -translate-x-1/2 bg-background before:absolute before:-inset-y-1 before:right-0 before:left-0 before:mx-auto before:w-px before:bg-foreground"
              style={{
                left: `${(hue / 360) * 100}%`,
              }}
            />
          </div>
        </div>
        <div
          className="size-6 rounded-md border border-border"
          style={{ backgroundColor: currentHex }}
        />
      </div>
      <div className="flex items-center gap-2">
        <Input
          aria-label="Hex color"
          value={currentHex}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur()
            }
          }}
          className="h-8 flex-1 text-xs"
        />
      </div>
    </div>
  )
}

