import "./globals.css"

import { Suspense } from "react"
import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { AuthProvider, ThemeProvider, Toaster } from "@ignita/components"

import { authClient } from "~/lib/auth/auth-client"
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
          <AuthProvider client={authClient}>
            <QueryProvider>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout

