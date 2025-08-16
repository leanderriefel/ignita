import { memo } from "react"
import type { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { useAuthClient } from ".."
import { ReasoningPart } from "./parts/reasoning-part"
import { TextPart } from "./parts/text-part"
import { ToolPart } from "./parts/tool-part"

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
      className={cn("flex h-fit w-5/6 flex-col gap-2 rounded-lg border p-3", {
        "ml-auto border-foreground/25 bg-secondary text-secondary-foreground":
          message.role === "user",
        "mr-auto bg-background text-foreground": message.role !== "user",
      })}
    >
      <p className="text-xs font-bold text-foreground/75">
        {message.role === "user" ? (session?.user.name ?? "You") : "Ignita AI"}
      </p>
      <div className="w-full overflow-x-auto">
        <div className="text-sm wrap-anywhere">
          {message.parts.map((part, idx) => (
            <ChatMessageContent key={idx} message={part} />
          ))}
        </div>
      </div>
    </motion.div>
  )
})

const ChatMessageContent = ({
  message,
}: {
  message: UIMessagePart<UIDataTypes, UITools>
}) => {
  switch (message.type) {
    case "text":
      return <TextPart part={message} />
    case "reasoning":
      return <ReasoningPart part={message} />
    case "tool-navigateToNote":
      return <ToolPart part={message} text={() => "Navigated to note"} />
    case "tool-getNotes":
      return <ToolPart part={message} text={() => "Got notes"} />
    default:
      return null
  }
}
