import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import { createTRPCRouter } from "../trpc"
import { chatsRouter as chats } from "./chats"
import { notesRouter as notes } from "./notes"
import { providersRouter as providers } from "./providers"
import { userRouter as user } from "./user"
import { workspacesRouter as workspaces } from "./workspaces"

export const appRouter = createTRPCRouter({
  notes,
  workspaces,
  providers,
  chats,
  user,
})

export type AppRouter = typeof appRouter
export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

