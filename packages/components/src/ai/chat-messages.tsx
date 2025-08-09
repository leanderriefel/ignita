import { memo } from "react"
import type { useChat } from "@ai-sdk/react"

import { ChatMessage } from "./chat-message"

export type ChatMessagesProps = {
  chat: ReturnType<typeof useChat>
}

export const ChatMessages = memo(({ chat }: ChatMessagesProps) => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto rounded-xl border bg-background p-4">
      {chat.messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {chat.messages.length === 0 && (
        <div className="p-4 text-xs text-muted-foreground">
          No messages yet.
        </div>
      )}
    </div>
  )
})
