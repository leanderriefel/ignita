import { createOpenRouter } from "@openrouter/ai-sdk-provider"

export const openrouter = (apiKey: string) =>
  createOpenRouter({
    apiKey,
    headers: {
      "HTTP-Referer": "https://ignita.ai",
      "X-Title": "Ignita",
    },
  })
