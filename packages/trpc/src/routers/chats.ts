import { TRPCError } from "@trpc/server"
import z from "zod"

import { chats } from "@ignita/database/schema"

import { createTRPCRouter, publicProcedure } from "../trpc"

export const chatsRouter = createTRPCRouter({
  createChat: publicProcedure.mutation(async ({ ctx }) => {
    if (!ctx.session?.user.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }

    const chat = await ctx.db
      .insert(chats)
      .values({
        userId: ctx.session.user.id,
        messages: [],
      })
      .returning()

    return chat
  }),
})
