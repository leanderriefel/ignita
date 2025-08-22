import { type NextRequest } from "next/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

const handler = async (req: NextRequest) => {
  // Dynamic imports to avoid build-time initialization issues
  const { createTRPCContext } = await import("@ignita/trpc")
  const { appRouter } = await import("@ignita/trpc/router")

  return fetchRequestHandler({
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
}

export const GET = handler
export const POST = handler
