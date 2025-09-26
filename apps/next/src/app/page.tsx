"use client"

import Link from "next/link"
import { motion } from "motion/react"

import { Button, ThemeProvider } from "@ignita/components"

const Landing = () => {
  return (
    <ThemeProvider forcedTheme="light" enableSystem={false}>
      <div className="">
        <div className="flex h-dvh w-dvw flex-col items-center justify-center gap-y-2">
          <h1 className="text-center">
            <span className="text-4xl font-extrabold tracking-widest md:text-8xl">
              note taking
            </span>
            <br />
            <span className="font-londrina text-6xl font-bold tracking-wide md:text-9xl">
              done easy.
            </span>
          </h1>
          <div className="relative mt-24 flex w-full items-center justify-center">
            <motion.div
              className="flex w-full items-center justify-center"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
              whileTap={{
                scale: 0.98,
                transition: { duration: 0.15 },
              }}
            >
              <a
                href="/notes"
                className="w-full max-w-2/3 rounded-4xl border-4 border-dashed border-foreground py-6 text-center font-bold text-foreground select-none md:w-fit md:px-24"
                draggable={false}
              >
                start staying organized
              </a>
            </motion.div>
            <svg
              viewBox="0 0 143.36294672570057 151.24241631079894"
              className="pointer-events-none absolute hidden size-32 translate-x-72 -translate-y-20 md:block"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g strokeLinecap="round">
                <g transform="translate(132.4805191230671 10.33982367020144) rotate(0 -61.232959661087534 64.63479075337)">
                  <path
                    d="M0.88 0.46 C-6.29 13.35, -23.18 55.05, -43.66 76.56 C-64.13 98.06, -108.99 120.72, -121.97 129.48 M-0.11 -0.34 C-7.31 12.3, -23.72 53.07, -44.11 74.94 C-64.5 96.81, -109.7 121.7, -122.48 130.9"
                    className="fill-none stroke-foreground stroke-4"
                  />
                </g>
                <g transform="translate(132.4805191230671 10.33982367020144) rotate(0 -61.232959661087534 64.63479075337)">
                  <path
                    d="M-107.33 111.02 C-110.48 117.68, -113.44 121.9, -122.48 130.9 M-107.33 111.02 C-111.69 117.04, -116.3 123.29, -122.48 130.9"
                    className="fill-none stroke-foreground stroke-4"
                  />
                </g>
                <g transform="translate(132.4805191230671 10.33982367020144) rotate(0 -61.232959661087534 64.63479075337)">
                  <path
                    d="M-98.09 125.41 C-103.46 128.53, -108.73 129.16, -122.48 130.9 M-98.09 125.41 C-105.49 126.85, -113.03 128.53, -122.48 130.9"
                    className="fill-none stroke-foreground stroke-4"
                  />
                </g>
              </g>
            </svg>
            <svg
              viewBox="0 0 143.36294672570057 151.24241631079894"
              className="pointer-events-none absolute hidden size-32 -translate-x-80 translate-y-4 -scale-x-100 -rotate-45 md:block"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g strokeLinecap="round">
                <g transform="translate(132.4805191230671 10.33982367020144) rotate(0 -61.232959661087534 64.63479075337)">
                  <path
                    d="M0.88 0.46 C-6.29 13.35, -23.18 55.05, -43.66 76.56 C-64.13 98.06, -108.99 120.72, -121.97 129.48 M-0.11 -0.34 C-7.31 12.3, -23.72 53.07, -44.11 74.94 C-64.5 96.81, -109.7 121.7, -122.48 130.9"
                    className="fill-none stroke-foreground stroke-4"
                  />
                </g>
                <g transform="translate(132.4805191230671 10.33982367020144) rotate(0 -61.232959661087534 64.63479075337)">
                  <path
                    d="M-107.33 111.02 C-110.48 117.68, -113.44 121.9, -122.48 130.9 M-107.33 111.02 C-111.69 117.04, -116.3 123.29, -122.48 130.9"
                    className="fill-none stroke-foreground stroke-4"
                  />
                </g>
                <g transform="translate(132.4805191230671 10.33982367020144) rotate(0 -61.232959661087534 64.63479075337)">
                  <path
                    d="M-98.09 125.41 C-103.46 128.53, -108.73 129.16, -122.48 130.9 M-98.09 125.41 C-105.49 126.85, -113.03 128.53, -122.48 130.9"
                    className="fill-none stroke-foreground stroke-4"
                  />
                </g>
              </g>
            </svg>
          </div>
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
