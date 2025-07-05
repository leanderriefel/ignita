"use client"

import "./tiptap.css"
import "./theme.css"

import { useEffect, useMemo, useRef } from "react"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Placeholder } from "@tiptap/extension-placeholder"
import {
  EditorContent,
  useEditor,
  type Content,
  type Editor,
} from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { all, createLowlight } from "lowlight"

import { LaTeX } from "./extensions/latex"

export interface TextEditorProps {
  /** Current editor value */
  value: Content
  /** Called whenever the user changes the document */
  onChange?: (content: Content) => void
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
  const lowlight = useMemo(() => createLowlight(all), [])
  const isUpdatingProgrammatically = useRef(false)

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      LaTeX,
    ],
    [placeholder, lowlight],
  )

  const editor = useEditor({
    extensions,
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      if (isUpdatingProgrammatically.current) return
      onChange?.(editor.getJSON())
    },
    immediatelyRender: false,
  })

  // Notify parent when the editor instance becomes available
  useEffect(() => {
    if (editor) {
      onEditorReady?.(editor)
    }
  }, [editor, onEditorReady])

  // Keep editor in sync when the external value changes
  useEffect(() => {
    if (!editor) return

    isUpdatingProgrammatically.current = true
    editor.commands.setContent(value)
    isUpdatingProgrammatically.current = false
  }, [value, editor])

  return (
    <EditorContent editor={editor} spellCheck="false" className={className} />
  )
}
