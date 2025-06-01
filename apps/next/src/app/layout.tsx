import "./globals.css"

import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ThemeProvider } from "@ignita/components"

import { PostHogProvider } from "~/lib/posthog/posthog-provider"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ignita",
  description: "modern note-taking",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${nunito.variable} dark antialiased`}>
        <PostHogProvider>
          <ThemeProvider>
            <SpeedInsights />
            {children}
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}

export default RootLayout
