import { TRPCError } from "@trpc/server"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { providerKeys } from "@ignita/database/schema"

import { createTRPCRouter, protectedProcedure } from "../trpc"

type Providers = typeof providerKeys.$inferInsert.provider
const providerSchema = z.custom<Providers>()

export const providersRouter = createTRPCRouter({
  getProviderKey: protectedProcedure
    .input(z.object({ provider: providerSchema }))
    .query(async ({ input, ctx }) => {
      try {
        const row = await ctx.db.query.providerKeys.findFirst({
          where: (table, { and, eq }) =>
            and(
              eq(table.userId, ctx.session.user.id),
              eq(table.provider, input.provider),
            ),
        })
        return row ?? null
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get provider key (${JSON.stringify(error)})`,
        })
      }
    }),

  setProviderKey: protectedProcedure
    .input(z.object({ provider: providerSchema, apiKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const created = await ctx.db
          .insert(providerKeys)
          .values({
            userId: ctx.session.user.id,
            provider: input.provider,
            apiKey: input.apiKey,
          })
          .onConflictDoUpdate({
            target: [providerKeys.userId, providerKeys.provider],
            set: { apiKey: input.apiKey },
          })

        return created[0]
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to set provider key (${JSON.stringify(error)})`,
        })
      }
    }),

  deleteProviderKey: protectedProcedure
    .input(z.object({ provider: providerSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .delete(providerKeys)
          .where(
            sql`${providerKeys.userId} = ${ctx.session.user.id} AND ${providerKeys.provider} = ${input.provider}`,
          )
        return { success: true as const }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete provider key (${JSON.stringify(error)})`,
        })
      }
    }),
})
