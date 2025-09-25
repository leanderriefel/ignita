"use client"

import { useEffect, useState } from "react"
import { CheckIcon } from "lucide-react"

import { useUpdateNoteName } from "@ignita/hooks"

import { Loading } from "../../ui/loading"

type NoteTitleStatusProps = {
  noteId: string
  workspaceId: string
  name: string
  maxLength?: number
  isTyping?: boolean
  externalSaving?: boolean
  showStatus?: boolean
  onEnter?: () => void
  typingLabel?: string
  compact?: boolean
}

export const NoteTitleStatus = ({
  noteId,
  workspaceId,
  name,
  maxLength = 12,
  isTyping = false,
  externalSaving = false,
  showStatus = true,
  onEnter,
  typingLabel = "Typing",
  compact = false,
}: NoteTitleStatusProps) => {
  const [localName, setLocalName] = useState(name)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalName(name)
  }, [name])

  const updateNoteNameMutation = useUpdateNoteName(
    { workspaceId },
    {
      onMutate: () => setSaving(true),
      onSuccess: () => setSaving(false),
    },
  )

  const effectiveSaving = saving || externalSaving
  const inputMarginClass = compact ? "mt-4" : "mt-10"
  const statusMarginClass = compact ? "mt-1 mb-4" : "mt-2 mb-10"

  return (
    <>
      <div className="flex justify-center">
        <input
          className={`${inputMarginClass} text-center text-3xl font-medium tracking-wide decoration-foreground underline-offset-8 focus:outline-none focus-visible:underline`}
          value={localName}
          maxLength={maxLength}
          minLength={0}
          onInput={(e) => setLocalName(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.currentTarget.blur()
              onEnter?.()
            }
          }}
          onBlur={() => {
            if (!localName) return
            updateNoteNameMutation.mutate({ id: noteId, name: localName })
          }}
        />
      </div>
      {showStatus && (
        <div className={`${statusMarginClass} flex w-full justify-center`}>
          <p className="inline-flex w-fit items-center gap-x-2 rounded-sm border py-0.5 pr-3.5 pl-4 text-xs">
            {isTyping ? typingLabel : effectiveSaving ? "Saving" : "Saved"}
            {(effectiveSaving || isTyping) && <Loading className="size-3" />}
            {!isTyping && !effectiveSaving && <CheckIcon className="size-3" />}
          </p>
        </div>
      )}
    </>
  )
}
