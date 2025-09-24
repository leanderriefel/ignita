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
  useNote,
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
  const { editor, docSnapshot } = useEditorContext()
  const editorRef = useRef<Editor | null>(null)
  useEffect(() => {
    editorRef.current = editor
  }, [editor])
  const noteQuery = useNote(noteId ?? "", { enabled: !!noteId })
  const extensions = useMemo(() => createTextEditorExtensions(), [])
  const appliedToolCallsRef = useRef<Set<string>>(new Set())
  const currentNoteSnapshotRef = useRef<{
    noteId: string | null
    noteName: string | null
  }>({
    noteId: docSnapshot.docId ?? noteId ?? null,
    noteName: docSnapshot.docName ?? noteQuery.data?.name ?? null,
  })
  const noteNameByIdRef = useRef(new Map<string, string>())
  const toolContextByIdRef = useRef(
    new Map<string, { noteId: string | null; noteName: string | null }>(),
  )

  useEffect(() => {
    const nextNoteId = docSnapshot.docId ?? noteId ?? null
    if (!nextNoteId) {
      currentNoteSnapshotRef.current = { noteId: null, noteName: null }
      return
    }

    const queryKey = trpc.notes.getNote.queryKey({ id: nextNoteId })
    const cached = queryClient.getQueryData(queryKey) as
      | { name?: string }
      | undefined

    if (docSnapshot.docName) {
      noteNameByIdRef.current.set(nextNoteId, docSnapshot.docName)
    } else if (noteQuery.data?.name) {
      noteNameByIdRef.current.set(nextNoteId, noteQuery.data.name)
    } else if (cached?.name) {
      noteNameByIdRef.current.set(nextNoteId, cached.name)
    }

    const knownName =
      docSnapshot.docName ??
      noteQuery.data?.name ??
      noteNameByIdRef.current.get(nextNoteId) ??
      cached?.name ??
      null

    currentNoteSnapshotRef.current = {
      noteId: nextNoteId,
      noteName: knownName,
    }
  }, [docSnapshot.docId, docSnapshot.docName, noteId, noteQuery.data?.name])

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

          const toolContextStore = toolContextByIdRef.current
          let snapshot = toolContextStore.get(toolCall.toolCallId)
          if (!snapshot) {
            snapshot = { ...currentNoteSnapshotRef.current }
            if (!snapshot.noteName && snapshot.noteId) {
              const cached = noteNameByIdRef.current.get(snapshot.noteId)
              if (cached) {
                snapshot.noteName = cached
              } else {
                const noteQueryKey = trpc.notes.getNote.queryKey({
                  id: snapshot.noteId,
                })
                const cachedNote = queryClient.getQueryData(noteQueryKey) as
                  | { name?: string }
                  | undefined
                if (cachedNote?.name) {
                  snapshot.noteName = cachedNote.name
                  noteNameByIdRef.current.set(snapshot.noteId, cachedNote.name)
                }
              }
            }
            toolContextStore.set(toolCall.toolCallId, snapshot)
          } else if (!snapshot.noteName && snapshot.noteId) {
            const cached = noteNameByIdRef.current.get(snapshot.noteId)
            if (cached) {
              snapshot.noteName = cached
            } else {
              const noteQueryKey = trpc.notes.getNote.queryKey({
                id: snapshot.noteId,
              })
              const cachedNote = queryClient.getQueryData(noteQueryKey) as
                | { name?: string }
                | undefined
              if (cachedNote?.name) {
                snapshot.noteName = cachedNote.name
                noteNameByIdRef.current.set(snapshot.noteId, cachedNote.name)
              }
            }
          }

          const noteIdAtCall = snapshot.noteId
          const noteNameAtCall = snapshot.noteName

          const currentSnapshot = currentNoteSnapshotRef.current
          if (
            noteIdAtCall &&
            currentSnapshot.noteId &&
            noteIdAtCall !== currentSnapshot.noteId
          ) {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                hint: "Note changed before AI tool finished",
                noteName: noteNameAtCall ?? undefined,
              },
            })
            toolContextStore.delete(toolCall.toolCallId)
            break
          }

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
                output: {
                  success: false,
                  hint: "Text not found",
                  noteName: noteNameAtCall,
                },
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
              output: {
                success: true,
                noteName: noteNameAtCall ?? undefined,
              },
            })
            toolContextStore.delete(toolCall.toolCallId)
          } catch {
            // ignore; the UI will still render and allow manual retry if needed
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                hint: "errored out",
                noteName: noteNameAtCall ?? undefined,
              },
            })
            toolContextStore.delete(toolCall.toolCallId)
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
