"use client"

import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { SquareIcon, ViewVerticalIcon } from "@radix-ui/react-icons"
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

export type SidebarProps = {
  children?: React.ReactNode
  className?: string
}

export const Sidebar = ({ children, className }: SidebarProps) => {
  const sidebar = useSidebar()
  const dragging = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      e.preventDefault()

      sidebar.setWidth((prevWidth) =>
        Math.min(
          sidebar.maxWidth,
          Math.max(sidebar.minWidth, prevWidth + e.movementX),
        ),
      )
    }

    const handleMouseUp = (e: MouseEvent) => {
      dragging.current = false

      document.body.style.userSelect = ""
      e.preventDefault()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [sidebar.minWidth, sidebar.maxWidth])

  return (
    <div
      style={{ "--sidebar-width": `${sidebar.width}px` } as React.CSSProperties}
      className={cn(
        "bg-background relative flex h-full transition-all",
        {
          "w-[var(--sidebar-width)]": sidebar.toggled,
          "w-0": !sidebar.toggled,
          "duration-0": dragging.current,
          "duration-300": !dragging.current,
        },
        className,
      )}
    >
      <div
        className={cn(
          "absolute h-full w-[var(--sidebar-width)] transition-all",
          {
            "translate-x-0": sidebar.toggled,
            "-translate-x-[var(--sidebar-width)]": !sidebar.toggled,
            "duration-0": dragging.current,
            "duration-300": !dragging.current,
          },
        )}
      >
        {children}
      </div>
      {sidebar.toggled && (
        <div
          className="absolute -right-1.5 z-10 h-full w-3 cursor-col-resize bg-transparent"
          onMouseDown={(e) => {
            e.preventDefault()

            document.body.style.userSelect = "none"
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
  widthCookie?: string
  toggledCookie?: string
  widthCookieName?: string
  toggledCookieName: string
}

export const SidebarProvider = ({
  minWidth = 200,
  maxWidth = 500,
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
  }, [width])

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.cookie = `${toggledCookieName}=${toggled}; path=/; max-age=${60 * 60 * 24 * 365}`
    }
  }, [toggled])

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
