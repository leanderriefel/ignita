import "./globals.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { ThemeProvider } from "@ignita/components"
import { PostHogProvider } from "@ignita/posthog/provider"

import App from "~/App"
import { Titlebar } from "~/components/titlebar"
import { authHooks } from "~/lib/auth/auth-client"
import { QueryProvider } from "~/lib/trpc/query-provider"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <PostHogProvider
          authHooks={authHooks}
          apiHost={
            import.meta.env.DEV
              ? "http://localhost:3000/ingest"
              : "https://ignita.app/ingest"
          }
          postHogKey={import.meta.env.VITE_POSTHOG_KEY}
        >
          <Titlebar />
          <div className="relative mt-10 h-[calc(100dvh-var(--spacing)*10)] w-dvw">
            <App />
          </div>
        </PostHogProvider>
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>,
)
