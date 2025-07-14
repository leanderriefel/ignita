import { memo, useCallback, useMemo, useRef, useState } from "react"
import { DotsVerticalIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { Button } from "../../ui/button"
import type { NoteProp } from "../types"
import { BoardCardPopoverSettingsTrigger } from "./board-card-popover-settings"
import type { Card, Column, Dragged } from "./types"

export const BoardCard = memo(
  ({
    card,
    note,
    column,
    dragging,
    setDragging,
    setDraggingPosition,
    onCardRef,
    setSheetCard,
  }: {
    card: Card
    note: NoteProp<"board">
    column: Column
    dragging: Dragged
    setDragging: (dragging: Dragged) => void
    setDraggingPosition: (position: { x: number; y: number } | null) => void
    onCardRef: (
      cardId: string,
      card: Card,
      element: HTMLDivElement | null,
    ) => void
    setSheetCard: (card: Card | null) => void
  }) => {
    const [isEditingMode, setIsEditingMode] = useState(false)

    const isDragging = useMemo(
      () => dragging && "card" in dragging && dragging.card.id === card.id,
      [dragging, card.id],
    )

    const cardNameRef = useRef<HTMLDivElement>(null)

    const handleDragStart = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget && e.target !== cardNameRef.current)
          return

        e.preventDefault()
        e.stopPropagation()

        const element = e.currentTarget
        if (!element) return

        const startX = e.clientX
        const startY = e.clientY

        let dragStarted = false

        const startDragging = (clientX: number, clientY: number) => {
          dragStarted = true
          setDragging({
            element,
            card,
          })
          setDraggingPosition({
            x: clientX,
            y: clientY,
          })
          document.body.style.cursor = "grabbing"
        }

        const moveListener = (ev: PointerEvent) => {
          const dx = Math.abs(ev.clientX - startX)
          const dy = Math.abs(ev.clientY - startY)
          if (!dragStarted && (dx > 5 || dy > 5)) {
            startDragging(ev.clientX, ev.clientY)
          }
        }

        const upListener = () => {
          if (!dragStarted) setSheetCard(card)

          clearTimeout(holdTimer)
          document.removeEventListener("pointermove", moveListener)
          document.removeEventListener("pointerup", upListener)
          document.body.style.cursor = "default"
        }

        const holdTimer = window.setTimeout(() => {
          if (!dragStarted) startDragging(startX, startY)
        }, 250)

        document.addEventListener("pointermove", moveListener)
        document.addEventListener("pointerup", upListener)
      },
      [card, setDragging, setDraggingPosition, setSheetCard],
    )

    return (
      <motion.div
        className="bg-background hover:border-foreground/25 hover:bg-accent/25 relative flex cursor-pointer items-center rounded-md border transition-colors [&:hover_.card-settings]:opacity-100"
        layoutId={card.id}
        animate={{ opacity: isDragging ? 0.35 : 1 }}
        transition={{
          duration: 0.15,
          ease: "easeOut",
        }}
        ref={(element) => onCardRef(card.id, card, element)}
        onPointerDown={handleDragStart}
      >
        <div
          className={cn(
            "text-foreground flex-1 truncate py-3 pr-2 pl-4 text-sm leading-relaxed",
            !card.title && "text-muted-foreground",
          )}
          ref={cardNameRef}
        >
          {card.title || "New Card"}
        </div>
        <Button
          variant="ghost"
          size="square"
          className="card-settings mr-1.5 size-7 rounded-sm opacity-0 transition-opacity"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsEditingMode(!isEditingMode)
          }}
        >
          <Pencil1Icon className="size-3.5" />
        </Button>
        <BoardCardPopoverSettingsTrigger
          card={card}
          note={note}
          column={column}
          asChild
        >
          <Button
            variant="ghost"
            size="square"
            className="card-settings mr-2.5 size-7 rounded-sm opacity-0 transition-opacity"
          >
            <DotsVerticalIcon className="size-3.5" />
          </Button>
        </BoardCardPopoverSettingsTrigger>
      </motion.div>
    )
  },
  (prev, next) => {
    return prev.card === next.card && prev.dragging === next.dragging
  },
)
