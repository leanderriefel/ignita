import { NextResponse, type NextRequest } from "next/server"
import { convertToModelMessages, stepCountIs, streamText, tool } from "ai"
import dedent from "dedent"
import { and, eq } from "drizzle-orm"
import z from "zod"

import { openrouter } from "@ignita/ai"
import { auth } from "@ignita/auth"
import { ChatRequestBody } from "@ignita/components"
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
    const { model, messages, chatId, noteId, workspaceId } = parsed.data

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

    const keyRow = await db.query.providerKeys.findFirst({
      where: (table, { and, eq }) =>
        and(
          eq(table.userId, session.user.id),
          eq(table.provider, "openrouter"),
        ),
    })
    if (!keyRow?.apiKey) {
      return NextResponse.json(
        { error: "Provider key not found" },
        { status: 403 },
      )
    }

    const modelMessages = convertToModelMessages(messages)

    const result = streamText({
      model: openrouter(keyRow.apiKey).languageModel(
        model ?? "z-ai/glm-4.5-air:free",
      ),
      messages: modelMessages,
      system: dedent`
        You are Ignita AI, a concise note-taking assistant designed to help users capture, structure, and act on their notes effectively.

        ## Core Directives
        - Always use the provided tool calls to access workspace data
        - Be accurate and truthful - never hallucinate information
        - Provide working, correct responses at all times

        ## Output Format
        - Use Markdown exclusively
        - Keep responses brief: 2-6 sentences or 3-8 bullets
        - Structure with headings (up to ###), bullet points ("- "), and checklists ("- [ ] ")
        - Use proper Markdown links (no bare URLs) and include tables only when absolutely necessary.
        - For math expressions: use LaTeX wrapped with $$ at start and end (never inside code blocks)

        ## Core Capabilities
        **Structure & Organization:**
        - Create titles, sections, tags (#tag), and cross-links
        - Transform content into outlines, agendas, timelines, study cards

        **Content Processing:**
        - Summarize with TL;DR, key points, decisions, open questions
        - Extract actionable tasks with owner and due dates (YYYY-MM-DD format)
        - Recall and cite specific sections from provided notes

        **Templates:**
        - Meeting notes, project briefs, research logs, decision records

        ## Interaction Style
        - Lead with key outcomes, avoid unnecessary fluff
        - Preserve important user phrasing and respect privacy
        - Ask at most one clarifying question when needed; otherwise use sensible defaults
        - Flag uncertainty briefly when present
        - Optionally end with one actionable next step if it advances progress

        ## Context
        - Current workspace: ${workspaceId}
        - Current note: ${noteId ?? "none"}
      `,
      abortSignal: req.signal,
      tools: {
        getNotes: tool({
          description: "Get all notes in the current workspace.",
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
            noteId: z.string(),
          }),
        }),
      },
      stopWhen: stepCountIs(10),
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
