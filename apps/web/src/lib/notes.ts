import { z } from "zod"

// --- Zod Schemas ---
export const textNoteSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
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
  latexNoteSchema,
  boardNoteSchema,
])

// --- Types ---
export type TextNote = z.infer<typeof textNoteSchema>
export type LatexNote = z.infer<typeof latexNoteSchema>
export type BoardNote = z.infer<typeof boardNoteSchema>
export type Note = z.infer<typeof noteSchema>

// --- Default Notes ---
export const defaultTextNote: TextNote = {
  type: "text",
  content: "",
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
