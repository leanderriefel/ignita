"use client"

import { createQueryClient } from "@/lib/trpc/query-client"
import { TRPCProvider } from "@nuotes/trpc/client"
import type { AppRouter } from "@nuotes/trpc/router"
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import { useState } from "react"
import superjson from "superjson"

let clientQueryClientSingleton: QueryClient | undefined = undefined
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient()

  return clientQueryClientSingleton
}

export function QueryProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === "development" ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: superjson,
          url:
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000/api/trpc"
              : "https://nuotes.vercel.app/api/trpc",
        }),
      ],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
