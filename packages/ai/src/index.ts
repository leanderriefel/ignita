import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { convertToModelMessages, smoothStream, streamText } from "ai"

export const openrouter = (apiKey: string) =>
  createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": "https://ignita.ai",
      "X-Title": "Ignita",
    },
  })
