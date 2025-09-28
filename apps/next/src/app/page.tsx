"use client"

import Image from "next/image"

import { ThemeProvider } from "@ignita/components"
import { cn } from "@ignita/lib"

import { Background } from "~/components/background"
import { Footer } from "~/components/footer"
import { Magnet } from "~/components/magnet"

const Landing = () => {
  return (
    <ThemeProvider forcedTheme="light">
      <div className="relative min-h-screen w-full bg-background">
        <div className="relative flex h-[80dvh] w-dvw flex-col items-center justify-center">
          <Background />
          <div className="relative z-10">
            <div className="flex w-full flex-col items-center justify-center gap-12">
              <h1 className="text-center">
                <span className="text-4xl font-bold tracking-widest md:text-6xl">
                  Note Taking
                </span>
                <br />
                <span className="bg-gradient-to-r from-rose-950 to-rose-800 bg-clip-text font-londrina text-5xl font-extrabold text-transparent md:text-7xl">
                  Done Easy.
                </span>
              </h1>
              <h3 className="max-w-xl text-center font-light text-muted-foreground md:text-lg">
                A calm, minimalistic note-taking app. Use workspaces to keep
                related notes together and stay focused on what matters. Write,
                organize, and revisit your thoughts without clutter.
              </h3>
            </div>
            <div className="relative mt-16 flex w-full items-center justify-center gap-x-8">
              <Magnet>
                <a
                  href="/notes"
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-2 rounded-3xl px-8 py-3 font-semibold transition-all duration-300 select-none",
                    "bg-gradient-to-b from-primary-lighter to-primary-darker text-primary-foreground shadow-lg shadow-primary/25",
                    "ring-1 ring-primary/30 hover:ring-primary/50",
                    "hover:scale-110 active:scale-100",
                  )}
                  draggable={false}
                >
                  <span className="relative z-10">Start staying organized</span>
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(120% 120% at 50% 0%, var(--color-primary-lighter) 0%, transparent 60%)",
                      boxShadow:
                        "0 10px 30px -10px color-mix(in oklab, var(--color-primary) 60%, transparent)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(120deg, transparent 0%, color-mix(in oklab, var(--color-primary) 35%, transparent) 30%, transparent 60%)",
                      mask: "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
                      WebkitMask:
                        "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
                    }}
                  />
                </a>
              </Magnet>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1">
          <div>
            <h2>Text Notes</h2>
            <p>Take notes with a simple rich text editor.</p>
          </div>
          <div>
            <Image
              src="/text_notes.webp"
              alt="Text Notes"
              width={500}
              height={500}
            />
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Landing
