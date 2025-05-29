import "server-only"

import { createQueryClient } from "@/lib/trpc/query-client"
import { createTRPCContext } from "@nuotes/trpc"
import { appRouter } from "@nuotes/trpc/router"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { cache } from "react"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: await createTRPCContext(),
  router: appRouter,
  queryClient: getQueryClient,
})
