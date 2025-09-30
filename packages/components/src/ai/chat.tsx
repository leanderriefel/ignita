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
import { marked } from "marked"

import {
  useCreateChat,
  useCreateNote,
  useGenerateChatTitle,
  useChat as useIgnitaChat,
  useMoveNote,
  useNote,
  useProviderKey,
} from "@ignita/hooks"
import { notesSessionStore, setNote } from "@ignita/lib"
import { defaultNote, defaultTextNote, type Note } from "@ignita/lib/notes"
import { useTRPC } from "@ignita/trpc/client"

import { useEditorContext } from "../note-views/text/editor-context"
import { createTextEditorExtensions } from "../note-views/text/extensions"
import { ChatDropdown } from "./chat-dropdown"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import type {
  ChatRequestBodyType,
  EditNoteContent,
  EditNoteOperation,
  EditNoteToolInput,
} from "./chat-utils"

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
  const createNoteMutation = useCreateNote({ optimistic: false })
  const moveNoteMutation = useMoveNote(
    { workspaceId: workspaceId ?? "" },
    { optimistic: false },
  )
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
        case "createNote": {
          const input = toolCall.input as {
            name?: string
            type?: Note["type"]
            parentId?: string | null
          }

          if (!workspaceId) {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: "Workspace not selected",
              },
            })
            break
          }

          if (!input?.name || input.name.trim().length === 0) {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: "Name is required",
              },
            })
            break
          }

          try {
            const noteType = input.type ?? "text"
            const created = await createNoteMutation.mutateAsync({
              workspaceId,
              parentId: input.parentId ?? null,
              name: input.name,
              note: defaultNote(noteType) ?? defaultTextNote,
            })

            if (created.name) {
              noteNameByIdRef.current.set(created.id, created.name)
            }

            setNote(created.id)

            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: true,
                note: created,
              },
            })
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to create note"
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: message,
              },
            })
          }
          break
        }
        case "moveNote": {
          const input = toolCall.input as {
            id?: string
            parentId?: string | null
            position?: number
          }

          if (!workspaceId) {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: "Workspace not selected",
              },
            })
            break
          }

          if (!input?.id) {
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: "Note id is required",
              },
            })
            break
          }

          try {
            const moved = await moveNoteMutation.mutateAsync({
              id: input.id,
              parentId: input.parentId ?? null,
              position: input.position,
            })

            if (moved.name) {
              noteNameByIdRef.current.set(moved.id, moved.name)
            }

            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: true,
                note: moved,
              },
            })
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Failed to move note"
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                error: message,
              },
            })
          }
          break
        }
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
        case "editNote": {
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
            const input = toolCall.input as EditNoteToolInput
            const ed = await waitForEditor()
            const currentHtml = ed.getHTML() ?? ""

            if (input.noteId && noteIdAtCall && input.noteId !== noteIdAtCall) {
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

            const result = applyOperations({
              currentHtml,
              operations: input.operations,
            })
            if (!result.success) {
              chat.addToolResult({
                tool: toolCall.toolName,
                toolCallId: toolCall.toolCallId,
                output: {
                  success: false,
                  hint: result.error,
                  noteName: noteNameAtCall ?? undefined,
                },
              })
              toolContextStore.delete(toolCall.toolCallId)
              break
            }

            const newContent = generateJSON(result.html, extensions)
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
          } catch (error) {
            // ignore; the UI will still render and allow manual retry if needed
            chat.addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              output: {
                success: false,
                hint: error instanceof Error ? error.message : "errored out",
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
        <ChatMessages
          chat={chat}
          onRetry={async () => {
            await chat.regenerate({
              body: {
                chatId: currentChatId ?? undefined,
                workspaceId: workspaceId ?? undefined,
                noteId: noteId ?? undefined,
              } satisfies ChatRequestBodyType,
            })
          }}
        />
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

type ApplyOperationsArgs = {
  currentHtml: string
  operations: EditNoteOperation[]
}

type ApplyOperationsResult =
  | { success: true; html: string }
  | { success: false; error: string }

const applyOperations = ({
  currentHtml,
  operations,
}: ApplyOperationsArgs): ApplyOperationsResult => {
  const container = document.createElement("div")
  container.innerHTML = currentHtml

  for (const operation of operations) {
    switch (operation.type) {
      case "append": {
        const html = contentToHtml(operation.content)
        container.insertAdjacentHTML("beforeend", html)
        break
      }
      case "prepend": {
        const html = contentToHtml(operation.content)
        container.insertAdjacentHTML("afterbegin", html)
        break
      }
      case "overwrite": {
        const html = contentToHtml(operation.content)
        container.innerHTML = html
        break
      }
      case "insertAfterHeading": {
        const heading = findHeading(container, operation.heading)
        if (!heading) {
          return {
            success: false,
            error: `Heading "${operation.heading}" not found`,
          }
        }
        const html = contentToHtml(operation.content)
        heading.insertAdjacentHTML("afterend", html)
        break
      }
      case "insertBeforeHeading": {
        const heading = findHeading(container, operation.heading)
        if (!heading) {
          return {
            success: false,
            error: `Heading "${operation.heading}" not found`,
          }
        }
        const html = contentToHtml(operation.content)
        heading.insertAdjacentHTML("beforebegin", html)
        break
      }
      case "insertAfterText": {
        const html = contentToHtml(operation.content)
        const inserted = insertRelativeToText({
          container,
          text: operation.text,
          html,
          position: "after",
        })
        if (!inserted) {
          return {
            success: false,
            error: `Text "${operation.text}" not found`,
          }
        }
        break
      }
      case "insertBeforeText": {
        const html = contentToHtml(operation.content)
        const inserted = insertRelativeToText({
          container,
          text: operation.text,
          html,
          position: "before",
        })
        if (!inserted) {
          return {
            success: false,
            error: `Text "${operation.text}" not found`,
          }
        }
        break
      }
      case "replace": {
        const html = contentToHtml(operation.content)
        if (operation.match.kind === "html") {
          const replaced = replaceHtml({
            container,
            targetHtml: operation.match.value,
            replacementHtml: html,
          })
          if (!replaced) {
            return {
              success: false,
              error: "HTML match not found",
            }
          }
        } else {
          const replaced = replaceText({
            container,
            targetText: operation.match.value,
            replacementHtml: html,
          })
          if (!replaced) {
            return {
              success: false,
              error: `Text "${operation.match.value}" not found`,
            }
          }
        }
        break
      }
      default:
        return { success: false, error: "Unsupported operation" }
    }
  }

  return { success: true, html: container.innerHTML }
}

const contentToHtml = (content: EditNoteContent) => {
  if (content.format === "html") {
    return content.value
  }

  const parsed = marked.parse(content.value)
  if (typeof parsed !== "string") {
    throw new Error("Markdown parsing returned async result")
  }
  return parsed
}

const findHeading = (container: HTMLElement, heading: string) => {
  const target = heading.trim().toLowerCase()
  const headings = container.querySelectorAll<HTMLElement>(
    "h1, h2, h3, h4, h5, h6",
  )
  for (const element of headings) {
    if ((element.textContent ?? "").trim().toLowerCase() === target) {
      return element
    }
  }
  return null
}

const insertRelativeToText = ({
  container,
  text,
  html,
  position,
}: {
  container: HTMLElement
  text: string
  html: string
  position: "before" | "after"
}) => {
  const match = findTextNode(container, text)
  if (!match) return false

  const range = document.createRange()
  const offset = position === "before" ? match.index : match.index + text.length
  range.setStart(match.node, offset)
  range.collapse(true)
  range.insertNode(range.createContextualFragment(html))
  return true
}

const replaceText = ({
  container,
  targetText,
  replacementHtml,
}: {
  container: HTMLElement
  targetText: string
  replacementHtml: string
}) => {
  const match = findTextNode(container, targetText)
  if (!match) return false

  const range = document.createRange()
  range.setStart(match.node, match.index)
  range.setEnd(match.node, match.index + targetText.length)
  range.deleteContents()
  range.insertNode(range.createContextualFragment(replacementHtml))
  return true
}

const replaceHtml = ({
  container,
  targetHtml,
  replacementHtml,
}: {
  container: HTMLElement
  targetHtml: string
  replacementHtml: string
}) => {
  const current = container.innerHTML
  const index = current.indexOf(targetHtml)
  if (index === -1) return false

  container.innerHTML =
    current.slice(0, index) +
    replacementHtml +
    current.slice(index + targetHtml.length)
  return true
}

const findTextNode = (container: HTMLElement, text: string) => {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)

  while (true) {
    const node = walker.nextNode() as Text | null
    if (!node) break
    const content = node.textContent ?? ""
    const index = content.indexOf(text)
    if (index !== -1) {
      return { node, index }
    }
  }

  return null
}
