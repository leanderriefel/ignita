import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"

const devHost = Constants.expoConfig?.hostUri
  ?.replace(/^exp:\/\//, "")
  .split(":")[0]
const BASE_URL = __DEV__ ? `http://${devHost}:3000` : "https://www.ignita.app"

if (__DEV__) {
  console.log("Auth baseURL:", BASE_URL)
}

export const authClient = createAuthClient({
  baseURL: BASE_URL,
  disableDefaultFetchPlugins: true,
  plugins: [
    expoClient({
      scheme: "ignita",
      storagePrefix: "ignita",
      storage: SecureStore,
    }),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient

