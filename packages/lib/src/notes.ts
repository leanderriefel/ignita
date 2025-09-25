import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"
import type { AppState } from "@excalidraw/excalidraw/types"
import type { JSONContent } from "@tiptap/react"
import { z } from "zod"

// --- Zod Schemas ---
export const textNoteSchema = z.object({
  type: z.literal("text"),
  content: z.custom<JSONContent>(),
})

export const directoryNoteSchema = z.object({
  type: z.literal("directory"),
})

export const boardNoteSchema = z.object({
  type: z.literal("board"),
  content: z.object({
    columns: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        color: z.string().optional(),
        cards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            content: z.custom<JSONContent>(),
            tags: z.array(z.string()),
          }),
        ),
      }),
    ),
  }),
})

export const canvasNoteSchema = z.object({
  type: z.literal("canvas"),
  content: z.object({
    elements: z.array(z.custom<ExcalidrawElement>()),
    appState: z
      .custom<
        Pick<
          AppState,
          "offsetLeft" | "offsetTop" | "viewBackgroundColor" | "zoom"
        >
      >()
      .optional(),
  }),
})

export const noteSchema = z.discriminatedUnion("type", [
  textNoteSchema,
  directoryNoteSchema,
  boardNoteSchema,
  canvasNoteSchema,
])

// --- Helper ---
const defaultJSONContent: JSONContent = {
  type: "doc",
  content: [],
}

// --- Types ---
export type TextNote = z.infer<typeof textNoteSchema>
export type DirectoryNote = z.infer<typeof directoryNoteSchema>
export type BoardNote = z.infer<typeof boardNoteSchema>
export type CanvasNote = z.infer<typeof canvasNoteSchema>
export type Note = z.infer<typeof noteSchema>

// --- Note Types ---
export const noteTypes: Record<Note["type"], string> = {
  text: "Text",
  directory: "Directory",
  board: "Board",
  canvas: "Canvas",
}

// --- Default Notes ---
export const defaultTextNote: TextNote = {
  type: "text",
  content: defaultJSONContent,
}

export const defaultDirectoryNote: DirectoryNote = {
  type: "directory",
}

export const defaultBoardNote: BoardNote = {
  type: "board",
  content: {
    columns: [
      {
        id: "planned",
        title: "Planned",
        cards: [
          {
            id: "planned-note",
            title: "Planned note",
            content: defaultJSONContent,
            tags: [],
          },
        ],
        color: "#e11d48",
      },
      {
        id: "in-progress",
        title: "In Progress",
        cards: [
          {
            id: "in-progress-note",
            title: "In Progress note",
            content: defaultJSONContent,
            tags: [],
          },
        ],
        color: "#f59e0b",
      },
      {
        id: "finished",
        title: "Finished",
        cards: [
          {
            id: "finished-note",
            title: "Finished note",
            content: defaultJSONContent,
            tags: [],
          },
        ],
        color: "#10b981",
      },
    ],
  },
}

export const defaultCanvasNote: CanvasNote = {
  type: "canvas",
  content: {
    elements: [],
    appState: undefined,
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
    case "board":
      return defaultBoardNote
    case "canvas":
      return defaultCanvasNote
    default:
      return undefined
  }
}

export const NOTE_GAP = 100
export const NEW_NOTE_POSITION = 1000000
export const MIN_NOTE_GAP = 10
