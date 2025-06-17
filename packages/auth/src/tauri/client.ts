import type { BetterFetchOption } from "@better-fetch/fetch"
import { onOpenUrl } from "@tauri-apps/plugin-deep-link"
import { openUrl } from "@tauri-apps/plugin-opener"
import type { BetterAuthClientPlugin, Store } from "better-auth"

function buildDeepLink(path: string, scheme: string) {
  return path.startsWith("/") ? `${scheme}://${path.slice(1)}` : path
}
function getOrigin(scheme: string) {
  return `${scheme}://`
}

export interface TauriClientOptions {
  /** Custom URL scheme registered for deep links. */
  scheme: string
  /** Storage implementation (AsyncStorage, localStorage, etc.). */
  storage: {
    setItem(key: string, value: string): void
    getItem(key: string): string | null
    removeItem?(key: string): void
  }
  /** Key used in the provided storage to save the session token. */
  storageKey: string
  onSignIn?: () => void
  onSignOut?: () => void
  /** Enable verbose console debugging. */
  debugLogs?: boolean
}

export const tauriClient = (opts: TauriClientOptions) => {
  const cookieKey = opts.storageKey
  const { storage, scheme, debugLogs = false } = opts

  const log = (...m: unknown[]) => {
    // eslint-disable-next-line no-console
    if (debugLogs) console.log("[tauri better auth]", ...m)
  }

  let store: Store | null = null
  let deepLinkRegistered = false

  const registerDeepLinkListener = async () => {
    if (deepLinkRegistered) return
    log("registerDeepLinkListener")
    deepLinkRegistered = true

    await onOpenUrl((urls) => {
      log("onOpenUrl", urls)
      for (const raw of urls) {
        log("Processing deep link URL:", raw)
        try {
          const url = new URL(raw)
          log("Parsed URL:", url.toString())
          const token = url.searchParams.get("set-auth-token")
          log("Extracted token param:", token)
          if (token) {
            log(
              "deep link token received, updating storage and notifying store",
            )
            storage.setItem(cookieKey, token)
            store?.notify("$sessionSignal")
            opts.onSignIn?.()
            log("store notified from deep link")
          } else {
            log("No cookie param found in URL")
          }
        } catch (err) {
          log("Failed to process deep link URL:", raw, "Error:", err)
        }
      }
    })
  }

  return {
    id: "tauri",
    getActions(_, $store) {
      store = $store
      log("getActions invoked")
      registerDeepLinkListener()

      return {
        getCookie() {
          const token = storage.getItem(cookieKey)
          log("getCookie", token)
          return ""
        },
      }
    },

    fetchPlugins: [
      {
        id: "tauri",
        name: "Tauri",
        hooks: {
          async onSuccess(ctx) {
            log("onSuccess", ctx.response.status)
            const token = ctx.response.headers.get("set-auth-token")
            if (token) {
              log("token persisted from onSuccess")
              storage.setItem(cookieKey, token)
              store?.notify("$sessionSignal")
              opts.onSignIn?.()
            }

            if (
              ctx.request.url.toString().includes("/sign-in") &&
              !ctx.request.body?.includes("idToken")
            ) {
              log("opening system browser for oauth")
              await openUrl(ctx.data.url) // hand off to system browser
            }

            // Handle sign-out after the server has successfully processed the
            // request and returned the response (which clears the cookie on
            // the server side). Only then do we clear the local token and
            // reset auth state so that the request still contains the token
            // required for the server to identify the session.
            if (ctx.request.url.toString().includes("/sign-out")) {
              log("sign-out response, clearing token")
              storage.setItem(cookieKey, "")
              store?.atoms.session?.set({
                data: null,
                error: null,
                isPending: false,
              })
              opts.onSignOut?.()
            }
          },
        },

        async init(url, options) {
          options = options ?? {}
          log("init", url)

          options.credentials = "omit"
          options.headers = {
            ...options.headers,
            "tauri-origin": getOrigin(scheme),
            "x-skip-oauth-proxy": "true",
          }

          // Ensure every callback passed to the server is absolute
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const body: any = options.body
          if (body?.callbackURL?.startsWith("/"))
            body.callbackURL = buildDeepLink(body.callbackURL, scheme)
          if (body?.newUserCallbackURL?.startsWith("/"))
            body.newUserCallbackURL = buildDeepLink(
              body.newUserCallbackURL,
              scheme,
            )
          if (body?.errorCallbackURL?.startsWith("/"))
            body.errorCallbackURL = buildDeepLink(body.errorCallbackURL, scheme)

          log("init complete")
          return { url, options: options as BetterFetchOption }
        },
      },
    ],
  } satisfies BetterAuthClientPlugin
}
