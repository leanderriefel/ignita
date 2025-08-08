"use client"

import { useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { PaperPlaneIcon } from "@radix-ui/react-icons"
import {
  convertToModelMessages,
  DefaultChatTransport,
  smoothStream,
  streamText,
} from "ai"
import dedent from "dedent"

import { openrouter } from "@ignita/ai"
import { cn } from "@ignita/lib"
import { useLocalStorage } from "@ignita/lib/use-localstorage"

import { Button } from "../ui/button"
import { ChatInput } from "./chat-input"

export const Chat = () => {
  const [chatId, setChatId] = useLocalStorage<string | undefined>(
    "current-chat-id",
    undefined,
  )

  const [openrouterKey, setOpenrouterKey] = useLocalStorage(
    "openrouter-key",
    "",
  )

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const chat = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      fetch: async (url, options) => {
        const m = JSON.parse(options?.body as string)

        const result = streamText({
          model: openrouter(openrouterKey).languageModel(
            "openai/gpt-oss-20b:free" /*"openai/gpt-5-nano"*/,
          ),
          messages: convertToModelMessages(m.messages),
          abortSignal: options?.signal as AbortSignal | undefined,
          experimental_transform: smoothStream({ chunking: "word" }),
          system: dedent`
            You are Ignita AI, an intelligent and helpful assistant integrated into the Ignita note-taking platform.
            You are designed to help users organize, enhance, and work with their notes and knowledge.
            You can help with various note-taking tasks including content creation, organization, review, and knowledge synthesis.

            ## Core Principles:
            - Always be helpful, accurate, and honest
            - When you're uncertain about information, clearly state your uncertainty
            - Provide thoughtful, well-structured responses
            - Help users think through complex topics and ideas
            - Support knowledge organization and discovery

            ## Your Capabilities:
            - Note organization and structure suggestions
            - Content summarization and synthesis
            - Research assistance and fact-checking
            - Writing improvement and editing suggestions
            - Idea generation and brainstorming
            - Concept explanation and clarification
            - Cross-reference identification between notes
            - Knowledge gap identification
            - Study and learning strategy recommendations

            ## Communication Style:
            - Be clear and well-organized
            - Use appropriate tone for the context (academic, professional, casual)
            - Provide examples and analogies when helpful
            - Break down complex topics into digestible parts
            - Ask clarifying questions to better understand user needs

            ## Important Guidelines:
            - Always acknowledge when you don't have complete information
            - Suggest reliable sources for further research when appropriate
            - Respect the user's existing note structure and organization preferences
            - Consider the broader context of the user's knowledge base
            - Help maintain consistency across related notes
            - Encourage critical thinking and deeper exploration of topics
          `,
        })

        return result.toUIMessageStreamResponse()
      },
    }),
  })

  return (
    <div className="flex size-full flex-col gap-y-2">
      <div className="size-full grow rounded-xl border bg-background"></div>
      <div
        className={cn(
          "relative w-full rounded-xl bg-gradient-to-br from-primary via-border to-primary p-px",
        )}
      >
        <div
          className={cn(
            "relative size-full overflow-hidden rounded-[calc(var(--radius-xl)-1px)] bg-background",
            "before:absolute before:-top-16 before:left-0 before:size-16 before:rounded-full before:bg-primary before:blur-2xl before:content-[''] dark:before:-top-12 dark:before:left-4 dark:before:size-12 dark:before:bg-primary/50 dark:before:blur-3xl",
            "after:absolute after:right-0 after:-bottom-16 after:size-16 after:rounded-full after:bg-primary after:blur-2xl after:content-[''] dark:after:right-4 dark:after:-bottom-12 dark:after:size-12 dark:after:bg-primary/50 dark:after:blur-3xl",
          )}
        >
          <div className="relative z-10 flex size-full flex-col gap-x-2 p-4">
            <ChatInput
              ref={textAreaRef}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (e.currentTarget.value.trim() === "") return
                  chat.sendMessage({
                    role: "user",
                    parts: [
                      {
                        type: "text",
                        text: e.currentTarget.value,
                      },
                    ],
                  })
                }
              }}
              placeholder="Ask me anything..."
            />
            <div className="flex h-8 w-full gap-x-2">
              <Button
                variant="outline"
                size="square"
                className="ml-auto"
                onClick={() => {
                  chat.sendMessage({
                    role: "user",
                    parts: [
                      {
                        type: "text",
                        text: textAreaRef.current?.value ?? "",
                      },
                    ],
                  })
                }}
              >
                <PaperPlaneIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
