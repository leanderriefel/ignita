import type { RouterOutputs } from "@ignita/trpc"

export type Note = NonNullable<RouterOutputs["notes"]["getNotes"]>[number]
export type NoteWithChildren = Note & { children: NoteWithChildren[] }

export const getParentId = (path: string) => {
  const parts = path.split(".")
  return parts.length > 1 ? parts[parts.length - 2] : null
}

export const buildTree = (notes: Note[]): NoteWithChildren[] => {
  const noteMap = new Map<string, NoteWithChildren>()
  const rootNotes: NoteWithChildren[] = []

  notes.forEach((note) => {
    noteMap.set(note.id, { ...note, children: [] })
  })

  notes.forEach((note) => {
    const parentId = getParentId(note.path)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const node = noteMap.get(note.id)!

    if (parentId) {
      const parent = noteMap.get(parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      rootNotes.push(node)
    }
  })

  return rootNotes
}
