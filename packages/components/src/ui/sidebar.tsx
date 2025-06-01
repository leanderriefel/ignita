"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"
import { ChevronLeftIcon, HamburgerMenuIcon } from "@radix-ui/react-icons"
import { motion } from "motion/react"

import { cn } from "@nuotes/lib"

import { Button } from "./button"

export type SidebarProps = {
  children?: React.ReactNode
  className?: string
}

export const Sidebar = ({ children, className }: SidebarProps) => {
  const { minWidth, maxWidth, setWidth, toggled, width } = useSidebar()
  const dragging = useRef(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !sidebarRef.current) return

      e.preventDefault()

      const rect = sidebarRef.current.getBoundingClientRect()
      const newWidth = e.clientX - rect.left
      const effectiveMaxWidth = Math.min(maxWidth, window.innerWidth * 0.5)

      setWidth(Math.min(effectiveMaxWidth, Math.max(minWidth, newWidth)))
    }

    const handleMouseUp = (_e: MouseEvent) => {
      if (!dragging.current) return

      dragging.current = false
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    const handleResize = () => {
      const effectiveMaxWidth = Math.min(maxWidth, window.innerWidth * 0.5)
      setWidth((prevWidth) =>
        Math.min(effectiveMaxWidth, Math.max(minWidth, prevWidth)),
      )
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("resize", handleResize)
    }
  }, [minWidth, maxWidth, setWidth, width])

  return (
    <motion.div
      ref={sidebarRef}
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
      className="relative flex h-full"
      animate={{
        width: toggled ? width : 0,
      }}
      transition={
        dragging.current
          ? { duration: 0 }
          : toggled
            ? {
                type: "spring",
                stiffness: 600,
                damping: 30,
                mass: 2,
              }
            : {
                duration: 0.2,
                ease: "easeOut",
              }
      }
    >
      <motion.div
        className={cn(
          "absolute h-full w-[var(--sidebar-width)] overflow-hidden",
          className,
        )}
        animate={{
          x: 0,
          opacity: toggled ? 1 : 0,
        }}
        transition={
          dragging.current
            ? { duration: 0 }
            : toggled
              ? {
                  type: "spring",
                  stiffness: 600,
                  damping: 30,
                  mass: 2,
                }
              : {
                  duration: 0.2,
                  ease: "easeOut",
                }
        }
      >
        {children}
      </motion.div>
      {toggled && (
        <div
          className="absolute -right-4 z-10 h-full w-4 cursor-col-resize bg-transparent"
          onMouseDown={(_e) => {
            document.body.style.userSelect = "none"
            document.body.style.cursor = "col-resize"
            dragging.current = true
          }}
        />
      )}
    </motion.div>
  )
}

export const SidebarToggle = ({ className }: { className?: string }) => {
  const { toggled, setToggled } = useSidebar()
  return (
    <Button
      onClick={() => setToggled(!toggled)}
      className={cn(className)}
      variant="outline"
      size="square"
    >
      <motion.div
        animate={{
          rotate: toggled ? 0 : 180,
          scale: toggled ? 1 : 1.1,
        }}
        transition={{
          type: "spring",
          stiffness: 600,
          damping: 15,
          mass: 2,
        }}
        className="size-4"
      >
        {toggled ? (
          <ChevronLeftIcon className="size-4" />
        ) : (
          <HamburgerMenuIcon className="size-4" />
        )}
      </motion.div>
    </Button>
  )
}

type SidebarContextType = {
  toggled: boolean
  setToggled: Dispatch<SetStateAction<boolean>>
  minWidth: number
  maxWidth: number
  initialWidth: number
  width: number
  setWidth: Dispatch<SetStateAction<number>>
}

export const SidebarContent = createContext<SidebarContextType>({
  toggled: true,
  setToggled: (prev) => !prev,
  maxWidth: 1000,
  minWidth: 200,
  initialWidth: 250,
  width: 250,
  setWidth: (prev) => prev,
})

export const useSidebar = () => {
  const context = useContext(SidebarContent)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }

  return context
}

export type SidebarProviderProps = {
  minWidth?: number
  maxWidth?: number
  initialWidth?: number
  children: React.ReactNode
  widthStorageKey: string
  toggledStorageKey: string
}

export const SidebarProvider = ({
  minWidth = 200,
  maxWidth = 1000,
  initialWidth = 250,
  children,
  widthStorageKey,
  toggledStorageKey,
}: SidebarProviderProps) => {
  const [width, setWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWidth = localStorage.getItem(widthStorageKey)
      if (savedWidth) {
        return Math.min(maxWidth, Math.max(minWidth, parseInt(savedWidth)))
      }
    }
    return initialWidth
  })

  const [toggled, setToggled] = useState(() => {
    if (typeof window !== "undefined") {
      const savedToggled = localStorage.getItem(toggledStorageKey)
      if (savedToggled !== null) {
        return savedToggled === "true"
      }
    }
    return true
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(widthStorageKey, width.toString())
    }
  }, [width, widthStorageKey])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(toggledStorageKey, toggled.toString())
    }
  }, [toggled, toggledStorageKey])

  return (
    <SidebarContent.Provider
      value={{
        toggled,
        setToggled,
        minWidth,
        maxWidth,
        initialWidth,
        width,
        setWidth,
      }}
    >
      {children}
    </SidebarContent.Provider>
  )
}
