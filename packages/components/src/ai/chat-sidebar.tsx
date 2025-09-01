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
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { FlameIcon } from "../icons/flame"
import { Button } from "../ui/button"

export type ChatProviderProps = {
  children: React.ReactNode
  toggledStorageKey?: string
  widthStorageKey?: string
  minWidth?: number
  maxWidth?: number
  initialWidth?: number
}

type ChatContextType = {
  toggled: boolean
  setToggled: Dispatch<SetStateAction<boolean>>
  minWidth: number
  maxWidth: number
  width: number
  setWidth: Dispatch<SetStateAction<number>>
}

const ChatContext = createContext<ChatContextType | null>(null)

export const useChatSidebar = () => {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error("useChatSidebar must be used within a ChatProvider")
  return ctx
}

export const ChatProvider = ({
  children,
  toggledStorageKey = "chat-toggled",
  widthStorageKey = "chat-width",
  minWidth = 150,
  maxWidth = 750,
  initialWidth = 350,
}: ChatProviderProps) => {
  const [toggled, setToggled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(toggledStorageKey)
      if (saved !== null) return saved === "true"
    }
    return false
  })

  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedWidth = localStorage.getItem(widthStorageKey)
      if (savedWidth) {
        const parsed = parseInt(savedWidth)
        return Math.min(maxWidth, Math.max(minWidth, parsed))
      }
    }
    return initialWidth
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(toggledStorageKey, String(toggled))
    }
  }, [toggled, toggledStorageKey])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(widthStorageKey, String(width))
    }
  }, [width, widthStorageKey])

  return (
    <ChatContext.Provider
      value={{ toggled, setToggled, minWidth, maxWidth, width, setWidth }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const ChatSidebar = ({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) => {
  const { toggled, minWidth, maxWidth, width, setWidth } = useChatSidebar()
  const dragging = useRef(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !sidebarRef.current) return
      e.preventDefault()
      const rect = sidebarRef.current.getBoundingClientRect()
      const newWidth = rect.right - e.clientX
      setWidth(Math.min(maxWidth, Math.max(minWidth, newWidth)))
    }

    const handleMouseUp = (_e: MouseEvent) => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }

    const handleResize = () => {
      setWidth((prev) => Math.min(maxWidth, Math.max(minWidth, prev)))
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
      className={cn(
        "relative z-10 my-2 flex h-full text-foreground",
        { "mr-2": toggled },
        className,
      )}
      animate={{ width: toggled ? width : 0 }}
      transition={
        dragging.current ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
      }
    >
      <motion.div
        className={cn(
          "absolute right-0 h-full w-[var(--sidebar-width)] overflow-hidden",
        )}
        animate={{ x: 0, opacity: toggled ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
      {toggled && (
        <div
          className="absolute -left-4 z-10 h-full w-4 cursor-col-resize bg-transparent"
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

export const ChatToggle = ({ className }: { className?: string }) => {
  const { toggled, setToggled } = useChatSidebar()
  return (
    <Button
      onClick={() => setToggled(!toggled)}
      className={cn(
        "bg-gradient-to-br from-primary-darker/50 to-primary-lighter/10 text-foreground hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      variant="primary"
      size="square"
    >
      <div className="size-4">
        <FlameIcon className="size-4" />
      </div>
    </Button>
  )
}
