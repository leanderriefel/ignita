import "./globals.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { ThemeProvider } from "@ignita/components"

import App from "~/App"
import { Titlebar } from "~/components/titlebar"
import { QueryProvider } from "~/lib/trpc/query-provider"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <Titlebar />
        <div className="relative mt-10 h-[calc(100dvh-var(--spacing)*10)] w-dvw">
          <App />
        </div>
      </ThemeProvider>
    </QueryProvider>
  </React.StrictMode>,
)
