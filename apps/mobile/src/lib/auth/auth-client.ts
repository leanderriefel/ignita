import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
  baseURL: __DEV__
    ? `http://${Constants.expoConfig?.hostUri?.split(":")[0]}:3000`
    : "https://www.ignita.app",
  plugins: [
    expoClient({
      scheme: "ignita",
      storagePrefix: "ignita",
      storage: SecureStore,
    }),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
