import { useState } from "react"
import { type QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import Constants from "expo-constants"
import superjson from "superjson"

import { TRPCProvider } from "@ignita/trpc/client"
import type { AppRouter } from "@ignita/trpc/router"

import { authClient } from "~/lib/auth/auth-client"
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
            __DEV__ ?? (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: superjson,
          url: __DEV__
            ? `http://${Constants.expoConfig?.hostUri?.split(":")[0]}:3000/api/trpc`
            : "https://www.ignita.app/api/trpc",
          headers() {
            const headers = new Map<string, string>()
            const cookies = authClient.getCookie()
            if (cookies) {
              headers.set("Cookie", cookies)
            }
            return Object.fromEntries(headers)
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
