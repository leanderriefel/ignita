import { notes } from "@/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc"
import { sql } from "drizzle-orm"
import { z } from "zod"

export const notesRouter = createTRPCRouter({
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
    .input(
      z.object({ workspaceId: z.string(), parentId: z.string().nullable() }),
    )
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.notes.findMany({
        where: (table, { eq, and, isNull }) =>
          and(
            eq(table.workspaceId, input.workspaceId),
            input.parentId
              ? eq(table.parentId, input.parentId)
              : isNull(table.parentId),
          ),

        with: {
          children: true,
        },
      })
    }),
  createNote: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(12, "Name is too long"),
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
  updateNoteName: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").max(12, "Name is too long"),
      }),
    )
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
        parentId: z.string().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(notes)
        .set({ parentId: input.parentId })
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
