"use client"

import { Suspense, useEffect, useRef } from "react"
import type { createAuthClient } from "better-auth/react"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useLocation, useSearchParams } from "react-router"

export const PostHogProvider = ({
  children,
  postHogKey,
  apiHost,
  authClient,
}: {
  children: React.ReactNode
  postHogKey?: string
  apiHost?: string
  authClient: ReturnType<typeof createAuthClient>
}) => {
  const session = authClient.useSession()
  const lastUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!postHogKey || !apiHost) return

    posthog.init(postHogKey, {
      api_host: apiHost,
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== "production") {
          ph.opt_out_capturing()
          ph.set_config({ disable_session_recording: true })
        }
      },
    })
  }, [])

  useEffect(() => {
    if (session.isPending || session.error !== null) return

    const userId = session.data?.user.id ?? null

    if (userId && lastUserId.current !== userId) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      posthog.identify(userId, session.data!.user)
      lastUserId.current = userId
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("[Posthog] Identified user", userId)
      }
    } else if (!userId && lastUserId.current !== null) {
      posthog.reset()
      lastUserId.current = null
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log("[Posthog] Reset user")
      }
    }
  }, [session.data?.user.id, session.isPending, session.error])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

const PostHogPageView = () => {
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog && typeof window !== "undefined") {
      let normalizedPathname = pathname

      if (pathname.startsWith("/notes/")) {
        const notesPath = pathname.substring(7)
        const pathParts = notesPath.split("/")

        if (pathParts.length > 2) {
          normalizedPathname = "/notes/[workspace]/[note]/[...rest]"
        } else if (pathParts.length === 2) {
          normalizedPathname = "/notes/[workspace]/[note]"
        } else if (pathParts.length === 1) {
          normalizedPathname = "/notes/[workspace]"
        } else {
          normalizedPathname = "/notes"
        }
      }

      let url = window.origin + normalizedPathname
      if (searchParams?.toString()) {
        url = url + "?" + searchParams.toString()
      }

      posthog.capture("$pageview", { $current_url: url })
    }
  }, [pathname, searchParams, posthog])

  return null
}

const SuspendedPostHogPageView = () => {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  )
}
