import { TRPCError } from "@trpc/server"
import { generateText } from "ai"
import dedent from "dedent"
import { and, desc, eq } from "drizzle-orm"
import z from "zod"

import { openrouter } from "@ignita/ai"
import { ai as aiTable, chats as chatsTable } from "@ignita/database/schema"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const chatsRouter = createTRPCRouter({
  createChat: protectedProcedure.mutation(async ({ ctx }) => {
    return ctx.db
      .insert(chatsTable)
      .values({
        userId: ctx.session.user.id,
        messages: [],
      })
      .returning()
      .then((res) => res[0])
  }),
  getChats: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 100
      const offset = input.cursor ?? 0

      const chats = await ctx.db
        .select({
          id: chatsTable.id,
          title: chatsTable.title,
          createdAt: chatsTable.createdAt,
          updatedAt: chatsTable.updatedAt,
        })
        .from(chatsTable)
        .where(eq(chatsTable.userId, ctx.session.user.id))
        .orderBy(desc(chatsTable.createdAt))
        .limit(limit + 1) // Get one extra to determine if there's a next page
        .offset(offset)

      const hasNextPage = chats.length > limit
      const items = hasNextPage ? chats.slice(0, -1) : chats
      const nextCursor = hasNextPage ? offset + limit : null

      return {
        items,
        nextCursor,
      }
    }),
  getChat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const chat = await ctx.db
        .select()
        .from(chatsTable)
        .where(
          and(
            eq(chatsTable.id, input.id),
            eq(chatsTable.userId, ctx.session.user.id),
          ),
        )
        .then((res) => res[0])

      if (!chat) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return chat
    }),
  generateChatTitle: protectedProcedure
    .input(z.object({ input: z.string(), chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.input) return null

      const ai = await ctx.db
        .select({ openrouterKey: aiTable.openrouterKey })
        .from(aiTable)
        .where(eq(aiTable.userId, ctx.session.user.id))
        .then((res) => res[0])

      if (!ai?.openrouterKey) return null

      const titleResult = await generateText({
        model: openrouter(ai.openrouterKey).languageModel("openai/gpt-5-nano"),
        prompt: dedent`
          <input>
            ${input.input}
          </input>

          <instructions>
            You are generating a title for a chat for the Ignita AI interface inside the Ignita note taking app.
            Generate a concise, descriptive chat title of about 4 words (max 8).
            Respond with only the title, no other text or quotes.
          </instructions>
        `,
      })

      const rawTitle = titleResult.text.trim()
      const cleanedTitle = rawTitle.replace(/^"|"$/g, "").trim() ?? undefined

      if (!cleanedTitle) return null

      const updatedChat = await ctx.db
        .update(chatsTable)
        .set({ title: cleanedTitle })
        .where(eq(chatsTable.id, input.chatId))
        .returning()
        .then((res) => res[0])

      return updatedChat
    }),
  deleteChat: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deleted = await ctx.db
        .delete(chatsTable)
        .where(
          and(
            eq(chatsTable.id, input.id),
            eq(chatsTable.userId, ctx.session.user.id),
          ),
        )
        .returning()
        .then((res) => res[0])

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" })
      }

      return { success: true }
    }),
})
