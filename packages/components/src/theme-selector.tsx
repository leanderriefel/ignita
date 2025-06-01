import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { motion } from "motion/react"

import { cn } from "@nuotes/lib"

import { useTheme } from "./theme-provider"
import { Button } from "./ui/button"

export const ThemeSelector = ({ className }: { className?: string }) => {
  const { resolvedTheme, setTheme } = useTheme()

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
        {resolvedTheme === "dark" ? (
          <MoonIcon className="size-4" />
        ) : (
          <SunIcon className="size-4" />
        )}
      </motion.div>
    </Button>
  )
}
