import { appRouter } from "@/server/trpc/routers/root"
import { createTRPCContext } from "@/server/trpc/trpc"
import { createOpenApiFetchHandler } from "trpc-to-openapi"

const handler = (req: Request) => {
  return createOpenApiFetchHandler({
    endpoint: "/api",
    router: appRouter,
    createContext: createTRPCContext,
    req,
  })
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as OPTIONS,
  handler as HEAD,
}
