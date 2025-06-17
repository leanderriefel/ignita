import type { BetterAuthPlugin } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"

export interface TauriOptions {
  /**
   * Override the incoming `origin` header with a value supplied
   * by the desktop client (see the `tauri-origin` header in the
   * client-side plugin below).
   */
  overrideOrigin?: boolean
}

export const tauri = (options?: TauriOptions) => {
  return {
    id: "tauri",
    init: (ctx) => {
      const trustedOrigins =
        process.env.NODE_ENV === "development"
          ? [...(ctx.trustedOrigins || []), "tauri://"]
          : ctx.trustedOrigins

      return { options: { trustedOrigins } }
    },

    async onRequest(request) {
      if (!options?.overrideOrigin || request.headers.get("origin")) return

      const tauriOrigin = request.headers.get("tauri-origin")
      if (!tauriOrigin) return

      const cloned = request.clone()
      cloned.headers.set("origin", tauriOrigin)
      return { request: cloned }
    },

    hooks: {
      after: [
        {
          matcher(ctx) {
            return (
              ctx.path?.startsWith("/callback") ||
              ctx.path?.startsWith("/oauth2/callback")
            )
          },
          handler: createAuthMiddleware(async (ctx) => {
            const headers = ctx.context.responseHeaders
            // eslint-disable-next-line no-console
            console.log("headers", headers)
            const location = headers?.get("location")
            if (!location || location.includes("/oauth-proxy-callback")) return

            const trustedOrigins = ctx.context.trustedOrigins.filter(
              (o) => !o.startsWith("http"),
            )
            if (!trustedOrigins.some((o) => location.startsWith(o))) return

            const authToken = headers?.get("set-auth-token")
            if (!authToken) throw new Error("Requires BetterAuth Bearer Plugin")

            const url = new URL(location)
            url.searchParams.set("set-auth-token", authToken)
            ctx.setHeader("location", url.toString())
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin
}
