"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react"
import { ChatBubbleIcon } from "@radix-ui/react-icons"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { FlameIcon } from "../icons/flame"
import { Button } from "../ui/button"

export type ChatProviderProps = {
  children: React.ReactNode
  toggledStorageKey?: string
}

type ChatContextType = {
  toggled: boolean
  setToggled: Dispatch<SetStateAction<boolean>>
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
}: ChatProviderProps) => {
  const [toggled, setToggled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(toggledStorageKey)
      if (saved !== null) return saved === "true"
    }
    return false
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(toggledStorageKey, String(toggled))
    }
  }, [toggled, toggledStorageKey])

  return (
    <ChatContext.Provider value={{ toggled, setToggled }}>
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
  const { toggled } = useChatSidebar()

  return (
    <motion.div
      className={cn("relative my-2 flex overflow-hidden text-foreground", {
        "mr-2": toggled,
      })}
      animate={{ width: toggled ? "25%" : 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.div
        className={cn(
          "absolute right-0 h-full w-full overflow-hidden",
          className,
        )}
        animate={{ x: 0, opacity: toggled ? 1 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export const ChatToggle = ({ className }: { className?: string }) => {
  const { toggled, setToggled } = useChatSidebar()
  return (
    <Button
      onClick={() => setToggled(!toggled)}
      className={cn("bg-primary/50", className)}
      variant="primary"
      size="square"
    >
      <div className="size-4">
        <FlameIcon className="size-4" />
      </div>
    </Button>
  )
}
