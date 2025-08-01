"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { Button } from "../ui/button"
import { useTheme } from "./theme-provider"

export const ThemeSelector = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Button
      variant="outline"
      size="square"
      className={cn(className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <motion.div
        animate={{ rotate: resolvedTheme === "dark" ? 0 : -90 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
          mass: 2,
        }}
      >
        {resolvedTheme === "dark" || !mounted ? (
          <MoonIcon className="size-4" />
        ) : (
          <SunIcon className="size-4" />
        )}
      </motion.div>
    </Button>
  )
}
