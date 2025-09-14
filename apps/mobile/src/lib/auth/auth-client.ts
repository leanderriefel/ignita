import { expoClient } from "@better-auth/expo/client"
import { createAuthClient } from "better-auth/react"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"
import { NativeModules, Platform } from "react-native"

const getDevBaseURL = () => {
  const env = (globalThis as any)?.process?.env
  const envUrl = env?.EXPO_PUBLIC_API_URL || env?.EXPO_PUBLIC_BASE_URL
  if (envUrl) return envUrl

  const extra = (Constants.expoConfig as any)?.extra
  const extraUrl = extra?.EXPO_PUBLIC_API_URL || extra?.API_URL || extra?.apiUrl
  if (extraUrl) return extraUrl

  const host = Constants.expoConfig?.hostUri?.split(":")[0]
  if (host) return `http://${host}:3000`

  const sourceCode = (NativeModules as any)?.SourceCode
  const scriptURL: string | undefined = typeof sourceCode?.getConstants === "function"
    ? sourceCode.getConstants()?.scriptURL
    : sourceCode?.scriptURL || (globalThis as any)?.RN$SourceCode?.scriptURL

  if (scriptURL) {
    try {
      const { hostname } = new URL(scriptURL)
      if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
        return `http://${hostname}:3000`
      }
    } catch {}

    const match = scriptURL.match(/^https?:\/\/([^/:]+)/)
    const mHost = match?.[1]
    if (mHost && mHost !== "localhost" && mHost !== "127.0.0.1") {
      return `http://${mHost}:3000`
    }
  }

  if (Platform.OS === "android") return "http://10.0.2.2:3000"
  return "http://localhost:3000"
}

const baseURL = __DEV__ ? getDevBaseURL() : "https://www.ignita.app"

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
