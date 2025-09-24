import { memo, useState } from "react"
import type { useChat } from "@ai-sdk/react"
import type { ToolUIPart } from "ai"
// cleaned icon usage
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@ignita/lib"

import { Button } from "../../ui/button"
import { Loading } from "../../ui/loading"

type ToolCallStatus = "pending" | "success" | "error" | "streaming"

interface ToolCallDisplay {
  toolCallId: string
  toolName: string
  input?: unknown
  output?: unknown
  status: ToolCallStatus
  error?: string
  isStreaming?: boolean
}

export const ToolPart = memo(
  ({ part, chat }: { part: ToolUIPart; chat: ReturnType<typeof useChat> }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Extract tool call information from the part data
    const toolCall = extractToolCall(part)

    if (!toolCall) {
      return null
    }

    if (toolCall.toolName === "replaceText") {
      return (
        <ReplaceTextToolCall _part={part} toolCall={toolCall} _chat={chat} />
      )
    }

    return (
      <div className="text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen((v) => !v)}
          className="text-xs"
        >
          Tool: {toolCall.toolName}
        </Button>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="tool-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-2">
                <ToolCallItem toolCall={toolCall} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

const ToolCallItem = memo(({ toolCall }: { toolCall: ToolCallDisplay }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusDotClass = (status: ToolCallStatus) => {
    switch (status) {
      case "success":
        return "bg-success"
      case "error":
        return "bg-destructive"
      case "pending":
        return "bg-warning"
      case "streaming":
        return ""
      default:
        return "bg-muted-foreground"
    }
  }

  const hasExpandableContent =
    toolCall.input !== undefined ||
    toolCall.output !== undefined ||
    !!toolCall.error

  return (
    <div className="rounded-md border bg-muted/30 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            {toolCall.status === "streaming" ? (
              <Loading className="size-3" />
            ) : (
              <span
                className={`inline-block size-2 rounded-full ${getStatusDotClass(toolCall.status)}`}
              />
            )}
          </div>
          <span className="text-xs font-medium text-foreground">
            {toolCall.toolName}
          </span>
          {/* id intentionally hidden for cleaner UI */}
        </div>
        {hasExpandableContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((v) => !v)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? "Hide details" : "Show details"}
          </Button>
        )}
      </div>

      {toolCall.error && (
        <div className="mt-2 rounded bg-red-50 p-2 text-xs text-red-600">
          Error: {toolCall.error}
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && hasExpandableContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2 overflow-hidden"
          >
            {toolCall.input !== undefined && (
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Input:
                </div>
                <pre className="overflow-x-auto rounded border bg-background p-2 text-xs break-words whitespace-pre-wrap">
                  {typeof toolCall.input === "string"
                    ? toolCall.input
                    : JSON.stringify(toolCall.input, null, 2)}
                </pre>
              </div>
            )}
            {toolCall.output !== undefined && (
              <div>
                <div className="mb-1 text-xs font-medium text-muted-foreground">
                  Output:
                </div>
                <pre className="overflow-x-auto rounded border bg-background p-2 text-xs break-words whitespace-pre-wrap">
                  {typeof toolCall.output === "string"
                    ? toolCall.output
                    : JSON.stringify(toolCall.output, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// Extract tool call information from the part data
const extractToolCall = (part: ToolUIPart): ToolCallDisplay | null => {
  try {
    // Based on the AI SDK structure, tool parts have different states
    const toolCallId = part.toolCallId
    const toolName = part.type.replace("tool-", "")

    let status: ToolCallStatus = "pending"
    let input: unknown
    let output: unknown
    let error: string | undefined
    let isStreaming = false

    // Cast to any to access properties that might not be in the strict type
    const partAny = part as Record<string, unknown>

    // Determine status and data based on the state
    switch (part.state) {
      case "input-streaming":
        status = "streaming"
        input = partAny.input
        isStreaming = true
        break
      case "input-available":
        status = "pending"
        input = partAny.input
        break
      case "output-available":
        status = "success"
        input = partAny.input
        output = partAny.output
        break
      case "output-error":
        status = "error"
        input = partAny.input
        output = partAny.output
        error =
          typeof partAny.errorText === "string" ? partAny.errorText : undefined
        break
      default:
        // Handle unknown states by checking available properties
        input = partAny.input
        output = partAny.output
        error =
          typeof partAny.errorText === "string" ? partAny.errorText : undefined
        if (error) {
          status = "error"
        } else if (output !== undefined) {
          status = "success"
        } else if (input !== undefined) {
          status = "pending"
        }
    }

    return {
      toolCallId,
      toolName,
      input,
      output,
      status,
      error,
      isStreaming,
    }
  } catch {
    // Silently handle errors in production
    return null
  }
}

const ReplaceTextToolCall = memo(
  ({
    _part,
    toolCall,
    _chat,
  }: {
    _part: ToolUIPart
    toolCall: ToolCallDisplay
    _chat: ReturnType<typeof useChat>
  }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const outputObj =
      typeof toolCall.output === "object" && toolCall.output !== null
        ? (toolCall.output as { noteName?: string; success?: boolean })
        : undefined
    const noteNameFromResult = outputObj?.noteName

    const getStatusDotClass = (status: ToolCallStatus) => {
      switch (status) {
        case "success":
          return "bg-success"
        case "error":
          return "bg-destructive"
        case "pending":
          return "bg-warning"
        case "streaming":
          return ""
        default:
          return "bg-muted-foreground"
      }
    }

    const hasExpandableContent =
      toolCall.input !== undefined ||
      toolCall.output !== undefined ||
      !!toolCall.error

    const input = toolCall.input as
      | { text?: string; replaceWith?: string }
      | undefined

    return (
      <div className="text-xs text-muted-foreground">
        <div className="rounded-md border bg-muted/30 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center">
                {toolCall.status === "streaming" ? (
                  <Loading className="size-3" />
                ) : (
                  <span
                    className={cn(
                      "inline-block size-2 rounded-full",
                      getStatusDotClass(toolCall.status),
                    )}
                  />
                )}
              </div>
              <span className="text-xs font-medium text-foreground">
                Replace
              </span>
              {(noteNameFromResult ?? false) ? (
                <span className="text-xs text-muted-foreground">
                  in {noteNameFromResult}
                </span>
              ) : null}
            </div>
            {hasExpandableContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded((v) => !v)}
                className="h-6 px-2 text-xs"
              >
                {isExpanded ? "Hide details" : "Show details"}
              </Button>
            )}
          </div>

          {toolCall.error && (
            <div className="mt-2 rounded bg-background p-2 text-xs text-destructive">
              Error: {toolCall.error}
            </div>
          )}

          <AnimatePresence initial={false}>
            {isExpanded && hasExpandableContent && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {input && ("text" in input || "replaceWith" in input) && (
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="mb-1 text-xs text-muted-foreground">
                        Replaced
                      </div>
                      <div className="rounded border bg-background p-2 font-mono text-xs break-words whitespace-pre-wrap text-destructive">
                        {input.text ?? ""}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="mb-1 text-xs text-muted-foreground">
                        With
                      </div>
                      <div className="rounded border bg-background p-2 font-mono text-xs break-words whitespace-pre-wrap text-success">
                        {input.replaceWith ?? ""}
                      </div>
                    </div>
                  </div>
                )}

                {((toolCall.error ?? "").length > 0 ||
                  (typeof toolCall.output === "object" &&
                    toolCall.output !== null &&
                    (toolCall.output as { success?: boolean }).success ===
                      false)) && (
                  <div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      Result
                    </div>
                    <pre className="overflow-x-auto rounded border bg-background p-2 text-xs break-words whitespace-pre-wrap">
                      {typeof toolCall.output === "string"
                        ? toolCall.output
                        : JSON.stringify(toolCall.output, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  },
)
