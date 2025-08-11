"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"

export const Chat = () => {
  const [chatId] = useState("")

  const chat = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  return (
    <div className="flex size-full min-h-0 flex-col gap-y-2">
      <ChatMessages chat={chat} />
      <ChatInput
        onSend={(text) =>
          chat.sendMessage(
            {
              role: "user",
              parts: [{ type: "text", text }],
            },
            {
              body: {
                model: "openai/gpt-oss-20b:free",
                chatId,
              },
            },
          )
        }
        status={chat.status}
      />
    </div>
  )
}
