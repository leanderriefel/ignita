import { createTRPCRouter } from "../trpc"
import { notesRouter as notes } from "./notes"
import { providersRouter as providers } from "./providers"
import { workspacesRouter as workspaces } from "./workspaces"

export const appRouter = createTRPCRouter({
  notes,
  workspaces,
  providers,
})

export type AppRouter = typeof appRouter
