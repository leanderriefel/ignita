import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@nuotes/auth"

export const { GET, POST } = toNextJsHandler(auth.handler)
