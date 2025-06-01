import { authClient, useSession } from "@/lib/auth/auth-client"
import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react"
import { useNavigate } from "react-router"

export const BetterAuth = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const session = useSession()

  useBetterAuthTauri({
    authClient,
    scheme: "nuotes",
    debugLogs: true,
    onRequest: (href) => {
      // eslint-disable-next-line no-console
      console.log("Auth request:", href)
    },
    onSuccess: async (callbackURL) => {
      // eslint-disable-next-line no-console
      console.log("Auth successful:", callbackURL)
      await session.refetch()
      await navigate(callbackURL ?? "/notes")
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Auth error:", error)
      // Show error notification
    },
  })

  return children
}
