import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DotsVerticalIcon, Pencil1Icon } from "@radix-ui/react-icons"
import { motion } from "motion/react"

import { useUpdateBoardCardTitle } from "@ignita/hooks"
import { cn } from "@ignita/lib"

import { Button } from "../../ui/button"
import type { NoteProp } from "../types"
import { BoardCardPopoverSettingsTrigger } from "./board-card-popover-settings"
import type { Card, Dragged } from "./types"

export const BoardCard = memo(
  ({
    card,
    note,
    dragging,
    setDragging,
    setDraggingPosition,
    onCardRef,
    setSheetCard,
    isEditing,
    setEditingCardId,
  }: {
    card: Card
    note: NoteProp<"board">
    dragging: Dragged
    setDragging: (dragging: Dragged) => void
    setDraggingPosition: (position: { x: number; y: number } | null) => void
    onCardRef: (
      cardId: string,
      card: Card,
      element: HTMLDivElement | null,
    ) => void
    setSheetCard: (card: Card | null) => void
    isEditing: boolean
    setEditingCardId: (cardId: string | null) => void
  }) => {
    const isDragging = useMemo(
      () => dragging && "card" in dragging && dragging.card.id === card.id,
      [dragging, card.id],
    )

    const cardNameRef = useRef<HTMLDivElement>(null)
    const [inputValue, setInputValue] = useState(card.title || "")

    useEffect(() => {
      setInputValue(card.title || "")
    }, [card.title])

    const inputRef = useCallback(
      (element: HTMLInputElement | null) => {
        if (element && isEditing) {
          element.focus()
          element.select()
        }
      },
      [isEditing],
    )

    const updateBoardCardTitle = useUpdateBoardCardTitle()

    const saveCardTitle = useCallback(() => {
      if (inputValue !== card.title) {
        updateBoardCardTitle.mutate({
          noteId: note.id,
          cardId: card.id,
          title: inputValue,
        })
      }
      setEditingCardId(null)
    }, [
      inputValue,
      card.title,
      card.id,
      note.id,
      updateBoardCardTitle,
      setEditingCardId,
    ])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault()
          saveCardTitle()
        } else if (e.key === "Escape") {
          e.preventDefault()
          setInputValue(card.title || "")
          setEditingCardId(null)
        }
      },
      [saveCardTitle, card.title, setEditingCardId],
    )

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
        {isEditing ? (
          <input
            className={cn(
              "text-foreground min-w-0 flex-1 border-none bg-transparent py-3 pr-2 pl-4 text-sm leading-relaxed underline underline-offset-4 outline-none",
              !inputValue && "text-muted-foreground",
            )}
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={saveCardTitle}
            onKeyDown={handleKeyDown}
            placeholder="New Card"
          />
        ) : (
          <div
            className={cn(
              "text-foreground flex-1 py-3 pr-2 pl-4 text-sm leading-relaxed",
              !card.title && "text-muted-foreground",
            )}
            ref={cardNameRef}
          >
            {card.title || "New Card"}
          </div>
        )}
        <Button
          variant="ghost"
          size="square"
          className={cn(
            "card-settings size-7 rounded-sm opacity-0 transition-opacity",
            {
              "bg-accent border-accent-foreground/25 border": isEditing,
            },
          )}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setEditingCardId(isEditing ? null : card.id)
          }}
        >
          <Pencil1Icon className="size-3.5" />
        </Button>
        <BoardCardPopoverSettingsTrigger card={card} note={note} asChild>
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
    return (
      prev.card === next.card &&
      prev.dragging === next.dragging &&
      prev.isEditing === next.isEditing
    )
  },
)
