import type { UIMessage } from "ai"
import { z } from "zod"

export const ChatRequestBody = z.object({
  model: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()),
  chatId: z.string(),
  noteId: z.string().optional(),
  workspaceId: z.string().optional(),
})

export type ChatRequestBodyType = Omit<
  z.infer<typeof ChatRequestBody>,
  "messages"
>
