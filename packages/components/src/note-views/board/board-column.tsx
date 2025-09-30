"use client"

import { memo, useCallback, useMemo, useRef } from "react"
import { EllipsisVertical } from "lucide-react"
import { motion } from "motion/react"

import { useAddBoardCard } from "@ignita/hooks"

import { Button } from "../../ui/button"
import { Divider } from "../../ui/divider"
import type { NoteProp } from "../types"
import { BoardCard } from "./board-card"
import { BoardColumnPopoverSettingsTrigger } from "./board-column-popover-settings"
import { DropIndicator } from "./drop-indicator"
import type { Card, Column, Dragged } from "./types"

export const BoardColumn = memo(
  ({
    column,
    note,
    dragging,
    setDragging,
    setDraggingPosition,
    onColumnRef,
    onCardRef,
    dropIndicatorIndex,
    setSheetCard,
    editingCardId,
    setEditingCardId,
  }: {
    column: Column
    note: NoteProp<"board">
    dragging: Dragged
    setDragging: (dragging: Dragged) => void
    setDraggingPosition: (position: { x: number; y: number } | null) => void
    onColumnRef: (
      columnId: string,
      column: Column,
      element: HTMLDivElement | null,
    ) => void
    onCardRef: (
      cardId: string,
      card: Card,
      element: HTMLDivElement | null,
    ) => void
    dropIndicatorIndex: number | null
    setSheetCard: (card: Card | null) => void
    editingCardId: string | null
    setEditingCardId: (cardId: string | null) => void
  }) => {
    const isDragging = useMemo(
      () =>
        dragging && "column" in dragging && dragging.column.id === column.id,
      [dragging, column.id],
    )

    const addBoardCard = useAddBoardCard()

    const settingsButtonRef = useRef<HTMLButtonElement>(null)

    const handleDragStart = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return

        e.preventDefault()
        e.stopPropagation()

        const element = e.currentTarget
        if (!element) return

        setDragging({
          element,
          column,
        })

        setDraggingPosition({
          x: e.clientX,
          y: e.clientY,
        })

        document.body.style.cursor = "grabbing"
      },
      [column, setDragging, setDraggingPosition],
    )

    const createNewCard = useCallback(() => {
      addBoardCard.mutate({
        id: crypto.randomUUID(),
        noteId: note.id,
        columnId: column.id,
        title: "",
        content: "",
      })
    }, [column.id, note.id, addBoardCard])

    return (
      <motion.div
        ref={(element) => onColumnRef(column.id, column, element)}
        className="group flex min-h-80 w-72 flex-col gap-3 rounded-lg border-2 bg-card p-4"
        animate={{ opacity: isDragging ? 0.35 : 1 }}
        transition={{
          opacity: { duration: 0.15, ease: "easeOut" },
          layout: { type: "spring", stiffness: 250, damping: 28 },
        }}
        style={{
          borderColor: column.color
            ? `${column.color}88`
            : "hsl(var(--border) / 0.5)",
          boxShadow: column.color
            ? `0 4px 20px -4px ${column.color}66`
            : "0 4px 20px -4px hsl(var(--border) / 0.33)",
        }}
        layout
      >
        <div
          className="flex cursor-move items-center"
          onPointerDown={handleDragStart}
        >
          <h4 className="cursor-default text-base font-medium text-foreground">
            {column.title}
          </h4>
          <div
            className="ml-3 flex size-6 cursor-default items-center justify-center rounded-sm border-2 text-xs font-medium text-foreground"
            style={{
              borderColor: column.color
                ? `${column.color}88`
                : "hsl(var(--border) / 0.5)",
            }}
          >
            {column.cards.length}
          </div>
          <BoardColumnPopoverSettingsTrigger
            column={column}
            note={note}
            asChild
          >
            <Button
              variant="ghost"
              size="square"
              className="ml-auto size-7 rounded-sm"
              ref={settingsButtonRef}
            >
              <EllipsisVertical className="size-3.5" />
            </Button>
          </BoardColumnPopoverSettingsTrigger>
        </div>

        <Divider />

        <div className="flex flex-1 flex-col gap-y-0 overflow-y-auto">
          {column.cards.map((card, index) => (
            <div key={card.id}>
              <DropIndicator
                orientation="horizontal"
                active={dropIndicatorIndex === index}
              />
              <BoardCard
                card={card}
                note={note}
                dragging={dragging}
                setDragging={setDragging}
                setDraggingPosition={setDraggingPosition}
                onCardRef={onCardRef}
                setSheetCard={setSheetCard}
                isEditing={editingCardId === card.id}
                setEditingCardId={setEditingCardId}
              />
            </div>
          ))}

          <DropIndicator
            orientation="horizontal"
            active={dropIndicatorIndex === column.cards.length}
          />

          {column.cards.length === 0 && (
            <div className="mb-4 flex flex-1 items-center justify-center rounded-md border-2 border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">No cards yet</p>
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={createNewCard}
              className="mt-4 h-11.5 w-full cursor-pointer rounded-sm border-2 border-dashed bg-muted/50 text-sm text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-muted hover:text-foreground"
            >
              Create new card
            </button>
          </div>
        </div>
      </motion.div>
    )
  },
)
