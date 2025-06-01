import "server-only"

import { cache } from "react"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"

import { createTRPCContext } from "@ignita/trpc"
import { appRouter } from "@ignita/trpc/router"

import { createQueryClient } from "~/lib/trpc/query-client"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: await createTRPCContext(),
  router: appRouter,
  queryClient: getQueryClient,
})
