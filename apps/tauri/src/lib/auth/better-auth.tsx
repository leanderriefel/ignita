import { authClient } from "@/lib/auth/auth-client"
import { useBetterAuthTauri } from "@daveyplate/better-auth-tauri/react"
import { useNavigate } from "react-router"

export const BetterAuth = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()

  useBetterAuthTauri({
    authClient,
    scheme: "nuotes",
    debugLogs: process.env.NODE_ENV === "development",
    mainWindowLabel: "main",
    onRequest: (href) => {
      // eslint-disable-next-line no-console
      console.log("Auth request:", href)
    },
    onSuccess: (callbackURL) => {
      // eslint-disable-next-line no-console
      console.log("Auth successful:", callbackURL)
      if (callbackURL) {
        navigate(callbackURL)
      }
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error("Auth error:", error)
    },
  })

  return children
}
