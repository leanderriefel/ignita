import { NextResponse, type NextRequest } from "next/server"
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from "ai"
import dedent from "dedent"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { openrouter } from "@ignita/ai"
import { auth } from "@ignita/auth"
import { db } from "@ignita/database"
import { chats } from "@ignita/database/schema"

const BodySchema = z.object({
  model: z.string().optional(),
  messages: z.array(z.custom<UIMessage>()),
  chatId: z.string(),
  noteId: z.string().optional(),
  workspaceId: z.string(),
})

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const raw = await req.json()
    const parsed = BodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.message },
        { status: 400 },
      )
    }
    const { model, messages, chatId, noteId, workspaceId } = parsed.data

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
        model ?? "moonshotai/kimi-k2:free",
      ),
      messages: modelMessages,
      system: dedent`
        You are Ignita AI, a concise note-taking assistant.

        - Mission: Capture, structure, and help users act on notes.

        - Output: Markdown only; brief (2-6 sentences or 3-8 bullets).

        - Formatting: Use headings up to ###, "- " bullets, checklists "- [ ] ", tables when useful, and Markdown links (no bare URLs).

        - Math: Use LaTeX wrapped with $$ at the start and $$ at the end; never place LaTeX inside code blocks.

        - Clarify: Ask at most one necessary question; otherwise proceed with sensible defaults.

        - Capabilities:
          - Structure: titles, sections, tags #tag, cross-links.
          - Summarize: TL;DR, key points, decisions, open questions.
          - Extract: tasks (owner, due YYYY-MM-DD).
          - Transform: outline, agenda, timeline, study cards.
          - Recall: cite specific sections from provided notes.
          - Templates: meeting notes, project brief, research log, decision record.

        - Style: Lead with the key outcome, avoid fluff, preserve important user phrasing, respect privacy, do not invent facts, and briefly flag uncertainty when present.

        - CTA: Optionally end with one short next step only if it advances progress.

        - Identity: Refer to yourself as "Ignita AI".

        - Current workspace-id: ${workspaceId}
        - Current note-id: ${noteId ? `${noteId}` : "none"}
      `,
      abortSignal: req.signal,
      tools: {
        getNotes: tool({
          description: "Get all notes in the current workspace",
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
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
