import type { RouterOutputs } from "@ignita/trpc"

export type Note = NonNullable<RouterOutputs["notes"]["getNotes"]>[number]

export type TreeNote = Note & { children: string[] }

export const INDENTATION_WIDTH = 24
export const ROOT_ID = "root"

export const buildTree = (
  notes: Note[] | undefined,
): Record<string, TreeNote> => {
  if (!notes)
    return {
      root: {
        id: ROOT_ID,
        name: ROOT_ID,
        children: [],
      } as unknown as TreeNote,
    }

  const items: Record<string, TreeNote> = {}
  const rootChildren: string[] = []

  // First pass: create all items
  notes.forEach((note) => {
    items[note.id] = {
      ...note,
      children: [],
    }
  })

  // Second pass: build parent-child relationships
  notes.forEach((note) => {
    if (note.parentId) {
      const parent = items[note.parentId]
      if (parent) {
        parent.children.push(note.id)
      }
    } else {
      // Top-level note
      rootChildren.push(note.id)
    }
  })

  // Sort children by position (descending as in original)
  const sortChildren = (children: string[]) => {
    children.sort((a, b) => {
      const itemA = items[a]
      const itemB = items[b]
      if (!itemA?.position || !itemB?.position) return 0
      return itemB.position - itemA.position
    })
  }

  // Sort all children arrays
  Object.values(items).forEach((item) => {
    if (item.children.length > 0) {
      sortChildren(item.children)
    }
  })

  // Sort root children
  sortChildren(rootChildren)

  // Create root item
  items.root = {
    id: "root",
    name: "Root",
    children: rootChildren,
  } as TreeNote

  return items
}
