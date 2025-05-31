import "./globals.css"

import { PostHogProvider } from "@/lib/posthog/posthog-provider"
import { QueryProvider } from "@/lib/trpc/query-provider"
import { ThemeProvider } from "@/theme-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "nuotes",
  description: "modern note-taking",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased dark`}>
        <PostHogProvider>
          <ThemeProvider>
            <SpeedInsights />
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}

export default RootLayout
