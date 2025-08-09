"use client"

import { useChat } from "@ai-sdk/react"
import {
  convertToModelMessages,
  DefaultChatTransport,
  smoothStream,
  streamText,
} from "ai"
import dedent from "dedent"

import { openrouter } from "@ignita/ai"
import { useProviderKey } from "@ignita/hooks"

import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"

export const Chat = () => {
  const { apiKey } = useProviderKey("openrouter")

  const chat = useChat({
    transport: new DefaultChatTransport({
      fetch: async (_, options) => {
        const m = JSON.parse(options?.body as string)

        const modelMessages = convertToModelMessages(m.messages)

        const result = streamText({
          model: openrouter(apiKey).languageModel(
            "openai/gpt-oss-20b:free" /*"openai/gpt-5-nano"*/,
          ),
          headers: {
            "HTTP-Referer": "https://ignita.app",
            "X-Title": "Ignita",
          },
          messages: modelMessages,
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
    <div className="flex size-full min-h-0 flex-col gap-y-2">
      <ChatMessages chat={chat} />
      <ChatInput
        onSend={(text) =>
          chat.sendMessage({
            role: "user",
            parts: [{ type: "text", text }],
          })
        }
        status={chat.status}
      />
    </div>
  )
}

