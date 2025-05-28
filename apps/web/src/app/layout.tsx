import { PostHogProvider } from "@/components/posthog-provider"
import { Loading } from "@/components/ui/loading"
import { QueryProvider } from "@/trpc/query-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Nunito } from "next/font/google"
import { Suspense } from "react"

import "./globals.css"

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased`}>
        <Suspense
          fallback={
            <div className="flex h-dvh w-dvw items-center justify-center">
              <Loading />
            </div>
          }
        >
          <SpeedInsights />
          <QueryProvider>
            <PostHogProvider>
              <ThemeProvider
                defaultTheme="system"
                attribute="class"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </PostHogProvider>
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
