"use client"

import { useRef, useState } from "react"
import type { Editor } from "@tiptap/react"
import { motion } from "motion/react"

import { useUpdateNoteContent } from "@ignita/hooks"
import type { TextNote } from "@ignita/lib/notes"
import { useDebounced } from "@ignita/lib/use-debounced"

import { NoteTitleStatus } from "../shared/note-title-status"
import type { NoteProp } from "../types"
import { useEditorContext } from "./editor-context"
import { Menu } from "./menu"
import { TextEditor } from "./text-editor"

export const Tiptap = ({ note }: { note: NoteProp<"text"> }) => {
  const [saving, setSaving] = useState(false)

  const editorRef = useRef<Editor | null>(null)
  const { setEditor, setDocId } = useEditorContext()

  const updateNoteContentMutation = useUpdateNoteContent({
    onMutate: () => setSaving(true),
    onSuccess: () => setSaving(false),
  })

  const { callback: debouncedUpdate, isPending: isTyping } = useDebounced(
    updateNoteContentMutation.mutate,
    1000,
  )

  return (
    <div className="relative size-full">
      <div className="size-full overflow-x-hidden overflow-y-auto">
        <div className="mx-auto min-h-full max-w-3xl px-6 pt-20 pb-20">
          <h1 className="hidden">{note.name}</h1>
          <NoteTitleStatus
            noteId={note.id}
            workspaceId={note.workspaceId}
            name={note.name}
            isTyping={isTyping}
            externalSaving={saving}
            onEnter={() => editorRef.current?.commands.focus()}
          />
          <div className="relative">
            <TextEditor
              docId={note.id}
              value={note.note.content}
              onChange={(content) =>
                debouncedUpdate({
                  id: note.id,
                  note: { type: "text", content } as TextNote,
                })
              }
              onEditorReady={(editor) => {
                editorRef.current = editor
                setEditor(editor)
                setDocId(note.id)
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
          className="absolute bottom-2 left-1/2 z-50 w-[calc(100%-calc(var(--spacing)*4))] -translate-x-1/2"
        >
          <Menu editor={editorRef.current} />
        </motion.div>
      )}
    </div>
  )
}
