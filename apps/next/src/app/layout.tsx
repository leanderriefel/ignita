import "./globals.css"

import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { ThemeProvider } from "@ignita/components"

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
        <ThemeProvider>
          <SpeedInsights />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
