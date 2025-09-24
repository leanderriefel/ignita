import { memo } from "react"
import type { useChat } from "@ai-sdk/react"
import type {
  ToolUIPart,
  UIDataTypes,
  UIMessage,
  UIMessagePart,
  UITools,
} from "ai"

import { cn } from "@ignita/lib"

import { useAuthClient } from ".."
import { ReasoningPart } from "./parts/reasoning-part"
import { TextPart } from "./parts/text-part"
import { ToolPart } from "./parts/tool-part"

export type ChatMessageProps = {
  message: UIMessage
  chat: ReturnType<typeof useChat>
}

export const ChatMessage = memo(({ message, chat }: ChatMessageProps) => {
  const authClient = useAuthClient()
  const { data: session } = authClient.useSession()

  return (
    <div
      className={cn("flex h-fit w-full flex-col gap-2 rounded-lg border p-3", {
        "border-foreground/25 bg-secondary text-secondary-foreground":
          message.role === "user",
        "bg-background text-foreground": message.role !== "user",
      })}
    >
      <p className="text-xs font-bold text-foreground/75">
        {message.role === "user" ? (session?.user.name ?? "You") : "Ignita AI"}
      </p>
      <div className="w-full overflow-x-auto">
        <div className="space-y-1 text-sm wrap-anywhere">
          {message.parts.map((part, idx) => (
            <ChatMessageContent key={idx} message={part} chat={chat} />
          ))}
        </div>
      </div>
    </div>
  )
})

const ChatMessageContent = ({
  message,
  chat,
}: {
  message: UIMessagePart<UIDataTypes, UITools>
  chat: ReturnType<typeof useChat>
}) => {
  switch (message.type) {
    case "text":
      return <TextPart part={message} />
    case "reasoning":
      return <ReasoningPart part={message} />
    default:
      if (message.type.startsWith("tool-")) {
        return <ToolPart part={message as ToolUIPart} chat={chat} />
      }

      return null
  }
}
