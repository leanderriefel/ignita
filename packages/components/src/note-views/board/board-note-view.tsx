"use client"

import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion } from "motion/react"
import { createPortal } from "react-dom"

import { useUpdateNoteContent } from "@ignita/hooks"
import { cn } from "@ignita/lib"

import { Divider } from "../../ui/divider"
import type { NoteProp } from "../types"

type BoardNote = NoteProp<"board">
type Column = BoardNote["note"]["content"]["columns"][number]
type Cell = Column["cells"][number]

type ColumnRef = {
  column: Column
  element: HTMLDivElement
}

type CellRef = {
  cell: Cell
  element: HTMLDivElement
}

type Dragged = ColumnRef | CellRef | null

const DropIndicator = memo(
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
          "bg-primary rounded-md",
          orientation === "horizontal"
            ? "h-1 w-full"
            : "w-1 shrink-0 self-stretch",
        )}
      />
    )
  },
)

export const BoardNoteView = ({ note }: { note: BoardNote }) => {
  const [dragging, setDragging] = useState<Dragged>(null)
  const draggingPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const [cellDropPosition, setCellDropPosition] = useState<{
    columnId: string
    index: number
  } | null>(null)
  const [columnDropIndex, setColumnDropIndex] = useState<number | null>(null)

  const updateNoteContent = useUpdateNoteContent()

  const columnRefs = useRef<Map<string, ColumnRef>>(new Map())
  const cellRefs = useRef<Map<string, CellRef>>(new Map())

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

  const registerCellRef = useCallback(
    (cellId: string, cell: Cell, element: HTMLDivElement | null) => {
      if (element) {
        cellRefs.current.set(cellId, { cell, element })
      } else {
        const existing = cellRefs.current.get(cellId)
        if (existing && !document.contains(existing.element)) {
          cellRefs.current.delete(cellId)
        }
      }
    },
    [],
  )

  const calculateCellDropPosition = useCallback(
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

      const columnCells = Array.from(cellRefs.current.values()).filter(
        (cellRef) =>
          note.note.content.columns
            .find((column) => column.id === targetColumnId)
            ?.cells.find((cell) => cell.id === cellRef.cell.id),
      )

      const sortedCells = columnCells.sort((a, b) => {
        const rectA = a.element.getBoundingClientRect()
        const rectB = b.element.getBoundingClientRect()
        return rectA.top - rectB.top
      })

      if (sortedCells.length === 0) {
        return { columnId: targetColumnId, index: 0 }
      }

      for (let i = 0; i < sortedCells.length; i++) {
        const cellRef = sortedCells[i]
        if (!cellRef) continue

        const rect = cellRef.element.getBoundingClientRect()

        if (dragY < rect.top + rect.height / 2) {
          return { columnId: targetColumnId, index: i }
        }
      }

      return { columnId: targetColumnId, index: sortedCells.length }
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

      if ("cell" in dragging) {
        const cellDrop = calculateCellDropPosition(e.clientX, e.clientY)
        setCellDropPosition((prev) =>
          prev?.columnId === cellDrop?.columnId &&
          prev?.index === cellDrop?.index
            ? prev
            : cellDrop,
        )
        setColumnDropIndex(null)
      } else if ("column" in dragging) {
        const idx = calculateColumnDropIndex(e.clientX)
        setColumnDropIndex((p) => (p === idx ? p : idx))
        setCellDropPosition(null)
      }
    }

    const handleUp = () => {
      if (dragging && "cell" in dragging && cellDropPosition !== null) {
        const { cell } = dragging
        const { columnId: targetColumnId, index: targetIndex } =
          cellDropPosition

        // Shallow clone columns so we don't mutate the original prop reference
        const columns = note.note.content.columns.map((c) => ({ ...c }))

        // Locate source column / cell
        const sourceColumnIdx = columns.findIndex((c) =>
          c.cells.some((cl) => cl.id === cell.id),
        )
        if (sourceColumnIdx === -1) return

        const sourceColumn = columns[sourceColumnIdx]
        if (!sourceColumn) return

        const sourceCellIdx = sourceColumn.cells.findIndex(
          (cl) => cl.id === cell.id,
        )
        const [movedCell] = sourceColumn.cells.splice(sourceCellIdx, 1)
        if (!movedCell) return

        // Destination column
        const destColumnIdx = columns.findIndex((c) => c.id === targetColumnId)
        if (destColumnIdx === -1) return
        const destColumn = columns[destColumnIdx]
        if (!destColumn) return

        // Adjust index when moving within the same column and dropping below original position
        let insertIdx = targetIndex
        if (destColumnIdx === sourceColumnIdx && insertIdx > sourceCellIdx) {
          insertIdx -= 1
        }

        destColumn.cells.splice(insertIdx, 0, movedCell)

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
      setCellDropPosition(null)
      setColumnDropIndex(null)
    }

    document.addEventListener("pointermove", handleMove)
    document.addEventListener("pointerup", handleUp)

    return () => {
      document.removeEventListener("pointermove", handleMove)
      document.removeEventListener("pointerup", handleUp)
    }
  }, [
    dragging,
    calculateCellDropPosition,
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
      <div className="flex size-full items-center justify-center p-6">
        <motion.div
          className="flex min-h-112 max-w-full gap-4 overflow-x-auto p-4"
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
                    dragging={dragging}
                    setDragging={setDragging}
                    setDraggingPosition={updateDraggingPosition}
                    onColumnRef={registerColumnRef}
                    onCellRef={registerCellRef}
                    dropIndicatorIndex={
                      cellDropPosition?.columnId === column.id
                        ? cellDropPosition.index
                        : null
                    }
                  />
                </motion.div>
              </Fragment>
            ))}

            <ColumnDropIndicator index={note.note.content.columns.length} />
          </AnimatePresence>
        </motion.div>
      </div>
      <DragOverlay dragging={dragging} startingPos={draggingPosition.current} />
    </>
  )
}

const BoardColumn = memo(
  ({
    column,
    dragging,
    setDragging,
    setDraggingPosition,
    onColumnRef,
    onCellRef,
    dropIndicatorIndex,
  }: {
    column: Column
    dragging: Dragged
    setDragging: (dragging: Dragged) => void
    setDraggingPosition: (position: { x: number; y: number } | null) => void
    onColumnRef: (
      columnId: string,
      column: Column,
      element: HTMLDivElement | null,
    ) => void
    onCellRef: (
      cellId: string,
      cell: Cell,
      element: HTMLDivElement | null,
    ) => void
    dropIndicatorIndex: number | null
  }) => {
    const draggingCellId =
      dragging && "cell" in dragging ? dragging.cell.id : null

    const isDragging = draggingCellId === column.id

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
      },
      [column, setDragging, setDraggingPosition],
    )

    const CellDropIndicator = ({ index }: { index: number }) => (
      <DropIndicator
        key={`cell-indicator-${index}`}
        orientation="horizontal"
        active={dropIndicatorIndex === index}
      />
    )

    return (
      <motion.div
        ref={(element) => onColumnRef(column.id, column, element)}
        className="group bg-card flex h-full w-72 flex-col gap-3 rounded-lg border-2 p-4"
        animate={{ opacity: isDragging ? 0.35 : 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{
          borderColor: column.color
            ? `${column.color}88`
            : "hsl(var(--border) / 0.5)",
          boxShadow: column.color
            ? `0 4px 20px -4px ${column.color}66`
            : "0 4px 20px -4px hsl(var(--border) / 0.33)",
        }}
        layoutId={column.id}
      >
        <div
          className="flex cursor-move items-center justify-between"
          onPointerDown={handleDragStart}
        >
          <h4 className="text-foreground text-base font-medium">
            {column.title}
          </h4>
          <motion.div
            className="bg-accent text-accent-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {column.cells.length}
          </motion.div>
        </div>

        <Divider />

        <motion.div className="flex min-h-48 flex-col gap-y-0" layout>
          <AnimatePresence>
            {column.cells.map((cell, index) => (
              <Fragment key={`cell-fragment-${cell.id}`}>
                <CellDropIndicator index={index} />

                <motion.div
                  key={cell.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                  layout
                >
                  <BoardCell
                    cell={cell}
                    dragging={dragging}
                    setDragging={setDragging}
                    setDraggingPosition={setDraggingPosition}
                    onCellRef={onCellRef}
                  />
                </motion.div>
              </Fragment>
            ))}

            <CellDropIndicator index={column.cells.length} />
          </AnimatePresence>

          {column.cells.length === 0 && (
            <motion.div
              className="flex flex-1 items-center justify-center rounded-md border-2 border-dashed p-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-muted-foreground text-sm">No cards yet</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    )
  },
  (prev, next) => {
    return (
      prev.column === next.column &&
      prev.dragging === next.dragging &&
      prev.dropIndicatorIndex === next.dropIndicatorIndex
    )
  },
)

const BoardCell = memo(
  ({
    cell,
    dragging,
    setDragging,
    setDraggingPosition,
    onCellRef,
  }: {
    cell: Cell
    dragging: Dragged
    setDragging: (dragging: Dragged) => void
    setDraggingPosition: (position: { x: number; y: number } | null) => void
    onCellRef: (
      cellId: string,
      cell: Cell,
      element: HTMLDivElement | null,
    ) => void
  }) => {
    const isDragging =
      dragging && "cell" in dragging && dragging.cell.id === cell.id

    const handleDragStart = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
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
            cell,
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

        const noDrag = () => {}

        const upListener = () => {
          if (!dragStarted) noDrag()
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
      [cell, setDragging, setDraggingPosition],
    )

    return (
      <motion.div
        className="bg-background hover:border-foreground/25 hover:bg-accent/25 relative cursor-pointer rounded-md border p-3 transition-colors duration-150 ease-out"
        layoutId={cell.id}
        animate={{ opacity: isDragging ? 0.35 : 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        ref={(element) => onCellRef(cell.id, cell, element)}
        onPointerDown={handleDragStart}
      >
        <p className="text-foreground text-sm leading-relaxed">{cell.title}</p>
      </motion.div>
    )
  },
)

const DragOverlay = ({
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
      <div className="bg-card flex origin-top-left items-center justify-center rounded-md border px-5 py-3 text-sm font-medium">
        {"cell" in dragging ? dragging.cell.title : dragging.column.title}
      </div>
    </motion.div>,
    document.body,
  )
}

