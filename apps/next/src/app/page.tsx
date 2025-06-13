"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button, ThemeSelector } from "@ignita/components"

const Landing = () => {
  const router = useRouter()

  useEffect(() => {
    const lastNotesPath = localStorage.getItem("pick-up-where-left-off")
    if (lastNotesPath && lastNotesPath !== "/notes") {
      router.replace(lastNotesPath)
    }
  }, [router])

  return (
    <div className="relative flex h-dvh w-dvw flex-col items-center justify-center gap-y-4">
      <ThemeSelector className="absolute top-8 left-8" />
      ignita
      <Button asChild>
        <Link href="/notes">Get started</Link>
      </Button>
    </div>
  )
}

export default Landing
