"use client"

import { memo, useEffect, useState } from "react"
import { motion } from "motion/react"
import { createPortal } from "react-dom"

import { cn } from "@ignita/lib"

import type { Dragged } from "./types"

export const DragOverlay = memo(
  ({
    dragging,
    startingPos,
  }: {
    dragging: Dragged
    startingPos: { x: number; y: number }
  }) => {
    const [pos, setPos] = useState<{ x: number; y: number }>(startingPos)

    useEffect(() => {
      if (!dragging) return

      setPos(startingPos)

      const handleMove = (e: PointerEvent) => {
        setPos({ x: e.clientX, y: e.clientY })
      }

      document.addEventListener("pointermove", handleMove)
      return () => {
        document.removeEventListener("pointermove", handleMove)
      }
    }, [dragging, startingPos])

    if (!dragging) return null

    return createPortal(
      <motion.div
        style={{
          position: "absolute",
          top: pos.y - 5,
          left: pos.x - 5,
        }}
        className="origin-top-left"
        initial={{ opacity: 0, rotate: -15 }}
        animate={{ opacity: 1, rotate: 15 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 10,
          mass: 0.75,
          bounce: 1,
          restDelta: 0.001,
          restSpeed: 0.001,
        }}
      >
        <div
          className={cn(
            "flex origin-top-left items-center justify-center rounded-md border bg-card px-5 py-3 text-sm font-medium",
            {
              "text-muted-foreground":
                "card" in dragging && !dragging.card.title,
              "text-foreground": "card" in dragging && dragging.card.title,
            },
          )}
        >
          {"card" in dragging
            ? dragging.card.title || "New Card"
            : dragging.column.title || "New Column"}
        </div>
      </motion.div>,
      document.body,
    )
  },
)
