import "./globals.css"

import App from "@/App"
import { QueryProvider } from "@/lib/trpc/query-provider"
import { ThemeProvider } from "@/theme-provider"
import React from "react"
import ReactDOM from "react-dom/client"

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
