"use client"

import Link from "next/link"

import { ThemeProvider } from "@ignita/components"

import { Footer } from "~/components/footer"

const Landing = () => {
  return (
    <ThemeProvider forcedTheme="light" enableSystem={false}>
      <div>
        <div className="flex h-dvh w-dvw flex-col items-center justify-center">
          <div className="flex w-full flex-col items-center justify-center gap-4">
            <h1 className="text-center text-4xl font-medium md:text-6xl">
              Note Taking Done Easy.
            </h1>
            <h4 className="text-center text-sm text-muted-foreground">
              (Landing page in progress)
            </h4>
          </div>
          <div className="relative mt-32 flex w-full items-center justify-center gap-x-8">
            <a
              href="/notes"
              className="inline-flex h-14 w-48 items-center justify-center rounded-xl bg-rose-400 font-bold transition-all duration-300 hover:scale-102 active:scale-98"
              draggable={false}
            >
              Get Started
            </a>
            <Link
              target="_blank"
              href="https://github.com/leanderriefel/ignita"
              className="inline-flex h-14 w-48 items-center justify-center rounded-xl bg-rose-400/20 font-bold text-rose-900 transition-all duration-300 hover:scale-102 active:scale-98"
              draggable={false}
            >
              View on GitHub
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Landing
