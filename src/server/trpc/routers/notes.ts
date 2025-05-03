import { notes } from "@/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc"
import { sql } from "drizzle-orm"
import { z } from "zod"

export const notesRouter = createTRPCRouter({
  getTopNotes: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.notes.findMany({
        where: (table, { eq, and, isNull }) =>
          and(eq(table.workspaceId, input.workspaceId), isNull(table.parentId)),
        with: {
          children: true,
        },
      })
    }),
  getNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.notes.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          children: true,
        },
      })
    }),
  getNotesByParentId: protectedProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.notes.findMany({
        where: (table, { eq }) => eq(table.parentId, input.parentId),
      })
    }),
  createNote: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        workspaceId: z.string(),
        parentId: z.string().nullish(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const parentCond = input.parentId
        ? sql`${notes.parentId} = ${input.parentId}`
        : sql`${notes.parentId} IS NULL`
      return await ctx.db
        .insert(notes)
        .values({
          name: input.name,
          workspaceId: input.workspaceId,
          parentId: input.parentId,
          position: sql`
            COALESCE(
              (SELECT MAX(position) FROM ${notes}
               WHERE ${notes.workspaceId} = ${input.workspaceId}
                 AND ${parentCond}
              ), -1
            ) + 1
          `,
        })
        .returning()
    }),
  updateNoteName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(notes)
        .set({ name: input.name })
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
    }),
  moveNote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        parentId: z.string(),
        position: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(notes)
        .set({ parentId: input.parentId, position: input.position })
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
    }),
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) =>
      ctx.db
        .delete(notes)
        .where(sql`${notes.id} = ${input.id}`)
        .returning(),
    ),
})
