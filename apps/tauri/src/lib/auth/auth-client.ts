import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://nuotes.vercel.app",
})

const authHooks = createAuthHooks(authClient)

export const {
  useSession,
  usePrefetchSession,
  useToken,
  useListAccounts,
  useListSessions,
  useListDeviceSessions,
  useListPasskeys,
  useUpdateUser,
  useUnlinkAccount,
  useRevokeOtherSessions,
  useRevokeSession,
  useRevokeSessions,
  useSetActiveSession,
  useRevokeDeviceSession,
  useDeletePasskey,
  useAuthQuery,
  useAuthMutation,
} = authHooks
