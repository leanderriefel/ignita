import { getNotes } from "@/server/data/notes"
import { getWorkspaces } from "@/server/data/workspaces"
import {
  createCallerFactory,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/trpc/trpc"
import { z } from "zod"

export const appRouter = createTRPCRouter({
  getWorkspaces: protectedProcedure.query(async () => getWorkspaces()),
  getNotes: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input }) => getNotes(input.workspaceId)),
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
