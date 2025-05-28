import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { createQueryClient } from "@/lib/trpc/query-client"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"

import { createTRPCContext } from "@nuotes/trpc"
import { appRouter } from "@nuotes/trpc/router"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: await createTRPCContext({ headers: await headers() }),
  router: appRouter,
  queryClient: getQueryClient,
})
