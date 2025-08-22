import { memo } from "react"
import type { useChat } from "@ai-sdk/react"
import { useParams } from "react-router"

import { useProviderKey } from "@ignita/hooks"

import { Loading } from "../ui/loading"
import { ChatMessage } from "./chat-message"

export type ChatMessagesProps = {
  chat: ReturnType<typeof useChat>
}

export const ChatMessages = memo(({ chat }: ChatMessagesProps) => {
  const { workspaceId } = useParams()
  const { apiKey, isLoading: isKeyLoading } = useProviderKey()

  const missingApiKey = !isKeyLoading && !apiKey
  const missingWorkspace = !workspaceId

  if (missingApiKey) {
    return (
      <div className="bg-background flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto rounded-xl border p-4">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-xs">
          OpenRouter API key is missing. Add it in Settings (top right) → AI.
        </div>
      </div>
    )
  }

  if (missingWorkspace) {
    return (
      <div className="bg-background flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto rounded-xl border p-4">
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-lg border p-3 text-xs">
          You're not in a workspace. Open or create a workspace to chat.
        </div>
      </div>
    )
  }

  const showLoader = chat.status === "submitted"
  const showError = chat.status === "error"

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto rounded-xl border p-4">
      {chat.messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {showLoader && (
        <div className="flex w-full items-center rounded-lg border p-3">
          <Loading className="size-5" />
        </div>
      )}
      {showError && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive w-full rounded-lg border p-3">
          {`There was an error generating a response: ${chat.error?.message ?? "Unknown error"}`}
        </div>
      )}
      {chat.messages.length === 0 && !showLoader && !showError && (
        <div className="text-muted-foreground p-4 text-xs">
          No messages yet.
        </div>
      )}
    </div>
  )
})
