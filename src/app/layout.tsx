import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PostHogProvider } from "../components/PostHogProvider"
import { Suspense } from "react"
import "./globals.css"
import { Loading } from "@/components/ui/Loading"

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
      <body className={`${nunito.variable} antialiased`}>
        <Suspense
          fallback={
            <div className="h-dvh w-dvw flex justify-center items-center">
              <Loading />
            </div>
          }
        >
          <SpeedInsights />
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
