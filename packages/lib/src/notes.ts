import type { Content } from "@tiptap/react"
import { z } from "zod"

// --- Zod Schemas ---
export const textNoteSchema = z.object({
  type: z.literal("text"),
  content: z.custom<Content>(),
})

export const directoryNoteSchema = z.object({
  type: z.literal("directory"),
})

export const latexNoteSchema = z.object({
  type: z.literal("latex"),
  content: z.string(),
})

export const boardNoteSchema = z.object({
  type: z.literal("board"),
  content: z.object({
    rows: z.array(
      z.object({
        title: z.string(),
        cells: z.array(z.string()),
      }),
    ),
  }),
})

export const noteSchema = z.discriminatedUnion("type", [
  textNoteSchema,
  directoryNoteSchema,
  latexNoteSchema,
  boardNoteSchema,
])

// --- Types ---
export type TextNote = z.infer<typeof textNoteSchema>
export type DirectoryNote = z.infer<typeof directoryNoteSchema>
export type LatexNote = z.infer<typeof latexNoteSchema>
export type BoardNote = z.infer<typeof boardNoteSchema>
export type Note = z.infer<typeof noteSchema>

// --- Note Types ---
export const noteTypes: Record<Note["type"], string> = {
  text: "Text",
  directory: "Directory",
  latex: "LaTeX",
  board: "Board",
}

// --- Default Notes ---
export const defaultTextNote: TextNote = {
  type: "text",
  content: "",
}

export const defaultDirectoryNote: DirectoryNote = {
  type: "directory",
}

export const defaultLatexNote: LatexNote = {
  type: "latex",
  content: "",
}

export const defaultBoardNote: BoardNote = {
  type: "board",
  content: {
    rows: [
      {
        title: "Planned",
        cells: [],
      },
      {
        title: "In Progress",
        cells: [],
      },
      {
        title: "Finished",
        cells: [],
      },
    ],
  },
}

export const defaultNote = (
  type: Note["type"] | undefined,
): Note | undefined => {
  switch (type) {
    case "text":
      return defaultTextNote
    case "directory":
      return defaultDirectoryNote
    case "latex":
      return defaultLatexNote
    case "board":
      return defaultBoardNote
    default:
      return undefined
  }
}
