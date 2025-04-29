import "server-only" // <-- ensure this file cannot be imported from the client

import { appRouter } from "@/server/trpc/routers/root"
import { createTRPCContext } from "@/server/trpc/trpc"
import { createQueryClient } from "@/trpc/query-client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { headers } from "next/headers"
import { cache } from "react"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: async () =>
    createTRPCContext({
      headers: await headers(),
    }),
  router: appRouter,
  queryClient: getQueryClient,
})
