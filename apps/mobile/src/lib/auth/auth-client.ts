import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"

const getAPIBaseURL = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL
  if (envUrl) return envUrl
  const extraUrl = (Constants.expoConfig as any)?.extra?.EXPO_PUBLIC_API_URL
  if (extraUrl) return extraUrl
  throw new Error("EXPO_PUBLIC_API_URL is not set")
}

const baseURL = getAPIBaseURL()

console.log("baseURL", baseURL)

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "ignita",
      storagePrefix: "ignita",
      storage: SecureStore,
    }),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient

