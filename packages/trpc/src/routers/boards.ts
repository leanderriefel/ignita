/* eslint-disable no-console */
import { TRPCError } from "@trpc/server"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { notes } from "@ignita/database/schema"
import type { BoardNote } from "@ignita/lib/notes"

import { createTRPCRouter, protectedProcedure } from "../trpc"

const MAX_RETRIES = 3

const retryableBoardUpdate = async <T>(
  operation: () => Promise<T>,
  maxRetries = MAX_RETRIES,
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (error instanceof TRPCError && error.code === "CONFLICT") {
        // Wait a bit before retrying to reduce contention
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 10),
        )
        continue
      }
      throw error
    }
  }

  throw lastError
}

export const boardsRouter = createTRPCRouter({
  deleteCard: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        cardId: z.string().min(1, "Card ID is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Find and remove the card
          let cardFound = false
          const updatedColumns = boardNote.content.columns.map((column) => ({
            ...column,
            cards: column.cards.filter((card) => {
              if (card.id === input.cardId) {
                cardFound = true
                return false
              }
              return true
            }),
          }))

          if (!cardFound) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found",
            })
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete card (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  moveCard: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        cardId: z.string().min(1, "Card ID is required"),
        sourceColumnId: z.string().min(1, "Source column ID is required"),
        targetColumnId: z.string().min(1, "Target column ID is required"),
        targetIndex: z.number().int().min(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Find the card to move
          let cardToMove:
            | BoardNote["content"]["columns"][0]["cards"][0]
            | undefined = undefined
          const sourceColumn = boardNote.content.columns.find(
            (col) => col.id === input.sourceColumnId,
          )
          if (sourceColumn) {
            cardToMove = sourceColumn.cards.find(
              (card) => card.id === input.cardId,
            )
          }

          if (!cardToMove) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found in source column",
            })
          }

          // Create updated columns
          const updatedColumns = boardNote.content.columns.map((column) => {
            if (
              column.id === input.sourceColumnId &&
              column.id === input.targetColumnId
            ) {
              // Moving within the same column - reorder cards
              const currentIndex = column.cards.findIndex(
                (card) => card.id === input.cardId,
              )
              const newCards = column.cards.filter(
                (card) => card.id !== input.cardId,
              )

              // Adjust target index if moving after the current position
              let adjustedTargetIndex = input.targetIndex
              if (input.targetIndex > currentIndex) {
                adjustedTargetIndex = input.targetIndex - 1
              }

              newCards.splice(adjustedTargetIndex, 0, cardToMove)
              return {
                ...column,
                cards: newCards,
              }
            } else if (column.id === input.sourceColumnId) {
              // Remove card from source column
              return {
                ...column,
                cards: column.cards.filter((card) => card.id !== input.cardId),
              }
            } else if (column.id === input.targetColumnId) {
              // Add card to target column at specified index
              const newCards = [...column.cards]
              newCards.splice(input.targetIndex, 0, cardToMove)
              return {
                ...column,
                cards: newCards,
              }
            }
            return column
          })

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to move card (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  reorderColumns: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        sourceIndex: z.number().int().min(0),
        targetIndex: z.number().int().min(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Reorder columns
          const updatedColumns = [...boardNote.content.columns]
          const [movedColumn] = updatedColumns.splice(input.sourceIndex, 1)
          if (movedColumn) {
            updatedColumns.splice(input.targetIndex, 0, movedColumn)
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to reorder columns (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  updateCardTitle: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        cardId: z.string().min(1, "Card ID is required"),
        title: z.string().min(1, "Title is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Update card title
          let cardFound = false
          const updatedColumns = boardNote.content.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => {
              if (card.id === input.cardId) {
                cardFound = true
                return { ...card, title: input.title }
              }
              return card
            }),
          }))

          if (!cardFound) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found",
            })
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update card title (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  updateCardContent: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        cardId: z.string().min(1, "Card ID is required"),
        content: z.any(), // TipTap Content type
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Update card content
          let cardFound = false
          const updatedColumns = boardNote.content.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => {
              if (card.id === input.cardId) {
                cardFound = true
                return { ...card, content: input.content }
              }
              return card
            }),
          }))

          if (!cardFound) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found",
            })
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update card content (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  addCard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        noteId: z.string().uuid("Invalid note id"),
        columnId: z.string().min(1, "Column ID is required"),
        title: z.string(),
        content: z.any().optional(), // TipTap Content type
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Create new card
          const newCard = {
            id: input.id,
            title: input.title,
            content: input.content ?? "",
            tags: [],
          }

          // Add card to specified column
          let columnFound = false
          const updatedColumns = boardNote.content.columns.map((column) => {
            if (column.id === input.columnId) {
              columnFound = true
              return {
                ...column,
                cards: [...column.cards, newCard],
              }
            }
            return column
          })

          if (!columnFound) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Column not found",
            })
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to add card (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  deleteColumn: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        columnId: z.string().min(1, "Column ID is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Find and remove the column
          const columnExists = boardNote.content.columns.some(
            (col) => col.id === input.columnId,
          )

          if (!columnExists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Column not found",
            })
          }

          const updatedColumns = boardNote.content.columns.filter(
            (col) => col.id !== input.columnId,
          )

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete column (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  updateColumn: protectedProcedure
    .input(
      z.object({
        noteId: z.string().uuid("Invalid note id"),
        columnId: z.string().min(1, "Column ID is required"),
        title: z.string().min(1, "Title is required").optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Update column settings
          let columnFound = false
          const updatedColumns = boardNote.content.columns.map((column) => {
            if (column.id === input.columnId) {
              columnFound = true
              return {
                ...column,
                ...(input.title !== undefined && { title: input.title }),
                ...(input.color !== undefined && { color: input.color }),
              }
            }
            return column
          })

          if (!columnFound) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Column not found",
            })
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: updatedColumns,
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update column (${JSON.stringify(error)})`,
          })
        }
      })
    }),

  addColumn: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        noteId: z.string().uuid("Invalid note id"),
        title: z.string().min(1, "Title is required"),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return retryableBoardUpdate(async () => {
        try {
          const note = await ctx.db.query.notes.findFirst({
            where: (table, { eq }) => eq(table.id, input.noteId),
            with: { workspace: true },
          })

          if (!note) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Note not found",
            })
          }

          if (note.workspace.userId !== ctx.session.user.id) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You are not allowed to modify this note",
            })
          }

          if (note.note.type !== "board") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Note is not a board",
            })
          }

          const currentVersion = note.version
          const boardNote = note.note as BoardNote

          // Create new column
          const newColumn = {
            id: input.id,
            title: input.title,
            color: input.color ?? "#000000",
            cards: [],
          }

          const updatedNote: BoardNote = {
            ...boardNote,
            content: {
              ...boardNote.content,
              columns: [...boardNote.content.columns, newColumn],
            },
          }

          const result = await ctx.db
            .update(notes)
            .set({
              note: updatedNote,
              version: currentVersion + 1,
              updatedAt: new Date(),
            })
            .where(
              sql`${notes.id} = ${input.noteId} AND ${notes.version} = ${currentVersion}`,
            )
            .returning()

          if (result.length === 0) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Note was modified by another operation, retrying...",
            })
          }

          return result[0]
        } catch (error) {
          console.error(error)
          if (error instanceof TRPCError) throw error
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to add column (${JSON.stringify(error)})`,
          })
        }
      })
    }),
})
