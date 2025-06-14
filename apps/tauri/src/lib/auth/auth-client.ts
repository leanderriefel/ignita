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
      onSignIn: () => {
        // eslint-disable-next-line no-console
        console.log("onSuccess")
        window.location.href = "/notes"
      },
      onSignOut: () => {
        // eslint-disable-next-line no-console
        console.log("onSignOut")
        window.location.href = "/auth"
      },
      debugLogs: true,
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
