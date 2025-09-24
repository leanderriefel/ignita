import { memo } from "react"
import type { useChat } from "@ai-sdk/react"
import { useStore } from "@tanstack/react-store"
import ScrollToBottom, {
  useScrollToBottom,
  useSticky,
} from "react-scroll-to-bottom"

import { useProviderKey } from "@ignita/hooks"
import { notesSessionStore } from "@ignita/lib"

import { Button } from "../ui/button"
import { Loading } from "../ui/loading"
import { ChatMessage } from "./chat-message"

export type ChatMessagesProps = {
  chat: ReturnType<typeof useChat>
  onRetry?: () => void | Promise<void>
}

export const ChatMessages = memo(({ chat, onRetry }: ChatMessagesProps) => {
  const { workspaceId } = useStore(notesSessionStore)
  const { apiKey, isLoading: isKeyLoading } = useProviderKey()

  const missingApiKey = !isKeyLoading && !apiKey
  const missingWorkspace = !workspaceId

  if (missingApiKey) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto rounded-xl border bg-background p-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          OpenRouter API key is missing. Add it in Settings (top right) → AI.
        </div>
      </div>
    )
  }

  if (missingWorkspace) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-y-4 overflow-y-auto rounded-xl border bg-background p-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          You're not in a workspace. Open or create a workspace to chat.
        </div>
      </div>
    )
  }

  const showLoader = chat.status === "submitted"
  const showError = chat.status === "error"

  return (
    <ScrollToBottom
      className="min-h-0 flex-1 overflow-y-auto rounded-xl border bg-background"
      scrollViewClassName="flex gap-y-4 flex-col p-4"
    >
      {chat.messages.map((message, index) => (
        <ChatMessage
          key={`${message.id ?? "message"}-${index}`}
          message={message}
          chat={chat}
        />
      ))}
      {showLoader && (
        <div className="flex w-full items-center rounded-lg border p-3">
          <Loading className="size-5" />
        </div>
      )}
      {showError && (
        <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
          <span className="text-sm">
            {`There was an error generating a response: ${chat.error?.message ?? "Unknown error"}`}
          </span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await onRetry?.()
              }}
              className="shrink-0"
            >
              Retry
            </Button>
          )}
        </div>
      )}
      {chat.messages.length === 0 && !showLoader && !showError && (
        <div className="p-4 text-xs text-muted-foreground">
          No messages yet.
        </div>
      )}
      <ScrollToBottomButton />
    </ScrollToBottom>
  )
})

const ScrollToBottomButton = () => {
  const scrollToBottom = useScrollToBottom()
  const [sticky] = useSticky()

  if (sticky) return null

  return (
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => scrollToBottom()}
        className="rounded-xl text-xs"
      >
        Scroll to bottom
      </Button>
    </div>
  )
}
