import { getBaseUrl } from "@nuotes/lib"
import { createAuthClient } from "better-auth/react"

export const { signIn, signUp, useSession } = createAuthClient({
  baseURL: getBaseUrl(),
})
