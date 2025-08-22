"use client"

import { useEffect, useState } from "react"
import { CheckIcon } from "lucide-react"
import { toast } from "sonner"

import {
  usePredefinedModels,
  useProviderKey,
  useSelectedModel,
} from "@ignita/hooks"

import {
  Button,
  Input,
  Loading,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../.."

export const AiTab = () => {
  const { apiKey, setKeyAsync, isSetting: isSettingKey } = useProviderKey()
  const [localKey, setLocalKey] = useState(apiKey)

  const {
    selectedModel,
    setSelectedModelAsync,
    isSetting: isSettingModel,
  } = useSelectedModel()
  const { models: predefinedModels, isLoading: isLoadingModels } =
    usePredefinedModels()
  const [localSelectedModel, setLocalSelectedModel] = useState(selectedModel)
  const [customModel, setCustomModel] = useState("")

  useEffect(() => {
    setLocalKey(apiKey)
  }, [apiKey])

  useEffect(() => {
    setLocalSelectedModel(selectedModel)
    // If the selected model is not in predefined models, treat it as custom
    if (
      selectedModel &&
      !predefinedModels?.some((model) => model === selectedModel)
    ) {
      setCustomModel(selectedModel)
      setLocalSelectedModel("custom")
    }
  }, [selectedModel, predefinedModels])

  const handleModelChange = async (model: string) => {
    let modelToSave = model
    if (model === "custom") {
      modelToSave = customModel
    }

    if (modelToSave) {
      try {
        await setSelectedModelAsync(modelToSave)
        toast.success("Model saved successfully")
      } catch {
        toast.error("Failed to save model")
      }
    }
  }

  const handleCustomModelSave = async () => {
    if (customModel.trim()) {
      try {
        await setSelectedModelAsync(customModel.trim())
        toast.success("Custom model saved successfully")
      } catch {
        toast.error("Failed to save custom model")
      }
    }
  }

  return (
    <div className="flex h-full flex-col gap-y-6">
      <div className="space-y-1">
        <label htmlFor="openrouter-key" className="text-sm font-medium">
          OpenRouter API Key
        </label>
        <div className="flex w-full gap-x-2">
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
            disabled={localKey === apiKey || isSettingKey}
          >
            {isSettingKey ? (
              <Loading className="size-4" />
            ) : (
              <CheckIcon className="size-4" />
            )}
            <span className="sr-only">Save API key</span>
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="model-select" className="text-sm font-medium">
          AI Model
        </label>
        <Select
          value={localSelectedModel}
          onValueChange={(value: string) => {
            setLocalSelectedModel(value)
            if (value !== "custom") {
              handleModelChange(value)
            }
          }}
          disabled={isLoadingModels}
        >
          <SelectTrigger variant="outline" className="w-full">
            <SelectValue
              placeholder={
                isLoadingModels ? "Loading models..." : "Select an AI model"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {predefinedModels?.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom Model</SelectItem>
          </SelectContent>
        </Select>

        {/* Note about system using other models - always visible */}
        <div className="text-muted-foreground mt-2 text-xs">
          <p>
            <strong>Note:</strong> The system might use other models for
            specific parts of the app with your API key, for example gpt-5-nano
            for title generation of chats etc.
          </p>
        </div>
      </div>

      {localSelectedModel === "custom" && (
        <div className="space-y-2">
          <label htmlFor="custom-model" className="text-sm font-medium">
            Custom Model Slug
          </label>
          <div className="flex w-full gap-x-2">
            <Input
              id="custom-model"
              name="custom-model"
              type="text"
              variant="outline"
              placeholder="Enter your custom model slug (e.g., openai/gpt-4)"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="square"
              onClick={handleCustomModelSave}
              disabled={
                !customModel.trim() ||
                customModel === selectedModel ||
                isSettingModel
              }
            >
              {isSettingModel ? (
                <Loading className="size-4" />
              ) : (
                <CheckIcon className="size-4" />
              )}
              <span className="sr-only">Save custom model</span>
            </Button>
          </div>
          <div className="text-muted-foreground space-y-1 text-xs">
            <p>
              <strong>Important:</strong> This model needs to be callable
              through the OpenRouter API with your API key and must support tool
              calling.
            </p>
          </div>
        </div>
      )}

      <div className="text-muted-foreground text-xs">
        <p>
          <strong>Current model:</strong> {selectedModel}
        </p>
      </div>
    </div>
  )
}

