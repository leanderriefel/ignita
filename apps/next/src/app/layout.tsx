import "./globals.css"

import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ThemeProvider, Toaster } from "@ignita/components"

import { QueryProvider } from "~/lib/trpc/query-provider"

export const metadata: Metadata = {
  title: "Ignita",
  description: "Ignita is a modern note taking app.",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://unpkg.com/react-scan/dist/auto.global.js"
          async
          defer
        />
      </head>
      <body className="antialiased">
        <SpeedInsights />
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
