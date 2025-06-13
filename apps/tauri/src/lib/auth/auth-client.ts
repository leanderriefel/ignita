import { createAuthHooks } from "@daveyplate/better-auth-tanstack"
import { createAuthClient } from "better-auth/react"

import { tauriClient } from "@ignita/auth/tauri/client"

export const authClient = createAuthClient({
  baseURL: import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://www.ignita.app",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") ?? "",
    },
  },
  plugins: [
    tauriClient({
      scheme: "ignita",
      storage: window.localStorage,
      storageKey: "bearer_token",
    }),
  ],
})

export const authHooks = createAuthHooks(authClient)

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
