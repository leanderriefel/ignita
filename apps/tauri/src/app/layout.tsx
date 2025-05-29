import { AuthProvider } from "@/lib/auth/provider"

import "./globals.css"

import { QueryProvider } from "@/lib/trpc/query-provider"
import { Loading } from "@nuotes/components"
import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Nunito } from "next/font/google"
import { Suspense } from "react"

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
          <AuthProvider>
            <QueryProvider>
              <ThemeProvider
                defaultTheme="system"
                attribute="class"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </QueryProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}

export default RootLayout
