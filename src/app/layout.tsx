import type { Metadata } from "next"
import { Nunito } from "next/font/google"
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
      <body className={`${nunito.variable} antialiased`}>{children}</body>
    </html>
  )
}

export default RootLayout
