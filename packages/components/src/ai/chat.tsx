"use client"

import { useEffect, useMemo, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { useQueryClient } from "@tanstack/react-query"
import { Store, useStore } from "@tanstack/react-store"
import { generateJSON } from "@tiptap/core"
import { type Editor } from "@tiptap/react"
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai"

import {
  useCreateChat,
  useGenerateChatTitle,
  useChat as useIgnitaChat,
  useProviderKey,
} from "@ignita/hooks"
import { notesSessionStore, setNote } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { useEditorContext } from "../note-views/text/editor-context"
import { createTextEditorExtensions } from "../note-views/text/extensions"
import { ChatDropdown } from "./chat-dropdown"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import type { ChatRequestBodyType } from "./chat-utils"

export const currentChatStore = new Store<string | null>(null)

export const Chat = () => {
  const currentChatId = useStore(currentChatStore)

  const { workspaceId, noteId } = useStore(notesSessionStore)
  const { apiKey, isLoading: isKeyLoading } = useProviderKey()
  // const { editor } = useEditorContext()

  const createChat = useCreateChat()
  const generateChatTitle = useGenerateChatTitle()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const currentChat = useIgnitaChat(currentChatId!, {
    enabled: !!currentChatId,
  })

  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { editor } = useEditorContext()
  const editorRef = useRef<Editor | null>(null)
  useEffect(() => {
    editorRef.current = editor
  }, [editor])
  const extensions = useMemo(() => createTextEditorExtensions(), [])
  const appliedToolCallsRef = useRef<Set<string>>(new Set())

  const chat = useChat({
    messages: currentChatId ? (currentChat.data?.messages ?? []) : [],
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) return

      switch (toolCall.toolName) {
        case "navigateToNote":
          try {
            setNote((toolCall.input as { noteId: string }).noteId)

            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { success: true },
            })
          } catch {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { success: false, hint: "errored out" },
            })
          }
          break
        case "replaceText": {
          if (appliedToolCallsRef.current.has(toolCall.toolCallId)) break

          const waitForEditor = async () => {
            const startedAt = Date.now()
            const timeoutMs = 8000
            const intervalMs = 100
            for (;;) {
              const ed = editorRef.current
              if (ed) return ed
              if (Date.now() - startedAt > timeoutMs)
                throw new Error("Editor not ready")
              await new Promise((r) => setTimeout(r, intervalMs))
            }
          }

          try {
            const ed = await waitForEditor()
            const { text, replaceWith } = toolCall.input as {
              text: string
              replaceWith: string
            }
            const currentHtml = ed.getHTML()
            if (!currentHtml) throw new Error("No content")

            let newHtml: string | null = null
            if (currentHtml.includes(text)) {
              newHtml = currentHtml.replace(text, replaceWith)
            } else {
              const normalize = (s: string) => s.replace(/\s+/g, " ").trim()
              const normDoc = normalize(currentHtml)
              const normNeedle = normalize(text)
              const idx = normDoc.indexOf(normNeedle)
              if (idx !== -1) {
                const before = normDoc.slice(0, idx)
                const after = normDoc.slice(idx + normNeedle.length)
                newHtml = `${before}${replaceWith}${after}`
              }
            }

            if (!newHtml) {
              chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: { success: false, hint: "Text not found" },
              })
              return
            }

            const newContent = generateJSON(newHtml, extensions)
            ed.commands.startTrackingChanges()
            ed.commands.setContent(newContent)
            appliedToolCallsRef.current.add(toolCall.toolCallId)
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { success: true },
            })
          } catch {
            // ignore; the UI will still render and allow manual retry if needed
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: { success: false, hint: "errored out" },
            })
          }
          break
        }
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
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="mb-2 text-destructive">Failed to load chat</p>
            <p className="text-sm">
              Please try selecting another chat or refresh the page
            </p>
          </div>
        </div>
      ) : (
        <ChatMessages chat={chat} onRetry={chat.regenerate} />
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
            generateChatTitle.mutate(
              {
                chatId,
                input: JSON.stringify([...currentChat.data.messages, message]),
              },
              {
                onSuccess: (res, variables) => {
                  queryClient.setQueryData(
                    trpc.chats.getChat.queryKey({ id: variables.chatId }),
                    (oldData) => {
                      if (!oldData || !res?.title) return oldData

                      return {
                        ...oldData,
                        title: res.title,
                      }
                    },
                  )
                },
              },
            )
          }

          chat.sendMessage(message, {
            body: {
              chatId,
              workspaceId: workspaceId ?? undefined,
              noteId: noteId ?? undefined,
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
