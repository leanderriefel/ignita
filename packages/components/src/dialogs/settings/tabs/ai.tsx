"use client"

import { useEffect, useState } from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"

import { useProviderKey } from "@ignita/hooks"

import { Button, Input, Loading } from "../../.."

export const AiTab = () => {
  const { apiKey, setKeyAsync, isSetting } = useProviderKey("openrouter")
  const [localKey, setLocalKey] = useState(apiKey)

  useEffect(() => {
    setLocalKey(apiKey)
  }, [apiKey])

  return (
    <div className="flex h-full flex-col gap-y-4">
      <div className="space-y-1">
        <label htmlFor="openrouter-key" className="text-sm font-medium">
          OpenRouter API Key
        </label>
        <div className="flex w-full gap-x-4">
          <Input
            id="openrouter-key"
            name="openrouter-key"
            type="password"
            variant="outline"
            placeholder="Enter your OpenRouter API Key"
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="square"
            onClick={() =>
              toast.promise(setKeyAsync(localKey), {
                loading: "Saving API key...",
                success: "API key saved",
                error: "Failed to save API key",
              })
            }
            disabled={localKey === apiKey || isSetting}
          >
            {isSetting ? (
              <Loading className="size-4" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            <span className="sr-only">Save API key</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
