import type { UIMessage } from "ai"
import { z } from "zod"

export const ChatRequestBody = z.object({
  messages: z.array(z.custom<UIMessage>()),
  chatId: z.string().optional(),
  noteId: z.string().optional(),
  workspaceId: z.string().optional(),
})

export type ChatRequestBodyType = Omit<
  z.infer<typeof ChatRequestBody>,
  "messages"
>

export const NoteContentFormatSchema = z.enum(["markdown", "html"])

export const EditNoteContentSchema = z.object({
  format: NoteContentFormatSchema.describe("markdown"),
  value: z.string().min(1),
})

const EditNoteHtmlMatchSchema = z.object({
  kind: z.literal("html"),
  value: z.string(),
})

const EditNoteTextMatchSchema = z.object({
  kind: z.literal("text"),
  value: z.string(),
})

const EditNoteMatchSchema = z.union([
  EditNoteHtmlMatchSchema,
  EditNoteTextMatchSchema,
])

export const EditNoteOperationSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("append"),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("prepend"),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("overwrite"),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("insertAfterHeading"),
    heading: z.string(),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("insertBeforeHeading"),
    heading: z.string(),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("insertAfterText"),
    text: z.string(),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("insertBeforeText"),
    text: z.string(),
    content: EditNoteContentSchema,
  }),
  z.object({
    type: z.literal("replace"),
    match: EditNoteMatchSchema,
    content: EditNoteContentSchema,
  }),
])

export const EditNoteToolInputSchema = z.object({
  noteId: z.string().optional(),
  operations: z.array(EditNoteOperationSchema).min(1),
})

export type NoteContentFormat = z.infer<typeof NoteContentFormatSchema>
export type EditNoteContent = z.infer<typeof EditNoteContentSchema>
export type EditNoteMatch = z.infer<typeof EditNoteMatchSchema>
export type EditNoteOperation = z.infer<typeof EditNoteOperationSchema>
export type EditNoteToolInput = z.infer<typeof EditNoteToolInputSchema>
