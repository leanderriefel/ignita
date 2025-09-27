import { NextResponse, type NextRequest } from "next/server"
import { generateHTML } from "@tiptap/html"
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai"
import dedent from "dedent"
import { and, eq } from "drizzle-orm"
import z from "zod"

import { openrouter } from "@ignita/ai"
import { auth } from "@ignita/auth"
import {
  ChatRequestBody,
  EditNoteToolInputSchema,
} from "@ignita/components/ai/chat-utils"
import { createTextEditorExtensionsServer } from "@ignita/components/note-views/text/extensions"
import { db } from "@ignita/database"
import { chats } from "@ignita/database/schema"

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const raw = await req.json()
    const parsed = await ChatRequestBody.safeParseAsync(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.message },
        { status: 400 },
      )
    }
    const { messages, noteId, workspaceId } = parsed.data
    let { chatId } = parsed.data

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 },
      )
    }

    const workspace = await db.query.workspaces.findFirst({
      where: (table, { eq }) => eq(table.id, workspaceId),
    })
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      )
    }
    if (workspace.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ai = await db.query.ai.findFirst({
      where: (table, { eq }) => eq(table.userId, session.user.id),
      columns: { openrouterKey: true, selectedModel: true },
    })
    if (!ai?.openrouterKey) {
      return NextResponse.json(
        { error: "Provider key not found" },
        { status: 403 },
      )
    }

    try {
      if (chatId) {
        const updated = await db
          .update(chats)
          .set({ messages })
          .where(and(eq(chats.id, chatId), eq(chats.userId, session.user.id)))
          .returning({ id: chats.id })

        if (updated.length === 0) {
          await db.insert(chats).values({
            id: chatId,
            userId: session.user.id,
            messages,
          })
        }
      } else {
        const chat = await db
          .insert(chats)
          .values({
            userId: session.user.id,
            messages,
          })
          .returning({ id: chats.id })
          .then((chats) => chats[0])

        if (chat) {
          chatId = chat.id
        }
      }
    } catch {}

    let noteContent: string | null = null
    let noteName: string | null = null
    if (noteId) {
      const note = await db.query.notes.findFirst({
        where: (table, { eq, and }) =>
          and(eq(table.id, noteId), eq(table.workspaceId, workspaceId)),
      })

      if (note?.note.type === "text" && !!note.note.content.type) {
        noteContent = generateHTML(
          note.note.content,
          createTextEditorExtensionsServer(),
        )
      }

      noteName = note?.name ?? null
    }

    const selectedModel = ai?.selectedModel ?? "openai/gpt-5-mini"

    const result = streamText({
      model: openrouter(ai.openrouterKey).languageModel(selectedModel),
      messages: convertToModelMessages(messages, {
        ignoreIncompleteToolCalls: true,
      }),
      system: dedent`
        You are Ignita AI, a concise note-taking assistant designed to help users capture, structure, and act on their notes effectively.

        ## Interaction Style
        - Lead with key outcomes, avoid unnecessary fluff
        - Preserve important user phrasing and respect privacy
        - Ask clarifying question when needed; otherwise use sensible defaults
        - Flag uncertainty when present
        - Optionally end with one actionable next step if it advances progress

        ## Context
        <current-workspace>
          ${workspaceId}
        </current-workspace>
        <current-note id="${noteId ?? "none"}" name="${noteName ?? "none"}">
          ${noteContent ?? "none"}
        </current-note>

        ## Core Directives
        - Always use the provided tool calls to access workspace data
        - Be accurate and truthful - never hallucinate information
        - Provide working, correct responses at all times

        ## Core Capabilities

        **Content Processing:**
        - Summarize with TL;DR, key points, decisions, open questions and notes
        - Recall and cite specific sections from provided notes and content

        **Content Editing:**
        - Modify notes using the editNote tool. Prefer structured operations over raw replacements to keep formatting consistent.
        - Get the content of a note using the getNoteContent tool.
        - Get all notes in the current workspace using the getNotes tool.
        - Navigate to a note using the navigateToNote tool.

        ## Examples
        - Summarization: Return TL;DR, Key points, Decisions, Open questions, Notes.
        - Navigation: When asked to open or go to a note, call navigateToNote with the provided noteId and confirm.
        - Recall: When asked about past details, cite exact lines or say what is unknown.

        ## Process
        - Identify the user intent and required outcome.
        - Check available context and decide whether a tool call is needed first.
        - Ask at most one clarifying question only if essential; otherwise proceed with sensible defaults.
        - Keep reasoning internal; share only concise results and necessary citations.
        - End with one pragmatic next step if it advances progress.
        - In the end give a summary of your response if you used tools and similar.
        - You have a limit of 9999 steps. This is a hard limit. This is a lot, but still try to do what you need to do, if you fail over and over again, stop trying.

        ## Output Format
        - Use Markdown exclusively
        - Keep responses brief: 2-6 sentences or 3-8 bullets
        - Structure with headings (up to ###), bullet points ("- "), and checklists ("- [ ] ")
        - Use proper Markdown links (no bare URLs) and include tables only when absolutely necessary.
        - For math expressions: use LaTeX wrapped with $$ at start and end (never inside code blocks)

      `,
      abortSignal: req.signal,
      tools: {
        getNotes: tool({
          description: "Get all notes in the current workspace.",
          inputSchema: z.object({}).optional(),
          execute: async () => {
            const notes = await db.query.notes.findMany({
              columns: {
                id: true,
                name: true,
                parentId: true,
                position: true,
              },
              where: (table, { eq }) => eq(table.workspaceId, workspaceId),
            })
            return notes
          },
        }),
        navigateToNote: tool({
          description:
            "Navigate the user to the page of a note using a noteid (uuid).",
          inputSchema: z.object({
            noteId: z.string().describe("The id of the note to navigate to."),
          }),
        }),
        editNote: tool({
          description:
            "Apply structured edits to the current note. Supports appending, prepending, replacing, and inserting markdown or HTML content. Prefer markdown for new content unless HTML is explicitly required. Changes are applied sequentially in the order provided.",
          inputSchema: EditNoteToolInputSchema,
        }),
        getNoteContent: tool({
          description:
            "Get the content of a note using a noteid (uuid). This will be a html representation, the user inputted this using markdown.",
          inputSchema: z.object({
            noteId: z
              .string()
              .optional()
              .describe(
                "The id of the note to get the content of. If not provided, the current note will be used.",
              ),
          }),
          execute: async (input) => {
            if (!input.noteId && !noteId) {
              return {
                success: false,
                error: "No note id provided and not currently in a note",
              }
            }

            const note = await db.query.notes.findFirst({
              where: (table, { eq, and }) =>
                and(
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  eq(table.id, input.noteId ?? noteId!),
                  eq(table.workspaceId, workspaceId),
                ),
              with: {
                workspace: {
                  columns: {
                    userId: true,
                  },
                },
              },
            })

            if (!note) {
              return {
                success: false,
                error: "Note not found in current workspace",
              }
            }

            if (note?.workspace.userId !== session.user.id) {
              return {
                success: false,
                error: "Unauthorized",
              }
            }

            if (note.note.type === "text") {
              if (!!note.note.content.type) {
                return generateHTML(
                  note.note.content,
                  createTextEditorExtensionsServer(),
                )
              } else {
                return {
                  success: false,
                  error: "This note is empty.",
                }
              }
            } else {
              return {
                success: false,
                error:
                  "Note is not a text note. Support for other note types will come in the future.",
              }
            }
          },
        }),
      },
      stopWhen: stepCountIs(99999),
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async ({ messages: finishedMessages }) => {
        try {
          if (chatId) {
            const updated = await db
              .update(chats)
              .set({ messages: finishedMessages })
              .where(
                and(eq(chats.id, chatId), eq(chats.userId, session.user.id)),
              )
              .returning({ id: chats.id })

            if (updated.length === 0) {
              await db.insert(chats).values({
                id: chatId,
                userId: session.user.id,
                messages: finishedMessages,
              })
            }
          } else {
            await db.insert(chats).values({
              userId: session.user.id,
              messages: finishedMessages,
            })
          }
        } catch {
          // ignore persistence errors
        }
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          "Internal Server Error: " +
          (typeof error === "object" && error !== null && "message" in error
            ? error.message
            : JSON.stringify(error)),
      },
      { status: 500 },
    )
  }
}
