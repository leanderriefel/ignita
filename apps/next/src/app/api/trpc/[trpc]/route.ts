import { type NextRequest } from "next/server"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { createTRPCContext } from "@ignita/trpc"
import { appRouter } from "@ignita/trpc/router"

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

export const GET = handler
export const POST = handler
