import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@ignita/auth"

export const { GET, POST } = toNextJsHandler(auth.handler)
