"use client"

import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { ViewVerticalIcon } from "@radix-ui/react-icons"
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { motion } from "motion/react"

export type SidebarProps = {
  children?: React.ReactNode
}

export const Sidebar = ({ children }: SidebarProps) => {
  const sidebar = useSidebar()
  const dragging = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return

      sidebar.setWidth((prevWidth) =>
        Math.min(
          sidebar.maxWidth,
          Math.max(sidebar.minWidth, prevWidth + e.movementX)
        )
      )
    }

    const handleMouseUp = () => {
      dragging.current = false
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [sidebar.minWidth, sidebar.maxWidth])

  return (
    <motion.div
      style={{ width: `${sidebar.width}px` } as React.CSSProperties}
      animate={{ x: sidebar.toggled ? 0 : -sidebar.width }}
      transition={{ duration: 0.3 }}
      className="flex h-full relative border-r rounded-r-4xl shadow-md overflow-hidden"
    >
      <div className="w-full">{children}</div>
      <div
        className="cursor-col-resize absolute w-3 h-full -right-1.5 bg-transparent z-10"
        onMouseDown={() => (dragging.current = true)}
      />
    </motion.div>
  )
}

export const SidebarToggle = ({ className }: { className?: string }) => {
  const { toggled, setToggled } = useSidebar()
  return (
    <Button
      onClick={() => setToggled(!toggled)}
      className={cn(className)}
      variant="ghost"
      size="square"
    >
      <ViewVerticalIcon className="size-4" />
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
  maxWidth: 500,
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
}

export const SidebarProvider = ({
  minWidth = 200,
  maxWidth = 500,
  initialWidth = 250,
  children,
}: SidebarProviderProps) => {
  const [toggled, setToggled] = useState(true)
  const [width, setWidth] = useState(initialWidth)

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
