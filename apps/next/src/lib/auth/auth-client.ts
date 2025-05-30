import { getBaseUrl } from "@/lib/utils"
import { createAuthClient } from "better-auth/react"

export const { signIn, signUp, useSession } = createAuthClient({
  baseURL: getBaseUrl(),
})
