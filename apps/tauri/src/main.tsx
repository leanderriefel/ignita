import "./globals.css"

import React from "react"
import ReactDOM from "react-dom/client"

import { ThemeProvider } from "@nuotes/components"

import App from "~/App"
import { QueryProvider } from "~/lib/trpc/query-provider"

const root = document.getElementById("root")

if (!root) {
  throw new Error("Root element not found")
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <App />
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
