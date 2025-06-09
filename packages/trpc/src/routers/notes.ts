import { TRPCError } from "@trpc/server"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { notes } from "@ignita/database/schema"
import { noteSchema } from "@ignita/lib/notes"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const notesRouter = createTRPCRouter({
  getNote: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid note id") }))
    .query(async ({ input, ctx }) => {
      const note = await ctx.db.query.notes.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          workspace: true,
        },
      })

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" })
      }

      if (note.workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to access this note",
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workspace, ...noteWithoutWorkspace } = note
      return noteWithoutWorkspace
    }),
  getNotes: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid("Invalid workspace id") }))
    .query(async ({ input, ctx }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.id, input.workspaceId),
      })

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        })
      }

      if (workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to access this workspace",
        })
      }

      return ctx.db
        .select()
        .from(notes)
        .where(sql`${notes.workspaceId} = ${input.workspaceId}`)
    }),
  createNote: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(12, "Name is too long"),
        workspaceId: z.string(),
        parentPath: z.string().nullable(),
        note: noteSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.id, input.workspaceId),
      })

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        })
      }

      if (workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to create a note in this workspace",
        })
      }

      const id = crypto.randomUUID()

      return await ctx.db
        .insert(notes)
        .values({
          id,
          name: input.name,
          workspaceId: input.workspaceId,
          note: input.note,
          path: input.parentPath ? `${input.parentPath}.${id}` : `${id}`,
        })
        .returning()
        .then((res) => {
          const note = res[0]

          if (!note) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create note",
            })
          }

          return note
        })
    }),
  updateNoteName: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid note id"),
        name: z.string().min(1, "Name is required").max(12, "Name is too long"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.db.query.notes.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          workspace: true,
        },
      })

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" })
      }

      if (note.workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this note",
        })
      }

      return await ctx.db
        .update(notes)
        .set({ name: input.name })
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
        .then((res) => {
          const note = res[0]

          if (!note) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update note",
            })
          }

          return note
        })
    }),
  moveNote: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid note id"),
        parentPath: z.string().nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.db.query.notes.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          workspace: true,
        },
      })

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" })
      }

      if (note.workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to move this note",
        })
      }

      return await ctx.db
        .update(notes)
        .set({
          path: input.parentPath
            ? `${input.parentPath}.${note.id}`
            : `${note.id}`,
        })
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
        .then((res) => {
          const note = res[0]

          if (!note) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to move note",
            })
          }

          return note
        })
    }),
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid note id") }))
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.db.query.notes.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          workspace: true,
        },
      })

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" })
      }

      if (note.workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to delete this note",
        })
      }

      return await ctx.db
        .delete(notes)
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
        .then((res) => {
          const note = res[0]

          if (!note) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to delete note",
            })
          }

          return note
        })
    }),
  updateNoteContent: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid note id"),
        note: noteSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const note = await ctx.db.query.notes.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: {
          workspace: true,
        },
      })

      if (!note) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Note not found" })
      }

      if (note.workspace.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this note",
        })
      }

      return await ctx.db
        .update(notes)
        .set({ note: input.note })
        .where(sql`${notes.id} = ${input.id}`)
        .returning()
        .then((res) => {
          const note = res[0]

          if (!note) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update note",
            })
          }

          return note
        })
    }),
})
