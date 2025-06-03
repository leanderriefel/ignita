import { toNextJsHandler } from "better-auth/next-js"

import { auth } from "@ignita/auth"

const handler = toNextJsHandler(auth.handler)

const ALLOWED_ORIGINS = [
  "ignita://",
  "http://tauri.localhost",
  "http://localhost:1420",
  "http://localhost:3000",
  "https://www.ignita.app",
]

const withCors = (fn: (req: Request, ctx: unknown) => Promise<Response>) => {
  return async (req: Request, ctx: unknown) => {
    const origin = req.headers.get("origin") ?? ""
    const allowed = ALLOWED_ORIGINS.includes(origin)

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...(allowed && { "Access-Control-Allow-Origin": origin }),
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE,PATCH",
          "Access-Control-Allow-Headers":
            req.headers.get("access-control-request-headers") ?? "",
          "Access-Control-Allow-Credentials": "true",
        },
      })
    }

    const res = await fn(req, ctx)
    if (allowed) {
      res.headers.set("Access-Control-Allow-Origin", origin)
      res.headers.set("Access-Control-Allow-Credentials", "true")
    }
    return res
  }
}

export const GET = withCors(handler.GET)
export const POST = withCors(handler.POST)
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }))
