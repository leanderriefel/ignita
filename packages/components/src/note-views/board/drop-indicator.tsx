"use client"

import { memo } from "react"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

export const DropIndicator = memo(
  ({
    orientation,
    active,
  }: {
    orientation: "horizontal" | "vertical"
    active: boolean
  }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "rounded-md bg-primary",
          orientation === "horizontal"
            ? "h-1 w-full"
            : "w-1 shrink-0 self-stretch",
        )}
      />
    )
  },
)
