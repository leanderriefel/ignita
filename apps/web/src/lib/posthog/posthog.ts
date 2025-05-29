import { PostHog } from "posthog-node"

export default function PostHogClient() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

  const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  })
  return posthogClient
}
