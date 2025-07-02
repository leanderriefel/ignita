"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "motion/react"
import { createPortal } from "react-dom"
import { useParams } from "react-router"

import { useMoveNote, useNotes } from "@ignita/hooks"
import { NEW_NOTE_POSITION, NOTE_GAP } from "@ignita/lib/notes"

import { sortableTreeKeyboardCoordinates } from "./keyboardCoordinates"
import { NoteItem } from "./note-item"
import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
  type FlattenedTreeNote,
  type SensorContext,
} from "./utils"

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
}

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ]
  },
  easing: "ease-out",
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    })
  },
}

export const NotesTree = () => {
  const { workspaceId } = useParams()

  const notes = useNotes({ workspaceId: workspaceId ?? "" })
  const moveNote = useMoveNote({ workspaceId: workspaceId ?? "" })

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: string | null
    overId: string
  } | null>(null)

  const wrapper = useRef<HTMLDivElement>(null)

  // Holds IDs of notes whose children are visible (expanded). None expanded by default
  const [expanded, setExpanded] = useState<string[]>([])

  const draggedAncestors = useRef<string[]>([])

  const getAncestorIds = (item: FlattenedTreeNote | undefined): string[] => {
    const ancestors: string[] = []
    let current = item
    while (current && current.parentId) {
      ancestors.push(current.parentId)
      current = flattenedTree.find(({ id }) => id === current?.parentId)
    }
    return ancestors
  }

  const tree = useMemo(() => {
    if (!notes.data) return []
    return buildTree(notes.data)
  }, [notes.data])

  const flattenedTree = useMemo(() => {
    if (!tree.length) return []

    const flattened = flattenTree(tree)

    // Children of notes that are NOT expanded should be hidden
    const collapsedIds = flattened
      .filter((item) => !expanded.includes(item.id))
      .map((item) => item.id)

    return removeChildrenOf(
      flattened,
      activeId ? [...collapsedIds, activeId] : collapsedIds,
    )
  }, [tree, expanded, activeId])

  const projected =
    activeId && overId
      ? getProjection(flattenedTree, activeId, overId, offsetLeft)
      : null

  const sensorContext: SensorContext = useRef({
    items: flattenedTree,
    offset: offsetLeft,
  })

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, false),
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter }),
  )

  const sortedIds = useMemo(
    () => flattenedTree.map(({ id }) => id),
    [flattenedTree],
  )

  const activeItem = activeId
    ? flattenedTree.find(({ id }) => id === activeId)
    : null

  useEffect(() => {
    sensorContext.current = {
      items: flattenedTree,
      offset: offsetLeft,
    }
  }, [flattenedTree, offsetLeft])

  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement(
        "onDragMove",
        String(active.id),
        String(over?.id),
      )
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement(
        "onDragOver",
        String(active.id),
        String(over?.id),
      )
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement(
        "onDragEnd",
        String(active.id),
        String(over?.id),
      )
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`
    },
  }

  const getMovementAnnouncement = (
    eventName: string,
    activeId: string,
    overId?: string,
  ) => {
    if (overId && projected) {
      if (eventName !== "onDragEnd") {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          })
        }
      }

      const clonedItems: FlattenedTreeNote[] = JSON.parse(
        JSON.stringify(flattenTree(tree)),
      )
      const overIndex = clonedItems.findIndex(({ id }) => id === overId)
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId)
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex)

      const previousItem = sortedItems[overIndex - 1]

      let announcement: string | undefined
      const movedVerb = eventName === "onDragEnd" ? "dropped" : "moved"
      const nestedVerb = eventName === "onDragEnd" ? "dropped" : "nested"

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1]
        if (nextItem) {
          announcement = `${activeId} was ${movedVerb} before ${nextItem.id}.`
        }
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`
        } else {
          let previousSibling: FlattenedTreeNote | undefined = previousItem
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: string | null = previousSibling.parentId
            previousSibling = sortedItems.find(({ id }) => id === parentId)
          }
          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`
          }
        }
      }

      return announcement
    }

    return
  }

  const ensureExpanded = (id: string | null) => {
    if (!id) return
    setExpanded((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  const handleDragStart = ({
    active: { id: activeId },
  }: {
    active: { id: UniqueIdentifier }
  }) => {
    const activeIdStr = String(activeId)
    setActiveId(activeIdStr)
    setOverId(activeIdStr)

    const activeItem = flattenedTree.find(({ id }) => id === activeIdStr)
    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeIdStr,
      })

      ensureExpanded(activeItem.parentId)

      draggedAncestors.current = getAncestorIds(activeItem)
    }

    document.body.style.setProperty("cursor", "grabbing")
  }

  const handleDragMove = ({ delta }: { delta: { x: number; y: number } }) => {
    setOffsetLeft(delta.x)
  }

  const handleDragOver = ({
    over,
  }: {
    over: { id: UniqueIdentifier } | null
  }) => {
    const overIdStr = String(over?.id ?? null)
    setOverId(overIdStr)

    if (overIdStr) ensureExpanded(overIdStr)
  }

  const handleDragEnd = ({
    active,
    over,
  }: {
    active: { id: UniqueIdentifier }
    over: { id: UniqueIdentifier } | null
  }) => {
    resetState()

    if (projected && over) {
      const { parentId } = projected

      ensureExpanded(parentId)

      draggedAncestors.current.forEach((id) => ensureExpanded(id))

      ensureExpanded(String(active.id))

      const cloned = [...flattenedTree]
      const overIndex = cloned.findIndex(({ id }) => id === String(over.id))
      const activeIndex = cloned.findIndex(({ id }) => id === String(active.id))
      const sorted = arrayMove(cloned, activeIndex, overIndex)

      const newIndex = sorted.findIndex(({ id }) => id === String(active.id))
      const prevSibling = sorted
        .slice(0, newIndex)
        .reverse()
        .find((item) => item.parentId === parentId)
      const nextSibling = sorted
        .slice(newIndex + 1)
        .find((item) => item.parentId === parentId)

      let newPosition: number
      if (!prevSibling && !nextSibling) {
        newPosition = NEW_NOTE_POSITION
      } else if (!prevSibling) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newPosition = nextSibling!.position + NOTE_GAP
      } else if (!nextSibling) {
        newPosition = prevSibling.position - NOTE_GAP
      } else {
        newPosition = Math.floor(
          prevSibling.position -
            (prevSibling.position - nextSibling.position) / 2,
        )
      }

      void moveNote.mutate({
        id: String(active.id),
        parentId,
        position: newPosition,
      })
    }
  }

  const handleDragCancel = () => {
    resetState()
  }

  const resetState = () => {
    setOverId(null)
    setActiveId(null)
    setOffsetLeft(0)
    setCurrentPosition(null)
    document.body.style.setProperty("cursor", "")
  }

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  return (
    <motion.div
      className="flex size-full flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="scrollbar-thin h-full touch-pan-y overflow-x-hidden overflow-y-auto overscroll-x-none pt-6 pr-2 pl-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        ref={wrapper}
      >
        <DndContext
          accessibility={{ announcements }}
          sensors={sensors}
          collisionDetection={closestCenter}
          measuring={measuring}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={sortedIds}
            strategy={verticalListSortingStrategy}
          >
            {flattenedTree.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.02 }}
              >
                <NoteItem
                  note={item}
                  depth={
                    item.id === activeId && projected
                      ? projected.depth
                      : item.depth
                  }
                  expanded={
                    expanded.includes(item.id) &&
                    !(item.id === activeId && !!projected)
                  }
                  onToggleExpand={() => handleToggleExpand(item.id)}
                />
              </motion.div>
            ))}
          </SortableContext>

          {createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeId && activeItem ? (
                <NoteItem
                  note={activeItem}
                  depth={activeItem.depth}
                  expanded={false}
                  onToggleExpand={() => null}
                  overlay
                />
              ) : null}
            </DragOverlay>,
            document.body,
          )}
        </DndContext>
      </motion.div>
    </motion.div>
  )
}
