"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { SiGithub } from "@icons-pack/react-simple-icons"

import { Button, ThemeProvider } from "@ignita/components"
import { cn } from "@ignita/lib"

import { Background } from "~/components/background"
import { Footer } from "~/components/footer"
import { Magnet } from "~/components/magnet"

const noteTypes = [
  {
    id: "text",
    title: "Text Notes",
    category: "Rich Text Editor",
    description:
      "Capture thoughts with focused editing and intuitive formatting",
    details:
      "Compose with slash commands, keyboard shortcuts, and frictionless formatting that keeps you in flow.",
    image: "/text_notes.webp",
  },
  {
    id: "canvas",
    title: "Canvas Notes",
    category: "Infinite Canvas (powered by Excalidraw)",
    description:
      "Sketch mind maps and shape ideas spatially beyond linear text",
    details:
      "Move ideas around freely, connect them with threads, and remix creativity in real time on boundless space.",
    image: "/canvas_notes.webp",
  },
  {
    id: "boards",
    title: "Board Views",
    category: "Management",
    description: "Visual project tracking with drag-and-drop kanban workflows",
    details:
      "Track progress, assign owners, and keep momentum visible at a glance across teams and timelines.",
    image: "/board_notes.webp",
  },
  {
    id: "directories",
    title: "Directories",
    category: "Organization",
    description: "Shows all subnotes at a glance for a clear overview",
    details:
      "Browse nested notes, jump between related pages, and navigate big projects without getting lost.",
    image: "/directories.webp",
  },
]

const Landing = () => {
  const [activeNote, setActiveNote] = useState(0)
  const currentNote = noteTypes[activeNote]

  return (
    <ThemeProvider forcedTheme="light">
      <div className="relative min-h-screen w-full bg-background">
        <div className="fixed top-4 right-0 left-0 z-50 flex items-center justify-between rounded-3xl border border-foreground/15 p-4 shadow-sm backdrop-blur-xs md:mx-80">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Ignita home"
          >
            <Image
              src="/logo.webp"
              alt="Ignita logo"
              width={310}
              height={310}
              className="h-9 w-9 rounded-lg"
            />
            <span className="text-base font-semibold tracking-tight md:text-lg">
              Ignita
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/leanderriefel/ignita"
              target="_blank"
              aria-label="Open Ignita on GitHub"
              className="rounded-xl bg-foreground p-2 text-background hover:bg-foreground/90"
            >
              <SiGithub className="size-5" />
            </Link>
            <Button className="rounded-xl" asChild>
              <Link href="/notes">Get started</Link>
            </Button>
          </div>
        </div>
        <div className="relative mt-12 flex h-[85dvh] w-dvw flex-col items-center justify-center">
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
        <div className="relative overflow-hidden px-6 py-20 md:px-16">
          <div
            className="pointer-events-none absolute top-10 -left-20 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--color-primary) 40%, transparent) 0%, transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--color-indigo-500) 35%, transparent) 0%, transparent 80%)",
            }}
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Ways to capture and organize
              </h2>
              <p className="text-lg text-muted-foreground">
                Use different note types and combine them all in one workspace
              </p>
            </div>

            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {noteTypes.map((note, index) => (
                <button
                  key={note.id}
                  onClick={() => setActiveNote(index)}
                  className={cn(
                    "relative cursor-pointer rounded-full px-6 py-3 text-sm font-medium transition-all duration-300",
                    activeNote === index
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span className="relative z-10">{note.title}</span>
                  {activeNote === index && (
                    <div className="absolute inset-0 rounded-full bg-primary opacity-20 blur-xl" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/50 p-5 shadow-2xl backdrop-blur md:p-10">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, color-mix(in oklab, var(--color-background) 85%, transparent) 0%, color-mix(in oklab, var(--color-background) 75%, transparent) 50%, color-mix(in oklab, var(--color-background) 90%, transparent) 100%)`,
                }}
              />
              <div
                className="pointer-events-none absolute -top-16 -right-24 h-64 w-64 rounded-full opacity-15 blur-3xl"
                style={{
                  background: `radial-gradient(circle, var(--color-primary) 15% 0%, transparent 70%)`,
                }}
              />

              <div className="relative grid gap-8 md:grid-cols-[1fr_300px] md:gap-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold tracking-[0.3em] text-primary uppercase">
                      {currentNote?.category}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold md:text-3xl">
                    {currentNote?.title}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {currentNote?.description}
                  </p>
                  <p className="text-base font-medium text-foreground/80">
                    {currentNote?.details}
                  </p>
                </div>
                <div className="relative grid place-items-center">
                  <div
                    className="absolute inset-0 rounded-2xl opacity-35 blur-2xl"
                    style={{
                      background: `linear-gradient(135deg, var(--color-primary) 0%, transparent 70%)`,
                    }}
                  />
                  <div className="relative">
                    <div className="pointer-events-none absolute -inset-4 rounded-xl bg-gradient-to-tr from-primary/20 to-transparent ring-1 ring-foreground/10" />
                    <div className="relative overflow-hidden rounded-lg ring-1 ring-foreground/10">
                      <Image
                        src={currentNote?.image ?? ""}
                        alt={currentNote?.title ?? "Note"}
                        width={420}
                        height={280}
                        className="object-cover"
                      />
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                          maskImage:
                            "radial-gradient(120% 100% at 50% 50%, #000 60%, transparent 95%)",
                          WebkitMaskImage:
                            "radial-gradient(120% 100% at 50% 50%, #000 60%, transparent 95%)",
                          background:
                            "linear-gradient(180deg, transparent 0%, color-mix(in oklab, var(--color-background) 15%, transparent) 100%)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-t border-t-border/50 px-6 py-40 md:px-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 70% 40% at 50% 0%, color-mix(in oklab, var(--color-primary) 30%, transparent) 0%, transparent 80%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <span className="text-xs font-semibold tracking-[0.4em] text-primary uppercase">
              Fully Open Source
            </span>
            <h3 className="mt-6 mb-8 text-3xl font-semibold md:text-4xl">
              See exactly how Ignita is made
            </h3>
            <div className="mb-8 grid gap-4 text-left sm:grid-cols-2">
              {["Self-hostable", "Transparent architecture"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-primary/15 bg-background/70 p-4 text-center text-sm font-medium text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-background/60"
                >
                  {item}
                </div>
              ))}
            </div>
            <Button size="lg" className="rounded-xl" asChild>
              <Link
                href="https://github.com/leanderriefel/ignita"
                target="_blank"
                rel="noreferrer"
              >
                Explore the GitHub repo
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default Landing

