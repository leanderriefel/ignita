"use client"

import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { Suspense, useEffect } from "react"

export const PostHogProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  )
}

const PostHogPageView = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog && typeof window !== "undefined") {
      let url = window.origin + pathname
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
