"use client"

import { useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { Store, useStore } from "@tanstack/react-store"
import { DefaultChatTransport } from "ai"
import { useNavigate, useParams } from "react-router"

import {
  useCreateChat,
  useGenerateChatTitle,
  useChat as useIgnitaChat,
  useProviderKey,
} from "@ignita/hooks"

// import { useEditorContext } from "../note-views/text/editor-context"
import { ChatDropdown } from "./chat-dropdown"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import type { ChatRequestBodyType } from "./chat-utils"

export const currentChatStore = new Store<string | null>(null)

export const Chat = () => {
  const currentChatId = useStore(currentChatStore)

  const navigate = useNavigate()
  const { workspaceId, noteId } = useParams()
  const { apiKey, isLoading: isKeyLoading } = useProviderKey("openrouter")
  // const { editor } = useEditorContext()

  const createChat = useCreateChat()
  const generateChatTitle = useGenerateChatTitle()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentChat = useIgnitaChat(currentChatId!, {
    enabled: !!currentChatId,
  })

  const chat = useChat({
    messages: currentChatId ? (currentChat.data?.messages ?? []) : [],
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) return

      switch (toolCall.toolName) {
        case "navigateToNote":
          try {
            await navigate(
              `/notes/${workspaceId}/${(toolCall.input as { noteId: string }).noteId}`,
            )

            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { success: true },
            })
          } catch {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { success: false },
            })
          }
          break
      }
    },
  })

  // Sync messages when chat data changes
  useEffect(() => {
    if (
      currentChatId &&
      currentChat.data?.messages &&
      chat.messages.length === 0
    ) {
      chat.setMessages(currentChat.data.messages)
    } else if (!currentChatId) {
      chat.setMessages([])
    }
  }, [currentChat.data?.messages, chat.setMessages, currentChatId])

  return (
    <div className="flex size-full min-h-0 flex-col gap-y-2">
      <ChatDropdown chat={chat} />
      {currentChatId && currentChat.isError ? (
        <div className="text-muted-foreground flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-2">Failed to load chat</p>
            <p className="text-sm">
              Please try selecting another chat or refresh the page
            </p>
          </div>
        </div>
      ) : (
        <ChatMessages chat={chat} />
      )}
      <ChatInput
        onSend={async (text) => {
          const message = {
            role: "user",
            parts: [{ type: "text", text }],
          } satisfies Parameters<typeof chat.sendMessage>[0]

          let chatId = currentChatId
          if (!chatId) {
            const createdChat = await createChat.mutateAsync()
            if (!createdChat) return

            chatId = createdChat.id
            currentChatStore.setState(chatId)

            generateChatTitle.mutate({
              chatId,
              input: text,
            })
          } else if (
            currentChat.status === "success" &&
            !currentChat.data?.title
          ) {
            generateChatTitle.mutate({
              chatId,
              input: JSON.stringify([...currentChat.data.messages, message]),
            })
          }

          chat.sendMessage(message, {
            body: {
              chatId,
              workspaceId,
              noteId,
            } satisfies ChatRequestBodyType,
          })
        }}
        status={chat.status}
        disabled={
          !workspaceId || (!isKeyLoading && !apiKey) || currentChat.isLoading
        }
      />
    </div>
  )
}

