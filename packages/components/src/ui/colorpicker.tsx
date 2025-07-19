"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@ignita/lib"

interface ColorpickerProps {
  value?: string
  onChange?: (color: string) => void
  className?: string
  style?: React.CSSProperties
}

export const Colorpicker = ({
  value,
  onChange,
  className,
  style,
}: ColorpickerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentColor, setCurrentColor] = useState(value ?? "#dc2626")
  const [markerPosition, setMarkerPosition] = useState({ x: 0.5, y: 0.5 })
  const [isDragging, setIsDragging] = useState(false)
  const lastExternalValue = useRef(value)

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

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return { r, g, b }
  }

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min

    let h = 0
    const v = max

    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff) % 6
          break
        case g:
          h = (b - r) / diff + 2
          break
        case b:
          h = (r - g) / diff + 4
          break
      }
      h *= 60
      if (h < 0) h += 360
    }

    return { h, s: max === 0 ? 0 : diff / max, v }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          r: parseInt(result[1]!, 16),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          g: parseInt(result[2]!, 16),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          b: parseInt(result[3]!, 16),
        }
      : { r: 255, g: 0, b: 0 }
  }

  const calculateMarkerPosition = (color: string) => {
    const { r, g, b } = hexToRgb(color)
    const { h, v } = rgbToHsv(r, g, b)

    // Convert HSV to position on our vibrant wheel
    // The canvas uses: lightness = 0.6 + radius * 0.2
    // So to reverse: radius = (lightness - 0.6) / 0.2
    // The canvas uses: hue = (angle + 360 - 180) % 360
    // So to reverse: angle = (hue - 180 + 360) % 360
    const angle = ((h - 180 + 360) % 360) * (Math.PI / 180)
    const radiusNorm = Math.max(0, (v - 0.6) / 0.2)

    const x = 0.5 + 0.5 * radiusNorm * Math.cos(angle)
    const y = 0.5 + 0.5 * radiusNorm * Math.sin(angle)

    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  // Only update internal state when external value changes and we're not dragging
  useEffect(() => {
    if (value && value !== lastExternalValue.current && !isDragging) {
      lastExternalValue.current = value
      setCurrentColor(value)
      const position = calculateMarkerPosition(value)
      setMarkerPosition(position)
    }
  }, [value, isDragging])

  // Initialize marker position on mount
  useEffect(() => {
    if (currentColor) {
      const position = calculateMarkerPosition(currentColor)
      setMarkerPosition(position)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Higher resolution for smooth appearance
    const width = 128
    const height = 128
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(centerX, centerY)

    const imageData = ctx.createImageData(width, height)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const radius = Math.sqrt(dx * dx + dy * dy) / maxRadius

        const angle = (Math.atan2(dy, dx) * 180) / Math.PI
        const hue = (angle + 360 - 180) % 360

        // Create vibrant rainbow colors with darker output
        const saturation = 0.8 // Higher saturation for vibrant colors
        const lightness = 0.6 + radius * 0.2 // Range from 0.6 to 0.8 (medium to light)

        const { r, g, b } = hsvToRgb(hue, saturation, lightness)
        const idx = (y * width + x) * 4
        imageData.data[idx] = r
        imageData.data[idx + 1] = g
        imageData.data[idx + 2] = b
        imageData.data[idx + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Light blur for smooth edges
    ctx.filter = "blur(0.5px)"
    ctx.drawImage(canvas, 0, 0)
    ctx.filter = "none"
  }, [])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true)
    updateColorFromPosition(e)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    updateColorFromPosition(e)
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)

    if (!currentColor) return
    onChange?.(currentColor)
  }

  const updateColorFromPosition = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top

    const x = relX / rect.width
    const y = relY / rect.height

    // Calculate vibrant rainbow color from position
    const centerX = 0.5
    const centerY = 0.5
    const dx = x - centerX
    const dy = y - centerY
    const radiusNorm = Math.sqrt(dx * dx + dy * dy) / 0.5
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI
    const hue = (angle + 360 - 180) % 360

    // Vibrant rainbow color calculation with darker output
    const saturation = 0.8
    const lightness = 0.6 + radiusNorm * 0.2

    const { r, g, b } = hsvToRgb(hue, saturation, lightness)
    const hex = rgbToHex(r, g, b)

    setCurrentColor(hex)
    setMarkerPosition({ x, y })
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updateColorFromPosition(e)

    if (!currentColor) return
    onChange?.(currentColor)
  }

  return (
    <div className={cn("relative w-full", className)} style={style}>
      <canvas
        ref={canvasRef}
        width={128}
        height={128}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border-foreground/20 dark:border-foreground/30 aspect-square w-full cursor-crosshair rounded-2xl border opacity-80 shadow-xl backdrop-blur-sm dark:opacity-90"
        style={{ imageRendering: "auto" }}
      />
      <div
        className="border-background dark:border-background/80 pointer-events-none absolute size-8 rounded-full border-3 shadow-lg dark:shadow-xl"
        style={{
          left: `${markerPosition.x * 100}%`,
          top: `${markerPosition.y * 100}%`,
          transform: "translate(-50%, -50%)",
          backgroundColor: currentColor,
        }}
      />
    </div>
  )
}
