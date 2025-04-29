import { notes } from "@/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc"
import { sql } from "drizzle-orm"
import { z } from "zod"

export const notesRouter = createTRPCRouter({
  getNotes: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(notes)
        .where(sql`${notes.workspaceId} = ${input.workspaceId}`)
    }),
  createNote: protectedProcedure
    .input(z.object({ name: z.string(), workspaceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .insert(notes)
        .values({
          name: input.name,
          workspaceId: input.workspaceId,
        })
        .returning()
    }),
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .delete(notes)
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
    }),
})
