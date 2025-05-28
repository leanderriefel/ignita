"use client"

import { useEffect, useState } from "react"
import { Button } from "@/ui/button"
import { Loading } from "@/ui/loading"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

import { cn } from "@nuotes/lib"

export const ThemeSelector = ({ className }: { className?: string }) => {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="square" className={cn(className)}>
        <Loading className="size-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="square"
      className={cn(className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <MoonIcon className="size-4" />
      ) : (
        <SunIcon className="size-4" />
      )}
    </Button>
  )
}
