"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon } from "@radix-ui/react-icons"
import type { Editor } from "@tiptap/react"
import { motion } from "motion/react"

import { useUpdateNoteContent, useUpdateNoteName } from "@ignita/hooks"
import type { TextNote } from "@ignita/lib/notes"
import { useDebounced } from "@ignita/lib/use-debounced"

import { Loading } from "../../ui/loading"
import type { NoteProp } from "../types"
import { Menu } from "./menu"
import { TextEditor } from "./text-editor"

export const Tiptap = ({ note }: { note: NoteProp<"text"> }) => {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(note.name)

  const editorRef = useRef<Editor | null>(null)

  const updateNoteContentMutation = useUpdateNoteContent({
    onMutate: () => setSaving(true),
    onSuccess: () => setSaving(false),
  })

  const { callback: debouncedUpdate, isPending: isTyping } = useDebounced(
    updateNoteContentMutation.mutate,
    1000,
  )

  const updateNoteNameMutation = useUpdateNoteName(
    { workspaceId: note.workspaceId },
    {
      onMutate: () => setSaving(true),
      onSuccess: () => setSaving(false),
    },
  )

  // Sync `name` when note changes
  useEffect(() => {
    setName(note.name)
  }, [note.name])

  return (
    <div className="relative size-full">
      <div className="size-full overflow-x-hidden overflow-y-auto">
        <div className="mx-auto min-h-full max-w-3xl px-6 pt-20 pb-20">
          <h1 className="hidden">{note.name}</h1>
          <div className="flex justify-center">
            <input
              className="mt-10 text-center text-3xl font-medium tracking-wide decoration-foreground underline-offset-8 focus:outline-none focus-visible:underline"
              value={name}
              maxLength={12}
              minLength={0}
              onInput={(e) => setName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  e.currentTarget.blur()
                  editorRef.current?.commands.focus()
                }
              }}
              onBlur={() => {
                if (!name) return
                updateNoteNameMutation.mutate({ id: note.id, name })
              }}
            />
          </div>
          <div className="mt-2 mb-10 flex w-full justify-center">
            <p className="inline-flex w-fit items-center gap-x-1 rounded-sm border py-0.5 pr-3.5 pl-4 text-xs">
              {isTyping ? "Typing" : saving ? "Saving" : "Saved"}
              {(saving || isTyping) && <Loading className="size-3" />}
              {!isTyping && !saving && <CheckIcon className="size-3" />}
            </p>
          </div>
          <div className="relative">
            <TextEditor
              value={note.note.content}
              onChange={(content) =>
                debouncedUpdate({
                  id: note.id,
                  note: { type: "text", content } as TextNote,
                })
              }
              onEditorReady={(editor) => {
                editorRef.current = editor
              }}
            />
          </div>
        </div>
      </div>
      {editorRef.current && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-2 left-1/2 z-50 -translate-x-1/2"
        >
          <Menu editor={editorRef.current} />
        </motion.div>
      )}
    </div>
  )
}
