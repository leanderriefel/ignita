// filepath: d:\Coding\nuotes\src\server\trpc\routers\notes.ts
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
      return await ctx.db
        .insert(notes)
        .values({
          name: input.name,
          workspaceId: input.workspaceId,
          parentId: input.parentId,
        })
        .returning()
    }),
  updateNote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        parentId: z.string().nullish().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(notes)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.parentId !== undefined && { parentId: input.parentId }),
        })
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
