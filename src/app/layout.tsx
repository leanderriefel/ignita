import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import "./globals.css"
import { Loading } from "@/components/ui/Loading"
import { PostHogProvider } from "@/components/PostHogProvider"
import { ThemeProvider } from "next-themes"

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
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
