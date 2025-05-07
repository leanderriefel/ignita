import { workspaces } from "@/server/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc/trpc"
import { sql } from "drizzle-orm"
import { z } from "zod"

export const workspacesRouter = createTRPCRouter({
  getWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select()
      .from(workspaces)
      .where(sql`${workspaces.userId} = ${ctx.session.user.id}`)
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
        .then((res) => res[0])
    }),
  deleteWorkspace: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .delete(workspaces)
        .where(sql`${workspaces.id} = ${input.id}`)
        .returning()
        .then((res) => res[0])
    }),
  updateWorkspace: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").max(20, "Name is too long"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .update(workspaces)
        .set({ name: input.name })
        .where(sql`${workspaces.id} = ${input.id}`)
        .returning()
        .then((res) => res[0])
    }),
})
