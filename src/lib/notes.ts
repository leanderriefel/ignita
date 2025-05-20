import { z } from "zod"

export const baseNoteSchema = z.object({
  type: z.string(),
  content: z.unknown(),
})

export const textNoteSchema = baseNoteSchema.extend({
  type: z.literal("text"),
  content: z.string(),
})

export const latexNoteSchema = baseNoteSchema.extend({
  type: z.literal("latex"),
  content: z.string(),
})

export const boardNoteSchema = baseNoteSchema.extend({
  type: z.literal("board"),
  content: z.object({
    rows: z.array(
      z.object({
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

export type BaseNote = z.infer<typeof baseNoteSchema>
export type TextNote = z.infer<typeof textNoteSchema>
export type LatexNote = z.infer<typeof latexNoteSchema>
export type BoardNote = z.infer<typeof boardNoteSchema>
export type Note = z.infer<typeof noteSchema>
