import { memo } from "react"
import type { UIMessage } from "ai"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { useAuthClient } from ".."

export type ChatMessageProps = {
  message: UIMessage
}

export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  return (
    <motion.div
      layout="position"
      layoutId={message.id}
      className={cn("flex w-5/6 flex-col gap-2 rounded-lg border p-3", {
        "ml-auto border-foreground/25 bg-secondary text-secondary-foreground":
          message.role === "user",
        "mr-auto bg-background text-foreground": message.role !== "user",
      })}
    >
      <p className="text-xs font-bold text-foreground/75">
        {message.role === "user" ? (session?.user.name ?? "You") : "Ignita AI"}
      </p>
      <div className="text-sm wrap-anywhere">
        {message.parts.map((part, idx) =>
          part.type === "text" ? (
            <span key={idx}>{part.text}</span>
          ) : (
            <span key={idx}>[{part.type}]</span>
          ),
        )}
      </div>
    </motion.div>
  )
})

