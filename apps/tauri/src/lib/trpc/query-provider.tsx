import { useState } from "react"
import { type QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import superjson from "superjson"

import { TRPCProvider } from "@ignita/trpc/client"
import type { AppRouter } from "@ignita/trpc/router"

import { authStore, TOKEN_KEY } from "~/lib/store/store"
import {
  asyncStoragePersister,
  createQueryClient,
} from "~/lib/trpc/query-client"

let clientQueryClientSingleton: QueryClient | undefined = undefined
export const getQueryClient = (): QueryClient => {
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
            import.meta.env.DEV ||
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: superjson,
          url: import.meta.env.DEV
            ? "http://localhost:3000/api/trpc"
            : "https://www.ignita.app/api/trpc",
          headers: async () => {
            const token = await (await authStore).get(TOKEN_KEY)
            return typeof token === "string"
              ? { authorization: `Bearer ${token}` }
              : {}
          },
        }),
      ],
    }),
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </PersistQueryClientProvider>
  )
}
