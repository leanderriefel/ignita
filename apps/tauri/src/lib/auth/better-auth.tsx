import { authClient, useSession } from "@/lib/auth/auth-client"
import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react"
import { useQueryClient } from "@tanstack/react-query"
import { Outlet, useNavigate } from "react-router"

export const BetterAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useSession()

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
      queryClient.invalidateQueries()
      session.refetch()
      navigate(callbackURL ?? "/notes")
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Auth error:", error)
      // Show error notification
    },
  })

  return <Outlet />
}
