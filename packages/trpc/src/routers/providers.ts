import { TRPCError } from "@trpc/server"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { ai } from "@ignita/database/schema"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const providersRouter = createTRPCRouter({
  getProviderKey: protectedProcedure.query(async ({ ctx }) => {
    try {
      const row = await ctx.db.query.ai.findFirst({
        where: (table, { eq }) => eq(table.userId, ctx.session.user.id),
        columns: { openrouterKey: true },
      })
      return row ? { apiKey: row.openrouterKey } : null
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to get provider key (${JSON.stringify(error)})`,
      })
    }
  }),

  setProviderKey: protectedProcedure
    .input(z.object({ apiKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const created = await ctx.db
          .insert(ai)
          .values({
            userId: ctx.session.user.id,
            openrouterKey: input.apiKey,
          })
          .onConflictDoUpdate({
            target: [ai.userId],
            set: { openrouterKey: input.apiKey, updatedAt: new Date() },
          })
          .returning({ openrouterKey: ai.openrouterKey })

        const row = created[0]
        return { apiKey: row ? (row.openrouterKey ?? "") : "" }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to set provider key (${JSON.stringify(error)})`,
        })
      }
    }),

  deleteProviderKey: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.db
        .update(ai)
        .set({ openrouterKey: null, updatedAt: new Date() })
        .where(sql`${ai.userId} = ${ctx.session.user.id}`)
      return { success: true as const }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to delete provider key (${JSON.stringify(error)})`,
      })
    }
  }),
})

