"use client"

import { forwardRef, useEffect, useRef } from "react"

import { cn } from "@ignita/lib"

export type ChatInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, value, onInput, ...rest }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null)
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef

    const resize = () => {
      const el = textareaRef.current
      if (!el) return
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }

    useEffect(() => {
      resize()
    }, [value])

    const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (e) => {
      resize()
      onInput?.(e)
    }

    return (
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onInput={handleInput}
        className={cn(
          "max-h-40 min-h-20 w-full resize-none bg-transparent text-sm",
          "focus:outline-none",
          "overflow-y-auto",
          className,
        )}
        {...rest}
      />
    )
  },
)
