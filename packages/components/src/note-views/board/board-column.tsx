import { memo, useCallback, useMemo } from "react"
import { motion } from "motion/react"

import { useUpdateNoteContent } from "@ignita/hooks"

import { Divider } from "../../ui/divider"
import type { NoteProp } from "../types"
import { BoardCard } from "./board-card"
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
  }) => {
    const isDragging = useMemo(
      () =>
        dragging && "column" in dragging && dragging.column.id === column.id,
      [dragging, column.id],
    )

    const updateNoteContent = useUpdateNoteContent()

    const handleDragStart = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
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
      const newCard: Card = {
        id: crypto.randomUUID(),
        title: "",
        content: "",
        tags: [],
      }

      updateNoteContent.mutate({
        id: note.id,
        note: {
          type: "board",
          content: {
            columns: note.note.content.columns.map((col: Column) =>
              col.id === column.id
                ? {
                    ...col,
                    cards: [...col.cards, newCard],
                  }
                : col,
            ),
          },
        },
      })
    }, [column, note, updateNoteContent])

    return (
      <motion.div
        ref={(element) => onColumnRef(column.id, column, element)}
        className="group bg-card flex min-h-80 w-72 flex-col gap-3 rounded-lg border-2 p-4"
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
          className="flex cursor-move items-center justify-between"
          onPointerDown={handleDragStart}
        >
          <h4 className="text-foreground text-base font-medium">
            {column.title}
          </h4>
          <div className="bg-accent text-accent-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
            {column.cards.length}
          </div>
        </div>

        <Divider />

        <div className="flex flex-1 flex-col gap-y-0">
          {column.cards.map((card, index) => (
            <div key={card.id}>
              <DropIndicator
                orientation="horizontal"
                active={dropIndicatorIndex === index}
              />
              <BoardCard
                card={card}
                note={note}
                column={column}
                dragging={dragging}
                setDragging={setDragging}
                setDraggingPosition={setDraggingPosition}
                onCardRef={onCardRef}
                setSheetCard={setSheetCard}
              />
            </div>
          ))}

          <DropIndicator
            orientation="horizontal"
            active={dropIndicatorIndex === column.cards.length}
          />

          {column.cards.length === 0 && (
            <div className="mb-4 flex flex-1 items-center justify-center rounded-md border-2 border-dashed p-6 text-center">
              <p className="text-muted-foreground text-sm">No cards yet</p>
            </div>
          )}

          <div className="mt-auto">
            <button
              onClick={createNewCard}
              className="hover:bg-accent/25 bg-muted hover:border-foreground/25 text-muted-foreground hover:text-foreground mt-4 h-11.5 w-full cursor-pointer rounded-sm border-2 border-dashed text-sm transition-colors"
            >
              Create new card
            </button>
          </div>
        </div>
      </motion.div>
    )
  },
)
