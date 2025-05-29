import { createTRPCRouter } from "../trpc"
import { notesRouter as notes } from "./notes"
import { workspacesRouter as workspaces } from "./workspaces"

export const appRouter = createTRPCRouter({
  notes,
  workspaces,
})

export type AppRouter = typeof appRouter
