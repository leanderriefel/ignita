"use client"

import "./tiptap.css"
import "./codeblock.css"
import "katex/dist/katex.min.css"
import "prosemirror-suggestion-mode/style/suggestion-mode.css"

import { useEffect, useMemo, useRef } from "react"
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react"

import { cn } from "@ignita/lib"

import Changes from "./changes"
import { createTextEditorExtensions } from "./extensions"

export interface TextEditorProps {
  /** Current editor value */
  value: JSONContent
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
  onChange,
  placeholder = "start editing ...",
  editable = true,
  className,
  onEditorReady,
}: TextEditorProps) => {
  const isUpdatingProgrammatically = useRef(false)

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
    },
    immediatelyRender: true,
  })

  // Notify parent when the editor instance becomes available
  useEffect(() => {
    if (!editor) return

    onEditorReady?.(editor)
  }, [editor, onEditorReady])

  // Keep editor in sync when the external value changes
  useEffect(() => {
    if (!editor) return

    isUpdatingProgrammatically.current = true
    editor.commands.setContent(value)
    isUpdatingProgrammatically.current = false
  }, [value, editor])

  return (
    <EditorContent
      editor={editor}
      spellCheck="false"
      className={cn("cursor-text", className)}
    />
  )
}

