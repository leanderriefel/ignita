import { memo, useState } from "react"
import type { ToolUIPart } from "ai"
import { CheckIcon, Circle, Clock, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { useEditorContext } from "../../note-views/text/editor-context"
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

export const ToolPart = memo(({ part }: { part: ToolUIPart }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Extract tool call information from the part data
  const toolCall = extractToolCall(part)

  if (!toolCall) {
    return null
  }

  if (toolCall.toolName === "replaceText") {
    return <ReplaceTextToolCall part={part} />
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
})

const ToolCallItem = memo(({ toolCall }: { toolCall: ToolCallDisplay }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = (status: ToolCallStatus) => {
    switch (status) {
      case "success":
        return <CheckIcon className="size-3 text-green-600" />
      case "error":
        return <XIcon className="size-3 text-red-600" />
      case "pending":
        return <Clock className="size-3 text-yellow-600" />
      case "streaming":
        return <Loading className="size-3" />
      default:
        return <Circle className="size-3 text-muted-foreground" />
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
            {getStatusIcon(toolCall.status)}
          </div>
          <span className="text-xs font-medium text-foreground">
            {toolCall.toolName}
          </span>
          <span className="text-xs text-muted-foreground">
            ({toolCall.toolCallId.slice(-8)})
          </span>
        </div>
        {hasExpandableContent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded((v) => !v)}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? "Hide" : "Show"}
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

const ReplaceTextToolCall = memo(({ part }: { part: ToolUIPart }) => {
  const { editor, docId } = useEditorContext()

  switch (part.state) {
    case "input-streaming":
      return <div>Agent is preparing to edit note ...</div>
    case "input-available":
      return <div>Confirm the changes to replace the text in the note.</div>
    case "output-available":
      return <div>The text has been replaced in the note.</div>
    case "output-error":
      return <div>The replacement has errored out.</div>
  }
})
