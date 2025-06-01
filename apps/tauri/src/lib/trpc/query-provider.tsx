"use client"

import { useEffect, useState } from "react"
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack"
import { setupBetterAuthTauri } from "@daveyplate/better-auth-tauri"
import { type QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createTRPCClient, httpBatchStreamLink, loggerLink } from "@trpc/client"
import superjson from "superjson"

import { TRPCProvider } from "@nuotes/trpc/client"
import type { AppRouter } from "@nuotes/trpc/router"

import {
  asyncStoragePersister,
  createQueryClient,
} from "~/lib/trpc/query-client"
import { authClient } from "../auth/auth-client"

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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
          },
        }),
      ],
    }),
  )

  useEffect(() => {
    const unlisten = setupBetterAuthTauri({
      authClient,
      scheme: "nuotes",
      debugLogs: process.env.NODE_ENV === "development",
      mainWindowLabel: "main",
      onRequest: (href) => {
        // eslint-disable-next-line no-console
        console.log("Auth request:", href)
      },
      onSuccess: async (callbackURL) => {
        // eslint-disable-next-line no-console
        console.log("Auth successful, callback URL:", callbackURL)
        // Handle successful authentication
        await queryClient.invalidateQueries()
        if (callbackURL) window.location.href = callbackURL
      },
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error("Auth error:", error)
        // Handle authentication error
      },
    })

    return () => unlisten?.()
  }, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <AuthQueryProvider>
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {props.children}
        </TRPCProvider>
      </AuthQueryProvider>
    </PersistQueryClientProvider>
  )
}
