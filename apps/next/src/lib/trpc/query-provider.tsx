"use client"

import { useState } from "react"
import { type QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import superjson from "superjson"

import { TRPCProvider } from "@ignita/trpc/client"
import type { AppRouter } from "@ignita/trpc/router"

import {
  createQueryClient,
  localStoragePersister,
} from "~/lib/trpc/query-client"
import { getBaseUrl } from "~/lib/utils"

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
          url: getBaseUrl() + "/api/trpc",
        }),
      ],
    }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </PersistQueryClientProvider>
  )
}
