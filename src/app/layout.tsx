import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PostHogProvider } from "../components/PostHogProvider"
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
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <SpeedInsights />
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}

export default RootLayout
