import { notesRouter as notes } from "@/server/trpc/routers/notes"
import { workspacesRouter as workspaces } from "@/server/trpc/routers/workspaces"
import { createCallerFactory, createTRPCRouter } from "@/server/trpc/trpc"

export const appRouter = createTRPCRouter({
  workspaces,
  notes,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
