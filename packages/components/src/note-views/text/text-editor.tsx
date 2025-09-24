"use client"

import "./tiptap.css"
import "./codeblock.css"
import "katex/dist/katex.min.css"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react"

import { cn } from "@ignita/lib"

import { createTextEditorExtensions } from "./extensions"
import { SlashDropdown } from "./slash-dropdown"

export interface TextEditorProps {
  /** Current editor value */
  value: JSONContent
  /** Stable identity of the current document (noteId, cardId, etc.) */
  docId?: string | null
  /** Called whenever the user changes the document */
  onChange?: (content: JSONContent) => void
  /** Optional placeholder shown for empty documents */
  placeholder?: string
  /** Disable editing */
  editable?: boolean
  /** Additional class names passed to the underlying EditorContent */
  className?: string
  /** Called once the internal editor instance is ready */
  onEditorReady?: (editor: Editor) => void
}

export const TextEditor = ({
  value,
  docId,
  onChange,
  placeholder = "start editing ...",
  editable = true,
  className,
  onEditorReady,
}: TextEditorProps) => {
  const isUpdatingProgrammatically = useRef(false)
  const [slashCommandState, setSlashCommandState] = useState<{
    isOpen: boolean
    query: string
    position: { x: number; y: number }
  }>({ isOpen: false, query: "", position: { x: 0, y: 0 } })

  const query = slashCommandState.query ?? ""

  const extensions = useMemo(
    () => createTextEditorExtensions({ placeholder, includeChanges: true }),
    [placeholder],
  )

  const editor = useEditor({
    extensions,
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      if (isUpdatingProgrammatically.current) return
      onChange?.(editor.getJSON())

      // Check for slash commands
      const { state } = editor
      const { from } = state.selection
      const text = state.doc.textBetween(Math.max(0, from - 50), from, "\n")

      const slashMatch = text.match(/\/(\w*)$/)
      if (slashMatch) {
        const slashQuery = slashMatch[1] ?? ""
        const coords = editor.view.coordsAtPos(from)

        setSlashCommandState({
          isOpen: true,
          query: slashQuery,
          position: { x: coords.left, y: coords.bottom },
        })
      } else {
        setSlashCommandState((prev) => ({ ...prev, isOpen: false }))
      }
    },
    onCreate: ({ editor }) => {
      // Add keydown handler for slash commands
      editor.view.dom.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && slashCommandState.isOpen) {
          setSlashCommandState((prev) => ({ ...prev, isOpen: false }))
        }
      })
    },
    immediatelyRender: true,
  })

  // Notify parent when the editor instance becomes available
  useEffect(() => {
    if (!editor) return

    onEditorReady?.(editor)
  }, [editor, onEditorReady])

  const areJsonContentsEqual = (a: JSONContent, b: JSONContent) =>
    JSON.stringify(a) === JSON.stringify(b)

  // Sync when the document identity changes
  useEffect(() => {
    if (!editor) return
    editor.commands.setChangesDocId(docId ?? null)

    if (docId == null) return

    isUpdatingProgrammatically.current = true
    editor.commands.setContent(value)
    isUpdatingProgrammatically.current = false
  }, [docId, editor])

  // Fallback: if no docId provided, sync only on meaningful external changes
  useEffect(() => {
    if (!editor) return
    if (docId != null) return

    const current = editor.getJSON()
    if (areJsonContentsEqual(current, value)) return

    isUpdatingProgrammatically.current = true
    editor.commands.setContent(value)
    isUpdatingProgrammatically.current = false
  }, [value, editor, docId])

  // Handle slash command selection
  const handleSlashCommandSelect = (item: {
    command: (editor: Editor) => void
  }) => {
    if (!editor) return

    // Remove the slash command text
    const { state } = editor
    const { from } = state.selection
    const text = state.doc.textBetween(Math.max(0, from - 50), from, "\n")
    const slashMatch = text.match(/\/(\w*)$/)

    if (slashMatch) {
      const startPos = from - slashMatch[0].length
      editor.chain().focus().deleteRange({ from: startPos, to: from }).run()
    }

    // Execute the command
    item.command(editor)
    setSlashCommandState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleSlashCommandClose = () => {
    setSlashCommandState((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <div className="relative">
      <EditorContent
        editor={editor}
        spellCheck="false"
        className={cn("tiptap cursor-text", className)}
      />
      {editor && (
        <SlashDropdown
          editor={editor}
          isOpen={slashCommandState.isOpen}
          query={query}
          position={slashCommandState.position}
          onClose={handleSlashCommandClose}
          onSelect={handleSlashCommandSelect}
        />
      )}
    </div>
  )
}
