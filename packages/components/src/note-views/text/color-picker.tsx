"use client"

import { useState } from "react"
import { motion } from "motion/react"

interface ColorPickerProps {
  onColorSelect: (color: string) => void
  onHighlightSelect: (color: string) => void
  isOpen: boolean
  onClose: () => void
}

interface SimpleColorPickerProps {
  colors: string[]
  onColorSelect: (color: string) => void
  isOpen: boolean
  onClose: () => void
  title: string
}

const TEXT_COLORS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#1F2937",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#7C3AED",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
]

const HIGHLIGHT_COLORS = [
  "#FEF3C7",
  "#DBEAFE",
  "#D1FAE5",
  "#FCE7F3",
  "#E0E7FF",
  "#FEF2F2",
  "#FFF7ED",
  "#F0FDF4",
  "#FAFAFA",
  "#F3F4F6",
]

export const ColorPicker = ({
  onColorSelect,
  onHighlightSelect,
  isOpen,
  onClose,
}: ColorPickerProps) => {
  const [activeTab, setActiveTab] = useState<"text" | "highlight">("text")

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute z-50 mt-2 min-w-64 rounded-lg border bg-background p-3 shadow-lg"
    >
      {/* Tab buttons */}
      <div className="mb-3 flex gap-1">
        <button
          className={`rounded px-3 py-1 text-xs ${
            activeTab === "text"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => setActiveTab("text")}
        >
          Text Color
        </button>
        <button
          className={`rounded px-3 py-1 text-xs ${
            activeTab === "highlight"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => setActiveTab("highlight")}
        >
          Highlight
        </button>
      </div>

      {/* Color grid */}
      <div className="grid grid-cols-5 gap-2">
        {(activeTab === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS).map(
          (color) => (
            <button
              key={color}
              className="h-8 w-8 rounded border-2 border-transparent transition-colors hover:border-ring"
              style={{ backgroundColor: color }}
              onClick={() => {
                if (activeTab === "text") {
                  onColorSelect(color)
                } else {
                  onHighlightSelect(color)
                }
                onClose()
              }}
              title={color}
            />
          ),
        )}
      </div>

      {/* Reset button */}
      <div className="mt-3 border-t pt-3">
        <button
          className="w-full rounded bg-muted px-3 py-1 text-xs transition-colors hover:bg-muted/80"
          onClick={() => {
            if (activeTab === "text") {
              onColorSelect("")
            } else {
              onHighlightSelect("")
            }
            onClose()
          }}
        >
          Reset {activeTab === "text" ? "Color" : "Highlight"}
        </button>
      </div>
    </motion.div>
  )
}

export const SimpleColorPicker = ({
  colors,
  onColorSelect,
  isOpen,
  onClose,
  title,
}: SimpleColorPickerProps) => {
  if (!isOpen) return null

  return (
    <div className="absolute bottom-[calc(100%+var(--spacing)*2)] left-0 z-100 mt-2 min-w-48 rounded-lg border bg-background p-3 shadow-lg">
      <div className="mb-2 text-xs font-medium text-foreground/70">{title}</div>

      {/* Color grid */}
      <div className="grid grid-cols-5 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            className="h-8 w-8 rounded border-2 border-transparent transition-colors hover:border-ring"
            style={{ backgroundColor: color }}
            onClick={() => {
              onColorSelect(color)
              onClose()
            }}
            title={color}
          />
        ))}
      </div>

      {/* Reset button */}
      <div className="mt-3 border-t pt-3">
        <button
          className="w-full rounded bg-muted px-3 py-1 text-xs transition-colors hover:bg-muted/80"
          onClick={() => {
            onColorSelect("")
            onClose()
          }}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
