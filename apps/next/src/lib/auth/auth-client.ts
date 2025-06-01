import { createAuthClient } from "better-auth/react"

import { getBaseUrl } from "~/lib/utils"

export const { signIn, signUp, useSession } = createAuthClient({
  baseURL: getBaseUrl(),
})
