import "server-only"

import { appRouter } from "@/server/trpc/routers/root"
import { createTRPCContext } from "@/server/trpc/trpc"
import { createQueryClient } from "@/trpc/query-client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { cache } from "react"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
})

export const caller = appRouter.createCaller(createTRPCContext)
