"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SquareIcon, ViewVerticalIcon } from "@radix-ui/react-icons"
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"

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

      const rect = sidebarRef.current.getBoundingClientRect()
      const sidebarRightEdgeX = rect.left + width
      const threshold = 50

      if (Math.abs(e.clientX - sidebarRightEdgeX) > threshold) {
        return
      }

      e.preventDefault()

      setWidth((prevWidth) =>
        Math.min(maxWidth, Math.max(minWidth, prevWidth + e.movementX)),
      )
    }

    const handleMouseUp = (_e: MouseEvent) => {
      if (!dragging.current) return

      dragging.current = false
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
      // Ensure cursor is reset if component unmounts during drag
      if (dragging.current) {
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }
  }, [minWidth, maxWidth, setWidth, width])

  return (
    <div
      ref={sidebarRef}
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
      className={cn("relative flex h-full transition-all", {
        "w-[var(--sidebar-width)]": toggled,
        "w-0": !toggled,
        "duration-0": dragging.current,
        "duration-300": !dragging.current,
      })}
    >
      <div
        className={cn(
          "absolute h-full w-[var(--sidebar-width)] transition-all overflow-hidden",
          {
            "translate-x-0": toggled,
            "-translate-x-[var(--sidebar-width)]": !toggled,
            "duration-0": dragging.current,
            "duration-300": !dragging.current,
          },
          className,
        )}
      >
        {children}
      </div>
      {toggled && (
        <div
          className="absolute -right-4 z-10 h-full w-4 cursor-col-resize bg-transparent"
          onMouseDown={(_e) => {
            document.body.style.userSelect = "none"
            document.body.style.cursor = "col-resize" // Set body cursor
            dragging.current = true
          }}
        />
      )}
    </div>
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
      {toggled ? (
        <ViewVerticalIcon className="size-4" />
      ) : (
        <SquareIcon className="size-4" />
      )}
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
  widthCookie?: string
  toggledCookie?: string
  widthCookieName?: string
  toggledCookieName: string
}

export const SidebarProvider = ({
  minWidth = 200,
  maxWidth = 1000,
  initialWidth = 250,
  children,
  widthCookie,
  toggledCookie,
  widthCookieName,
  toggledCookieName,
}: SidebarProviderProps) => {
  const [width, setWidth] = useState(
    widthCookie
      ? Math.min(maxWidth, Math.max(minWidth, parseInt(widthCookie)))
      : initialWidth,
  )
  const [toggled, setToggled] = useState(
    toggledCookie ? toggledCookie === "true" : true,
  )

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `${widthCookieName}=${width}; path=/; max-age=${60 * 60 * 24 * 365}`
    }
  }, [width, widthCookieName])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `${toggledCookieName}=${toggled}; path=/; max-age=${60 * 60 * 24 * 365}`
    }
  }, [toggled, toggledCookieName])

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
