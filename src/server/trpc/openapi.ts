import { getBaseUrl } from "@/lib/utils"
import { appRouter } from "@/server/trpc/routers/root"
import { generateOpenApiDocument } from "trpc-to-openapi"

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "nuotes api",
  version: "1.0.0",
  baseUrl: getBaseUrl() + "/api",
  filter: ({ metadata }) => metadata.openapi !== undefined,
  securitySchemes: {
    sessionCookie: {
      type: "apiKey",
      in: "cookie",
      name: "authjs.session-token",
    },
  },
})
