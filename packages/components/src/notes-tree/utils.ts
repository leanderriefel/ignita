import type { RefObject } from "react"
import { arrayMove } from "@dnd-kit/sortable"

import type { RouterOutputs } from "@ignita/trpc"

export type Note = NonNullable<RouterOutputs["notes"]["getNotes"]>[number]
export type TreeNote = Note & { children: TreeNote[] }
export type FlattenedTreeNote = TreeNote & {
  parentId: string | null
  depth: number
  index: number
}

export const INDENTATION_WIDTH = 12

export type SensorContext = RefObject<{
  items: FlattenedTreeNote[]
  offset: number
}>

export const buildTree = (notes: Note[]): TreeNote[] => {
  const noteMap = new Map<string, TreeNote>()
  const rootNotes: TreeNote[] = []

  notes.forEach((note) => {
    noteMap.set(note.id, { ...note, children: [] })
  })

  notes.forEach((note) => {
    const parentId = note.parentId
    const node = noteMap.get(note.id)

    if (!node) return

    if (parentId) {
      const parent = noteMap.get(parentId)
      if (!parent) return
      parent.children.push(node)
    } else {
      rootNotes.push(node)
    }
  })

  const sortByPosition = (a: TreeNote, b: TreeNote) => b.position - a.position

  const sortTree = (nodes: TreeNote[]): void => {
    nodes.sort(sortByPosition)
    nodes.forEach((node) => {
      if (node.children.length) {
        sortTree(node.children)
      }
    })
  }

  sortTree(rootNotes)

  return rootNotes
}

export const flattenTree = (
  tree: TreeNote[],
  parentId: string | null = null,
  depth: number = 0,
): FlattenedTreeNote[] => {
  return tree.reduce<FlattenedTreeNote[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTree(item.children, item.id, depth + 1),
    ]
  }, [])
}

export const getProjection = (
  items: FlattenedTreeNote[],
  activeId: string,
  overId: string,
  dragOffset: number,
) => {
  const overItemIndex = items.findIndex(({ id }) => id === overId)
  const activeItemIndex = items.findIndex(({ id }) => id === activeId)
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const activeItem = items[activeItemIndex]!
  const newItems = arrayMove(items, activeItemIndex, overItemIndex)
  const previousItem = newItems[overItemIndex - 1]
  const nextItem = newItems[overItemIndex + 1]
  const dragDepth = getDragDepth(dragOffset)
  const projectedDepth = activeItem.depth + dragDepth
  const maxDepth = getMaxDepth({
    previousItem,
  })
  const minDepth = getMinDepth({ nextItem })
  let depth = projectedDepth

  if (projectedDepth >= maxDepth) {
    depth = maxDepth
  } else if (projectedDepth < minDepth) {
    depth = minDepth
  }

  const getParentId = () => {
    if (depth === 0 || !previousItem) {
      return null
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId
    }

    if (depth > previousItem.depth) {
      return previousItem.id
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId

    return newParent ?? null
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() }
}

const getMaxDepth = ({
  previousItem,
}: {
  previousItem: FlattenedTreeNote | undefined
}) => (previousItem ? previousItem.depth + 1 : 0)

const getMinDepth = ({
  nextItem,
}: {
  nextItem: FlattenedTreeNote | undefined
}) => (nextItem ? nextItem.depth : 0)

export const findItem = (items: FlattenedTreeNote[], id: string) =>
  items.find((item) => item.id === id)

export const findItemDeep = (
  items: TreeNote[],
  itemId: string,
): TreeNote | undefined => {
  for (const item of items) {
    const { id, children } = item

    if (id === itemId) return item

    if (children.length) {
      const child = findItemDeep(children, itemId)
      if (child) return child
    }
  }

  return undefined
}

export const removeItem = (items: TreeNote[], id: string): TreeNote[] => {
  const newItems: TreeNote[] = []
  for (const item of items) {
    if (item.id === id) continue

    newItems.push({
      ...item,
      children: item.children.length
        ? removeItem(item.children, id)
        : item.children,
    })
  }
  return newItems
}

export const setProperty = <T extends keyof TreeNote>(
  items: TreeNote[],
  id: string,
  property: T,
  setter: (value: TreeNote[T]) => TreeNote[T],
): TreeNote[] =>
  items.map((item) =>
    item.id === id
      ? { ...item, [property]: setter(item[property]) }
      : item.children.length
        ? {
            ...item,
            children: setProperty(item.children, id, property, setter),
          }
        : item,
  )

const countChildren = (items: TreeNote[], count = 0): number =>
  items.reduce(
    (acc, { children }) =>
      children.length ? countChildren(children, acc + 1) : acc + 1,
    count,
  )

export const getChildCount = (items: TreeNote[], id: string): number => {
  const item = findItemDeep(items, id)
  return item ? countChildren(item.children) : 0
}

export const removeChildrenOf = (
  items: FlattenedTreeNote[],
  ids: string[],
): FlattenedTreeNote[] => {
  const excludeParentIds = [...ids]

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) excludeParentIds.push(item.id)
      return false
    }
    return true
  })
}

// Calculates the indentation level based on the current horizontal drag offset
const getDragDepth = (offset: number): number =>
  Math.round(offset / INDENTATION_WIDTH)
