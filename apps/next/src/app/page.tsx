"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "motion/react"

import { Button, ThemeProvider } from "@ignita/components"

const Landing = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const noRedirect = searchParams.get("noRedirect") !== null

  useEffect(() => {
    if (!noRedirect) {
      const lastNotesPath = localStorage.getItem("pick-up-where-left-off")
      if (lastNotesPath && lastNotesPath !== "/notes") {
        router.replace(lastNotesPath)
      }
    }
  }, [router, noRedirect])

  return (
    <ThemeProvider forcedTheme="light" enableSystem={false}>
      <div className="">
        <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-y-2">
          <h1 className="text-center">
            <span className="text-8xl font-extrabold tracking-widest">
              note taking
            </span>
            <br />
            <span className="font-londrina text-9xl font-bold tracking-wide">
              done easy.
            </span>
          </h1>
          <motion.div
            className="relative mt-24 inline-flex h-[75px] w-[400px] items-center justify-center"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
            whileTap={{
              scale: 0.98,
              transition: { duration: 0.15 },
            }}
          >
            <Link
              href="/notes"
              className="relative z-20 flex h-full w-full items-center justify-center px-12 py-3 font-medium text-foreground select-none"
              draggable={false}
            >
              start staying organized
            </Link>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-10 -10 597 104"
              className="pointer-events-none absolute z-10 h-[75px] w-[400px]"
            >
              <g
                strokeLinecap="round"
                strokeLinejoin="round"
                transform="translate(0 0) rotate(0 288.8781314044436 42.01628765710484)"
              >
                <path
                  d="M21.01 0 C154.11 1.23, 288.39 2.27, 556.75 0 M21.01 0 C200.83 0.05, 380.05 -0.83, 556.75 0 M556.75 0 C567.58 -2.65, 574.29 4.41, 577.76 21.01 M556.75 0 C572.73 -3.33, 580.29 3.15, 577.76 21.01 M577.76 21.01 C575.11 37.42, 577.01 53.3, 577.76 63.02 M577.76 21.01 C577.63 33.15, 578.51 47.09, 577.76 63.02 M577.76 63.02 C577.92 77.12, 573.55 83.02, 556.75 84.03 M577.76 63.02 C580.42 78.12, 567.21 87.15, 556.75 84.03 M556.75 84.03 C354.28 79.22, 149.95 80.48, 21.01 84.03 M556.75 84.03 C394.77 82.53, 233.35 83.55, 21.01 84.03 M21.01 84.03 C9.36 84.39, 2.87 79.61, 0 63.02 M21.01 84.03 C4.1 83.05, -0.59 73.04, 0 63.02 M0 63.02 C2.84 52.31, -1.9 43.04, 0 21.01 M0 63.02 C-1.24 52.34, 0.52 44.85, 0 21.01 M0 21.01 C-3.89 3.77, 7.4 1.75, 21.01 0 M0 21.01 C-4.58 4.62, 9.47 -1.37, 21.01 0"
                  className="fill-none stroke-foreground stroke-2"
                />
              </g>
            </svg>
          </motion.div>
        </div>
        <div className="grid h-20 grid-cols-2 items-center border-t border-t-foreground bg-muted px-24">
          <p className="text-sm">© 2025 Leander Riefel</p>
          <div className="flex divide-x divide-foreground justify-self-end *:h-5 *:rounded-none *:px-4 *:text-xs">
            <Button variant="link" size="sm" asChild>
              <Link
                href="https://github.com/leanderriefel/ignita"
                target="_blank"
              >
                GitHub
              </Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/legal">Legal</Link>
            </Button>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default Landing

