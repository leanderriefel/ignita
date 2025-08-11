import { createTRPCRouter } from "../trpc"
import { chatsRouter as chats } from "./chats"
import { notesRouter as notes } from "./notes"
import { providersRouter as providers } from "./providers"
import { workspacesRouter as workspaces } from "./workspaces"

export const appRouter = createTRPCRouter({
  notes,
  workspaces,
  providers,
  chats,
})

export type AppRouter = typeof appRouter
