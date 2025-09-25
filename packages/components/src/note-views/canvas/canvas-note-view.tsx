"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import nextDynamic from "next/dynamic"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types"

import { useUpdateNoteContent } from "@ignita/hooks"
import type { CanvasNote } from "@ignita/lib/notes"
import { useDebounced } from "@ignita/lib/use-debounced"

import { useTheme } from "../../theme/theme-provider"
import { NoteTitleStatus } from "../shared/note-title-status"
import type { NoteProp } from "../types"

import "@excalidraw/excalidraw/index.css"
import "./excalidraw.css"

const Excalidraw = nextDynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
)

export const CanvasNoteView = ({ note }: { note: NoteProp<"canvas"> }) => {
  const { theme } = useTheme()
  const [saving, setSaving] = useState(false)

  const updateNoteContentMutation = useUpdateNoteContent({
    onMutate: () => setSaving(true),
    onSuccess: () => setSaving(false),
  })

  const { callback: debouncedUpdate, isPending: isDrawing } = useDebounced(
    updateNoteContentMutation.mutate,
    1000,
  )

  const serializedElements = useMemo(
    () => JSON.stringify(note.note.content.elements ?? []),
    [note.note.content.elements],
  )

  const lastSerializedRef = useRef(serializedElements)
  const skipInitialChangeRef = useRef(true)

  useEffect(() => {
    lastSerializedRef.current = serializedElements
    skipInitialChangeRef.current = true
  }, [serializedElements])

  const syncScene = useCallback(
    (elements: readonly ExcalidrawElement[]) => {
      if (skipInitialChangeRef.current) {
        skipInitialChangeRef.current = false
        return
      }

      const serialized = JSON.stringify(elements)
      if (serialized === lastSerializedRef.current) return

      lastSerializedRef.current = serialized
      const nextElements = elements.map((element) => ({
        ...element,
      })) as ExcalidrawElement[]

      debouncedUpdate({
        id: note.id,
        note: {
          type: "canvas",
          content: {
            elements: nextElements,
          },
        } satisfies CanvasNote,
      })
    },
    [debouncedUpdate, note.id],
  )

  const initialScene = useMemo(
    () => ({
      appState: {
        currentItemFontFamily: 1,
      },
      elements: note.note.content.elements,
    }),
    [note.note.content.elements],
  )

  return (
    <div className="excalidraw-wrapper flex size-full flex-col">
      <div className="pt-10 pb-2">
        <h1 className="hidden">{note.name}</h1>
        <NoteTitleStatus
          noteId={note.id}
          workspaceId={note.workspaceId}
          name={note.name}
          isTyping={isDrawing}
          externalSaving={saving}
          typingLabel="Drawing"
          compact
        />
      </div>
      <div className="flex min-h-0 grow overflow-hidden rounded-t-xl">
        <Excalidraw
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              toggleTheme: false,
            },
          }}
          theme={theme.variant}
          initialData={initialScene}
          onChange={(elements) => {
            syncScene(elements)
          }}
        />
      </div>
    </div>
  )
}
