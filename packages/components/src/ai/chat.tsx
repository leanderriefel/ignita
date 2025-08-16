"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useNavigate, useParams } from "react-router"

import { useProviderKey } from "@ignita/hooks"

import { useEditorContext } from "../note-views/text/editor-context"
import type { SuggestionInput } from "../note-views/text/suggestion-mode"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import type { ChatRequestBodyType } from "./chat-utils"

export const Chat = () => {
  //const [chatId] = useLocalStorage("chatId", crypto.randomUUID())
  const [chatId] = useState(() => crypto.randomUUID())
  const navigate = useNavigate()

  const { workspaceId, noteId } = useParams()
  const { apiKey, isLoading: isKeyLoading } = useProviderKey("openrouter")
  const { editor } = useEditorContext()

  const chat = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onToolCall: async ({ toolCall }) => {
      switch (toolCall.toolName) {
        case "navigateToNote":
          await navigate(
            `/notes/${workspaceId}/${(toolCall.input as { noteId: string }).noteId}`,
          )
          return
        case "applyText": {
          if (!editor) return
          const input = toolCall.input as
            | SuggestionInput
            | { suggestions: SuggestionInput[] }
          if ("suggestions" in input) {
            editor.commands.applySuggestions(input.suggestions)
            return
          }
          editor.commands.applySuggestion(input)
          return
        }
      }
    },
  })

  return (
    <div className="flex size-full min-h-0 flex-col gap-y-2">
      <ChatMessages chat={chat} />
      <ChatInput
        onSend={(text) =>
          chat.sendMessage(
            {
              role: "user",
              parts: [{ type: "text", text }],
            },
            {
              body: {
                chatId,
                workspaceId,
                noteId,
              } satisfies ChatRequestBodyType,
            },
          )
        }
        status={chat.status}
        disabled={!workspaceId || (!isKeyLoading && !apiKey)}
      />
    </div>
  )
}
