"use client"

import { useLocalStorage } from "@ignita/lib/use-localstorage"

import { Input } from "../../.."

export const AiTab = () => {
  const [openrouterKey, setOpenrouterKey] = useLocalStorage(
    "openrouter-key",
    "",
  )

  return (
    <div className="flex h-full flex-col gap-y-4">
      <div className="space-y-1">
        <label htmlFor="openrouter-key" className="text-sm font-medium">
          OpenRouter API Key
        </label>
        <Input
          id="openrouter-key"
          name="openrouter-key"
          type="password"
          variant="outline"
          placeholder="Enter your OpenRouter API Key"
          value={openrouterKey}
          onChange={(e) => setOpenrouterKey(e.target.value)}
        />
      </div>
    </div>
  )
}
