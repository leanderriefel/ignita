"use client"

import { memo, useCallback, useEffect, useRef } from "react"
import type { useChat } from "@ai-sdk/react"
import { SendHorizontalIcon } from "lucide-react"

import { cn } from "@ignita/lib"

import { Button } from "../ui/button"

export type ChatInputProps = {
  onSend: (text: string) => void | Promise<void>
  status: ReturnType<typeof useChat>["status"]
  disabled?: boolean
}

export const ChatInput = memo(
  ({ onSend, status, disabled = false }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const resize = () => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }

    const input = useRef("")

    useEffect(() => {
      resize()
    }, [input.current])

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      resize()
      input.current = e.currentTarget.value
    }

    const handleSendMessage = useCallback(async () => {
      if (disabled) return
      if (input.current.trim() === "") return
      if (status !== "ready") return

      await onSend(input.current)
      input.current = ""

      if (textareaRef.current) {
        textareaRef.current.value = ""
      }
    }, [input, onSend, status])

    return (
      <div
        className={cn(
          "relative w-full shrink-0 rounded-xl bg-gradient-to-br from-primary via-border to-primary p-px",
        )}
      >
        <div
          className={cn(
            "relative size-full overflow-hidden rounded-[calc(var(--radius-xl)-1px)] bg-background",
            "before:absolute before:-top-16 before:left-0 before:size-16 before:rounded-full before:bg-primary before:blur-2xl dark:before:-top-12 dark:before:left-4 dark:before:size-12 dark:before:bg-primary dark:before:blur-3xl",
            "after:absolute after:right-0 after:-bottom-16 after:size-16 after:rounded-full after:bg-primary after:blur-2xl dark:after:right-4 dark:after:-bottom-12 dark:after:size-12 dark:after:bg-primary dark:after:blur-3xl",
          )}
        >
          <div className="relative z-10 flex size-full flex-col gap-x-2 p-4">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Ask me anything..."
              onInput={handleInput}
              className={cn(
                "max-h-40 min-h-20 w-full resize-none bg-transparent text-sm",
                "focus:outline-none",
                "overflow-y-auto",
              )}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <div className="flex h-9 w-full gap-x-2">
              <Button
                variant="outline"
                size="square"
                className="ml-auto"
                onClick={handleSendMessage}
                disabled={disabled || status !== "ready"}
              >
                <SendHorizontalIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  },
)
