import "./globals.css"

import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ThemeProvider } from "@ignita/components"

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Ignita",
  description: "Ignita is a modern note taking app.",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} antialiased`}>
        <ThemeProvider>
          <SpeedInsights />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
