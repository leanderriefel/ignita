"use client"

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { Content } from "@tiptap/react"
import { AnimatePresence, motion } from "motion/react"

import {
  useAddBoardColumn,
  useMoveBoardCard,
  useReorderBoardColumns,
  useUpdateBoardCardContent,
  useUpdateBoardCardTitle,
} from "@ignita/hooks"

import type { NoteProp } from "../types"
import { BoardColumn } from "./board-column"
import { BoardDrawer } from "./board-drawer"
import { DragOverlay } from "./drag-overlay"
import { DropIndicator } from "./drop-indicator"
import type { Card, CardRef, Column, ColumnRef, Dragged } from "./types"

type BoardNote = NoteProp<"board">

export const BoardNoteView = ({ note }: { note: BoardNote }) => {
  const [dragging, setDragging] = useState<Dragged>(null)
  const draggingPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [cardDropPosition, setCardDropPosition] = useState<{
    columnId: string
    index: number
  } | null>(null)
  const [columnDropIndex, setColumnDropIndex] = useState<number | null>(null)
  const [sheetCard, setSheetCard] = useState<Card | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)

  const moveBoardCard = useMoveBoardCard()
  const reorderBoardColumns = useReorderBoardColumns()
  const updateBoardCardTitle = useUpdateBoardCardTitle()
  const updateBoardCardContent = useUpdateBoardCardContent()
  const addBoardColumn = useAddBoardColumn()

  const saveAndCloseCard = (
    titleValue: string,
    content: Content,
    currentCard: Card | null,
  ) => {
    if (!currentCard) {
      setSheetCard(null)
      return
    }

    const titleChanged = titleValue !== currentCard.title
    const contentChanged =
      JSON.stringify(content) !== JSON.stringify(currentCard.content)

    if (titleChanged) {
      updateBoardCardTitle.mutate({
        noteId: note.id,
        cardId: currentCard.id,
        title: titleValue,
      })
    }

    if (contentChanged) {
      updateBoardCardContent.mutate({
        noteId: note.id,
        cardId: currentCard.id,
        content,
      })
    }

    setSheetCard(null)
  }

  const columnRefs = useRef<Map<string, ColumnRef>>(new Map())
  const cardRefs = useRef<Map<string, CardRef>>(new Map())

  const updateDraggingPosition = useCallback(
    (pos: { x: number; y: number } | null) => {
      if (pos) {
        draggingPosition.current = pos
      }
    },
    [],
  )

  const registerColumnRef = useCallback(
    (columnId: string, column: Column, element: HTMLDivElement | null) => {
      if (element) {
        columnRefs.current.set(columnId, { column, element })
      } else {
        const existing = columnRefs.current.get(columnId)
        if (existing && !document.contains(existing.element)) {
          columnRefs.current.delete(columnId)
        }
      }
    },
    [],
  )

  const registerCardRef = useCallback(
    (cardId: string, card: Card, element: HTMLDivElement | null) => {
      if (element) {
        cardRefs.current.set(cardId, { card, element })
      } else {
        const existing = cardRefs.current.get(cardId)
        if (existing && !document.contains(existing.element)) {
          cardRefs.current.delete(cardId)
        }
      }
    },
    [],
  )

  const calculateCardDropPosition = useCallback(
    (dragX: number, dragY: number) => {
      let targetColumnId: string | null = null
      let closestDistance = Infinity

      for (const [columnId, columnRef] of columnRefs.current.entries()) {
        const rect = columnRef.element.getBoundingClientRect()

        if (
          dragX >= rect.left &&
          dragX <= rect.right &&
          dragY >= rect.top &&
          dragY <= rect.bottom
        ) {
          targetColumnId = columnId
          break
        }

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const distance = Math.sqrt(
          Math.pow(dragX - centerX, 2) + Math.pow(dragY - centerY, 2),
        )

        if (distance < closestDistance) {
          closestDistance = distance
          targetColumnId = columnId
        }
      }

      if (!targetColumnId) return null

      const targetColumn = columnRefs.current.get(targetColumnId)
      if (!targetColumn) return null

      const columnCards = Array.from(cardRefs.current.values()).filter(
        (cardRef) =>
          note.note.content.columns
            .find((column) => column.id === targetColumnId)
            ?.cards.find((card) => card.id === cardRef.card.id),
      )

      const sortedCards = columnCards.sort((a, b) => {
        const rectA = a.element.getBoundingClientRect()
        const rectB = b.element.getBoundingClientRect()
        return rectA.top - rectB.top
      })

      if (sortedCards.length === 0) {
        return { columnId: targetColumnId, index: 0 }
      }

      for (let i = 0; i < sortedCards.length; i++) {
        const cardRef = sortedCards[i]
        if (!cardRef) continue

        const rect = cardRef.element.getBoundingClientRect()

        if (dragY < rect.top + rect.height / 2) {
          return { columnId: targetColumnId, index: i }
        }
      }

      return { columnId: targetColumnId, index: sortedCards.length }
    },
    [note.note.content.columns],
  )

  const calculateColumnDropIndex = useCallback(
    (dragX: number): number | null => {
      let targetIndex: number | null = null
      let closestDistance = Infinity

      const columns = note.note.content.columns
      for (let index = 0; index < columns.length; index++) {
        const column = columns[index]
        if (!column) continue
        const ref = columnRefs.current.get(column.id)
        if (!ref) continue

        const rect = ref.element.getBoundingClientRect()

        if (dragX >= rect.left && dragX <= rect.right) {
          targetIndex = dragX < rect.left + rect.width / 2 ? index : index + 1
          break
        }

        const centerX = rect.left + rect.width / 2
        const distance = Math.abs(dragX - centerX)

        if (distance < closestDistance) {
          closestDistance = distance
          targetIndex = dragX < centerX ? index : index + 1
        }
      }

      return targetIndex === null
        ? null
        : Math.max(0, Math.min(targetIndex, columns.length))
    },
    [note.note.content.columns],
  )

  useEffect(() => {
    if (!dragging) return

    const handleMove = (e: PointerEvent) => {
      draggingPosition.current = { x: e.clientX, y: e.clientY }

      if ("card" in dragging) {
        const cardDrop = calculateCardDropPosition(e.clientX, e.clientY)
        setCardDropPosition((prev) =>
          prev?.columnId === cardDrop?.columnId &&
          prev?.index === cardDrop?.index
            ? prev
            : cardDrop,
        )
        setColumnDropIndex(null)
      } else if ("column" in dragging) {
        const idx = calculateColumnDropIndex(e.clientX)
        setColumnDropIndex((p) => (p === idx ? p : idx))
        setCardDropPosition(null)
      }
    }

    const handleUp = () => {
      if (dragging && "card" in dragging && cardDropPosition !== null) {
        const { card } = dragging
        const { columnId: targetColumnId, index: targetIndex } =
          cardDropPosition

        // Find source column
        const sourceColumn = note.note.content.columns.find((c) =>
          c.cards.some((cl) => cl.id === card.id),
        )

        if (sourceColumn) {
          moveBoardCard.mutate({
            noteId: note.id,
            sourceColumnId: sourceColumn.id,
            targetColumnId,
            cardId: card.id,
            targetIndex,
          })
        }
      } else if (dragging && "column" in dragging && columnDropIndex !== null) {
        const { column } = dragging

        const sourceIndex = note.note.content.columns.findIndex(
          (c) => c.id === column.id,
        )

        if (sourceIndex !== -1) {
          // Adjust target index if it's after the source (accounting for removal of source)
          const adjustedTargetIndex =
            columnDropIndex > sourceIndex
              ? columnDropIndex - 1
              : columnDropIndex

          reorderBoardColumns.mutate({
            noteId: note.id,
            sourceIndex,
            targetIndex: adjustedTargetIndex,
          })
        }
      }

      setDragging(null)
      setCardDropPosition(null)
      setColumnDropIndex(null)

      document.body.style.cursor = "default"
    }

    document.addEventListener("pointermove", handleMove)
    document.addEventListener("pointerup", handleUp)

    return () => {
      document.removeEventListener("pointermove", handleMove)
      document.removeEventListener("pointerup", handleUp)
    }
  }, [
    dragging,
    calculateCardDropPosition,
    calculateColumnDropIndex,
    moveBoardCard,
    reorderBoardColumns,
    note,
  ])

  const ColumnDropIndicator = useMemo(
    () =>
      ({ index }: { index: number }) => (
        <DropIndicator
          key={`column-indicator-${index}`}
          orientation="vertical"
          active={columnDropIndex === index}
        />
      ),
    [columnDropIndex],
  )

  return (
    <>
      <div className="mt-[12.5dvh] flex size-full items-start justify-center overflow-hidden pb-6">
        <motion.div
          className="flex max-w-full gap-2 overflow-x-auto overflow-y-hidden p-4 select-none"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <AnimatePresence>
            {note.note.content.columns.map((column, index) => (
              <Fragment key={`column-fragment-${column.id}`}>
                <ColumnDropIndicator index={index} />

                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="my-4"
                >
                  <BoardColumn
                    column={column}
                    note={note}
                    dragging={dragging}
                    setDragging={setDragging}
                    setDraggingPosition={updateDraggingPosition}
                    onColumnRef={registerColumnRef}
                    onCardRef={registerCardRef}
                    dropIndicatorIndex={
                      cardDropPosition?.columnId === column.id
                        ? cardDropPosition.index
                        : null
                    }
                    setSheetCard={setSheetCard}
                    editingCardId={editingCardId}
                    setEditingCardId={setEditingCardId}
                  />
                </motion.div>
              </Fragment>
            ))}

            <ColumnDropIndicator index={note.note.content.columns.length} />
          </AnimatePresence>
          <motion.button
            layout
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 24,
            }}
            onClick={() => {
              addBoardColumn.mutate({
                noteId: note.id,
                id: crypto.randomUUID(),
                title: "New column",
              })
            }}
            className="mt-4 mb-4 w-11.5 shrink-0 grow cursor-pointer rounded-sm border-2 border-dashed bg-muted text-sm text-muted-foreground transition-colors [writing-mode:vertical-lr] hover:border-foreground/25 hover:bg-accent/25 hover:text-foreground focus:outline-none"
          >
            Create new column
          </motion.button>
        </motion.div>
      </div>
      <DragOverlay dragging={dragging} startingPos={draggingPosition.current} />
      <BoardDrawer
        note={note}
        card={sheetCard}
        onSaveAndClose={saveAndCloseCard}
      />
    </>
  )
}
