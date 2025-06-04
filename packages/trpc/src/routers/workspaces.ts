import { TRPCError } from "@trpc/server"
import { sql } from "drizzle-orm"
import { z } from "zod"

import { workspaces } from "@ignita/database/schema"

import { createTRPCRouter, protectedProcedure } from "../trpc"

export const workspacesRouter = createTRPCRouter({
  getWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(workspaces)
      .where(sql`${workspaces.userId} = ${ctx.session.user.id}`)
  }),
  getWorkspace: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid workspace id") }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
      })
    }),
  createWorkspace: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(20, "Name is too long"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .insert(workspaces)
        .values({ name: input.name, userId: ctx.session.user.id })
        .returning()
        .then((res) => {
          const workspace = res[0]

          if (!workspace) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create workspace",
            })
          }

          return workspace
        })
    }),
  deleteWorkspace: protectedProcedure
    .input(z.object({ id: z.string().uuid("Invalid workspace id") }))
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
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
          message: "You are not allowed to delete this workspace",
        })
      }

      return await ctx.db
        .delete(workspaces)
        .where(sql`${workspaces.id} = ${input.id}`)
        .returning()
        .then((res) => {
          const workspace = res[0]

          if (!workspace) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to delete workspace",
            })
          }

          return workspace
        })
    }),
  updateWorkspace: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid workspace id"),
        name: z.string().min(1, "Name is required").max(20, "Name is too long"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
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
          message: "You are not allowed to update this workspace",
        })
      }

      return await ctx.db
        .update(workspaces)
        .set({ name: input.name })
        .where(sql`${workspaces.id} = ${input.id}`)
        .returning()
        .then((res) => {
          const workspace = res[0]

          if (!workspace) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update workspace",
            })
          }

          return workspace
        })
    }),
})
