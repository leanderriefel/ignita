"use client"

import { authClient } from "@/lib/auth/auth-client"
import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useBetterAuthTauri({
    authClient,
    scheme: "nuotes",
    debugLogs: process.env.NODE_ENV === "development",
    onRequest: (href) => {
      // eslint-disable-next-line no-console
      console.log("Auth request:", href)
    },
    onSuccess: (callbackURL) => {
      // eslint-disable-next-line no-console
      console.log("Auth successful:", callbackURL)
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Auth error:", error)
    },
  })

  return children
}
