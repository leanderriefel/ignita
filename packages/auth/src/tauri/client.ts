import type { BetterFetchOption } from "@better-fetch/fetch"
import { onOpenUrl } from "@tauri-apps/plugin-deep-link"
import { openUrl } from "@tauri-apps/plugin-opener"
import type { BetterAuthClientPlugin, Store } from "better-auth"

/* ------------------------------------------------------------------ */
/* cookie helpers (unchanged from the original Expo implementation)   */
/* ------------------------------------------------------------------ */

interface CookieAttributes {
  value: string
  expires?: Date
  "max-age"?: number
  domain?: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: "Strict" | "Lax" | "None"
}

export function parseSetCookieHeader(
  header: string,
): Map<string, CookieAttributes> {
  const map = new Map<string, CookieAttributes>()
  for (const raw of header.split(", ")) {
    const [nameValue, ...attrs] = raw.split("; ")
    const [name, value] = nameValue?.split("=") ?? []

    const obj: CookieAttributes = { value: value ?? "" }
    for (const attr of attrs) {
      const [k, v] = attr.split("=")
      obj[k?.toLowerCase() as "value"] = v ?? ""
    }
    map.set(name ?? "", obj)
  }
  return map
}

interface StoredCookie {
  value: string
  expires: Date | null
}

export function getSetCookie(header: string, prev?: string) {
  const parsed = parseSetCookieHeader(header)
  let out: Record<string, StoredCookie> = {}

  parsed.forEach((cookie, key) => {
    const expAt = cookie["expires"]
    const maxAge = cookie["max-age"]
    const expires = expAt
      ? new Date(String(expAt))
      : maxAge
        ? new Date(Date.now() + Number(maxAge))
        : null

    out[key] = { value: cookie.value, expires }
  })

  if (prev) {
    try {
      out = { ...JSON.parse(prev), ...out }
    } catch {
      /* ignore */
    }
  }
  return JSON.stringify(out)
}

export function getCookie(cached: string) {
  let parsed: Record<string, StoredCookie> = {}
  try {
    parsed = JSON.parse(cached) as Record<string, StoredCookie>
  } catch {
    /* ignore */
  }
  return Object.entries(parsed).reduce((acc, [k, v]) => {
    if (v.expires && v.expires < new Date()) return acc
    return `${acc}; ${k}=${v.value}`
  }, "")
}

/* ------------------------------------------------------------------ */
/* Cookie name helpers                                                */
/* ------------------------------------------------------------------ */

function extractSessionToken(map: Map<string, CookieAttributes>) {
  for (const [name, attrs] of map) {
    if (/session[_-]?token$/i.test(name)) {
      return attrs.value
    }
  }
  return undefined
}

/* ------------------------------------------------------------------ */
/* Tauri-specific helpers                                             */
/* ------------------------------------------------------------------ */

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
    if (debugLogs) console.log("[tauriClient]", ...m)
  }

  let store: Store | null = null
  let deepLinkRegistered = false
  let cachedToken: string | null = storage.getItem(opts.storageKey)

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
          const cookie = url.searchParams.get("cookie")
          log("Extracted cookie param:", cookie)
          if (cookie) {
            const tokenMap = parseSetCookieHeader(cookie)
            log("Parsed tokenMap from cookie:", tokenMap)
            // Session cookie name is fixed by the auth server
            const token = extractSessionToken(tokenMap)
            log("Extracted session token:", token)
            if (token && token !== cachedToken) {
              log(
                "deep link token received, updating storage and notifying store",
              )
              storage.setItem(cookieKey, token)
              cachedToken = token
              store?.notify("$sessionSignal")
              opts.onSignIn?.()
              log("store notified from deep link")
            } else {
              log("No new token to update or token unchanged")
            }
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
    /* ---------------------------------------------------------- */
    /* actions                                                    */
    /* ---------------------------------------------------------- */
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

    /* ---------------------------------------------------------- */
    /* fetch-layer integration                                    */
    /* ---------------------------------------------------------- */
    fetchPlugins: [
      {
        id: "tauri",
        name: "Tauri",
        hooks: {
          async onSuccess(ctx) {
            log("onSuccess", ctx.response.status)
            const setCookie = ctx.response.headers.get("set-cookie")
            if (setCookie) {
              const tokenMap = parseSetCookieHeader(setCookie)
              const token = extractSessionToken(tokenMap) ?? null
              if (token && token !== cachedToken) {
                log("token persisted from onSuccess")
                storage.setItem(cookieKey, token)
                cachedToken = token
                store?.notify("$sessionSignal")
                opts.onSignIn?.()
              }
            }

            if (
              ctx.request.url.toString().includes("/sign-in") &&
              !ctx.request.body?.includes("idToken")
            ) {
              log("opening system browser for oauth")
              await openUrl(ctx.data.url) // hand off to system browser
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

          if (url.includes("/sign-out")) {
            log("sign-out triggered, clearing token")
            storage.setItem(cookieKey, "")
            cachedToken = ""
            store?.atoms.session?.set({
              data: null,
              error: null,
              isPending: false,
            })
            opts.onSignOut?.()
          }

          log("init complete")
          return { url, options: options as BetterFetchOption }
        },
      },
    ],
  } satisfies BetterAuthClientPlugin
}
