/* eslint-disable no-console */
import { TRPCError } from "@trpc/server"
import { and, desc, eq, isNull, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "@ignita/database"
import { notes } from "@ignita/database/schema"
import {
  MIN_NOTE_GAP,
  NEW_NOTE_POSITION,
  NOTE_GAP,
  noteSchema,
} from "@ignita/lib/notes"

import { createTRPCRouter, protectedProcedure } from "../trpc"
import { boardsRouter } from "./boards"

export const notesRouter = createTRPCRouter({
  getNote: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid note id") }))
    .query(async ({ input, ctx }) => {
      try {
        const note = await ctx.db.query.notes.findFirst({
          where: (table, { eq }) => eq(table.id, input.id),
          with: {
            workspace: true,
          },
        })

        if (!note) {
          return null
        }

        if (note.workspace.userId !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not allowed to access this note",
          })
        }

        return note
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get note (${JSON.stringify(error)})`,
        })
      }
    }),
  getNotes: protectedProcedure
    .input(z.object({ workspaceId: z.string().uuid("Invalid workspace id") }))
    .query(async ({ input, ctx }) => {
      try {
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
          .select({
            id: notes.id,
            name: notes.name,
            parentId: notes.parentId,
            position: notes.position,
            workspaceId: notes.workspaceId,
          })
          .from(notes)
          .where(sql`${notes.workspaceId} = ${input.workspaceId}`)
          .orderBy(desc(notes.position))
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to get notes (${JSON.stringify(error)})`,
        })
      }
    }),
  createNote: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(30, "Name is too long"),
        workspaceId: z.string(),
        parentId: z.string().uuid("Invalid parent id").nullable(),
        note: noteSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
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

        const newPosition = await ctx.db
          .select({ position: notes.position })
          .from(notes)
          .where(
            sql`${notes.workspaceId} = ${input.workspaceId} AND ${notes.parentId} = ${input.parentId}`,
          )
          .orderBy(desc(notes.position))
          .limit(1)
          .then((res) =>
            res[0]?.position ? res[0].position + NOTE_GAP : NEW_NOTE_POSITION,
          )

        const created = await ctx.db
          .insert(notes)
          .values({
            name: input.name,
            workspaceId: input.workspaceId,
            note: input.note,
            parentId: input.parentId,
            position: newPosition,
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

        await reorderSiblingsIfNeeded(input.workspaceId, input.parentId)

        return created
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create note (${JSON.stringify(error)})`,
        })
      }
    }),
  updateNoteName: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid note id"),
        name: z.string().min(1, "Name is required").max(30, "Name is too long"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
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
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update note (${JSON.stringify(error)})`,
        })
      }
    }),
  moveNote: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid note id"),
        parentId: z.string().uuid("Invalid parent id").nullable(),
        position: z.number().int().min(0).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
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

        const targetParentId = input.parentId ?? null

        const newPosition =
          typeof input.position === "number"
            ? input.position
            : await ctx.db
                .select({ position: notes.position })
                .from(notes)
                .where(
                  targetParentId === null
                    ? sql`${notes.workspaceId} = ${note.workspaceId} AND ${notes.parentId} IS NULL`
                    : sql`${notes.workspaceId} = ${note.workspaceId} AND ${notes.parentId} = ${targetParentId}`,
                )
                .orderBy(desc(notes.position))
                .limit(1)
                .then((res) =>
                  res[0]?.position
                    ? res[0].position + NOTE_GAP
                    : NEW_NOTE_POSITION,
                )

        const updated = await ctx.db
          .update(notes)
          .set({
            parentId: targetParentId,
            position: newPosition,
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

        await reorderSiblingsIfNeeded(note.workspaceId, targetParentId)

        return updated
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to move note (${JSON.stringify(error)})`,
        })
      }
    }),
  deleteNote: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid note id") }))
    .mutation(async ({ input, ctx }) => {
      try {
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

        const deleted = await ctx.db
          .delete(notes)
          .where(sql`${notes.id} = ${input.id}`)
          .returning()
          .then((res) => {
            const n = res[0]

            if (!n) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to delete note",
              })
            }

            return n
          })

        await reorderSiblingsIfNeeded(note.workspaceId, note.parentId)

        return deleted
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete note (${JSON.stringify(error)})`,
        })
      }
    }),
  updateNoteContent: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid note id"),
        note: noteSchema,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
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
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update note (${JSON.stringify(error)})`,
        })
      }
    }),
  boards: boardsRouter,
})

const reorderSiblingsIfNeeded = async (
  workspaceId: string,
  parentId: string | null,
) => {
  // Build condition matching siblings under the same parent
  const baseCondition = and(
    eq(notes.workspaceId, workspaceId),
    parentId ? eq(notes.parentId, parentId) : isNull(notes.parentId),
  )

  // Fetch all siblings ordered from top (highest position) to bottom
  const siblings: { id: string; position: number }[] = await db
    .select({ id: notes.id, position: notes.position })
    .from(notes)
    .where(baseCondition)
    .orderBy(desc(notes.position))

  if (siblings.length <= 1) return // nothing to reorder

  // Check if any adjacent gap is below the minimum threshold
  let needsReorder = false
  for (let i = 1; i < siblings.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const prev = siblings[i - 1]!
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const curr = siblings[i]!
    if (prev.position - curr.position < MIN_NOTE_GAP) {
      needsReorder = true
      break
    }
  }

  if (!needsReorder) return

  // Re-assign positions with a uniform NOTE_GAP spacing, starting from NEW_NOTE_POSITION downward
  await Promise.all(
    siblings.map((sibling, index) =>
      db
        .update(notes)
        .set({ position: NEW_NOTE_POSITION - index * NOTE_GAP })
        .where(sql`${notes.id} = ${sibling.id}`),
    ),
  )
}
