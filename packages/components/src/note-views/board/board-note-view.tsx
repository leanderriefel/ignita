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

import { useUpdateNoteContent } from "@ignita/hooks"

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

  const updateNoteContent = useUpdateNoteContent()

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

    if (titleChanged || contentChanged) {
      updateNoteContent.mutate({
        id: note.id,
        note: {
          type: "board",
          content: {
            columns: note.note.content.columns.map((column) =>
              column.cards.some((c) => c.id === currentCard.id)
                ? {
                    ...column,
                    cards: column.cards.map((c) =>
                      c.id === currentCard.id
                        ? { ...c, title: titleValue, content }
                        : c,
                    ),
                  }
                : column,
            ),
          },
        },
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

        // Shallow clone columns so we don't mutate the original prop reference
        const columns = note.note.content.columns.map((c) => ({ ...c }))

        // Locate source column / card
        const sourceColumnIdx = columns.findIndex((c) =>
          c.cards.some((cl) => cl.id === card.id),
        )
        if (sourceColumnIdx === -1) return

        const sourceColumn = columns[sourceColumnIdx]
        if (!sourceColumn) return

        const sourceCardIdx = sourceColumn.cards.findIndex(
          (cl) => cl.id === card.id,
        )
        const [movedCard] = sourceColumn.cards.splice(sourceCardIdx, 1)
        if (!movedCard) return

        // Destination column
        const destColumnIdx = columns.findIndex((c) => c.id === targetColumnId)
        if (destColumnIdx === -1) return
        const destColumn = columns[destColumnIdx]
        if (!destColumn) return

        // Adjust index when moving within the same column and dropping below original position
        let insertIdx = targetIndex
        if (destColumnIdx === sourceColumnIdx && insertIdx > sourceCardIdx) {
          insertIdx -= 1
        }

        destColumn.cards.splice(insertIdx, 0, movedCard)

        updateNoteContent.mutate({
          id: note.id,
          note: {
            type: "board",
            content: {
              columns,
            },
          },
        })
      } else if (dragging && "column" in dragging && columnDropIndex !== null) {
        const { column } = dragging

        const columns = [...note.note.content.columns]

        const sourceIdx = columns.findIndex((c) => c.id === column.id)
        if (sourceIdx === -1) return

        let targetIdx = columnDropIndex
        if (targetIdx > sourceIdx) targetIdx -= 1

        const [movedColumn] = columns.splice(sourceIdx, 1)
        if (!movedColumn) return
        columns.splice(targetIdx, 0, movedColumn)

        updateNoteContent.mutate({
          id: note.id,
          note: {
            type: "board",
            content: {
              columns,
            },
          },
        })
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
    updateNoteContent,
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
      <div className="mt-[7.5%] flex size-full items-start justify-center overflow-hidden pb-6">
        <motion.div
          className="flex max-w-full gap-4 overflow-x-auto p-4"
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
                  />
                </motion.div>
              </Fragment>
            ))}

            <ColumnDropIndicator index={note.note.content.columns.length} />
          </AnimatePresence>
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

