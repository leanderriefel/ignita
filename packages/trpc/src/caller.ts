import { appRouter } from "./routers/root"
import { createCallerFactory } from "./trpc"

export const caller = createCallerFactory(appRouter)
