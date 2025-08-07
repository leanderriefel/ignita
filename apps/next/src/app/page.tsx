"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Button, ThemeSelector } from "@ignita/components"

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
    <div className="relative flex h-dvh w-dvw flex-col items-center justify-center gap-y-2">
      <ThemeSelector className="absolute top-8 left-8" />
      <h1 className="font-bold">ignita</h1>
      <h2 className="text-center text-sm">
        This page is under heavy development. This is a personal and private
        project. Expect data loss, bugs and much more! (Seriously don&apos;t use
        it yet)
      </h2>
      <Button className="mt-8" asChild>
        <Link href="/notes">Get started</Link>
      </Button>
    </div>
  )
}

export default Landing
