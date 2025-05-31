import { createTRPCContext } from "@nuotes/trpc"
import { appRouter } from "@nuotes/trpc/router"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { type NextRequest } from "next/server"

const ALLOWED_ORIGINS = [
  "nuotes://",
  "http://tauri.localhost",
  "http://localhost:1420",
  "http://localhost:3000",
  "https://nuotes.vercel.app",
]

const withCors = (fn: (req: NextRequest) => Promise<Response>) => {
  return async (req: NextRequest) => {
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

    const res = await fn(req)
    if (allowed) {
      res.headers.set("Access-Control-Allow-Origin", origin)
      res.headers.set("Access-Control-Allow-Credentials", "true")
    }
    return res
  }
}

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            // eslint-disable-next-line no-console
            console.error(
              `tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            )
          }
        : undefined,
  })

export const GET = withCors(handler)
export const POST = withCors(handler)
export const OPTIONS = withCors(async () => new Response(null, { status: 204 }))
