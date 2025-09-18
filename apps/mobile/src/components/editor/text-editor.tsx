"use dom"

import "~/app/global.css"
import "./tiptap.css"
import "./codeblock.css"
import "katex/dist/katex.min.css"

import { useEffect, useRef } from "react"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Highlight } from "@tiptap/extension-highlight"
import { Mathematics } from "@tiptap/extension-mathematics"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { EditorContent, JSONContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { all, createLowlight } from "lowlight"

import { cn } from "@ignita/lib"

export interface TextEditorProps {
  /** Current editor value */
  value: JSONContent
  /** Stable identity of the current document (noteId, cardId, etc.) */
  docId?: string | null
  /** Called whenever the user changes the document */
  onChange?: (content: JSONContent) => Promise<void>
  /** Optional placeholder shown for empty documents */
  placeholder?: string
  /** Disable editing */
  editable?: boolean
  /** Additional class names passed to the underlying EditorContent */
  className?: string
  /** Called once the internal editor instance is ready */
  onReady?: () => Promise<void>
  /** Webview Properties */
  dom?: import("expo/dom").DOMProps
}

const TextEditor = ({
  value,
  docId,
  onChange,
  placeholder = "start editing ...",
  editable = true,
  className,
  onReady,
}: TextEditorProps) => {
  const isUpdatingProgrammatically = useRef(false)

  const lowlight = createLowlight(all)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Mathematics,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      if (isUpdatingProgrammatically.current) return
      void onChange?.(editor.getJSON())
    },
    immediatelyRender: true,
  })

  const areJsonContentsEqual = (a: JSONContent, b: JSONContent) =>
    JSON.stringify(a) === JSON.stringify(b)

  useEffect(() => {
    if (!editor) return
    void onReady?.()
  }, [editor, onReady])

  // Sync when the document identity changes
  useEffect(() => {
    if (!editor) return
    if (docId == null) return

    isUpdatingProgrammatically.current = true
    editor.commands.setContent(value)
    isUpdatingProgrammatically.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!editor) {
    return (
      <div className="flex size-full items-center justify-center p-4 text-center">
        Loading editor...
      </div>
    )
  }

  return (
    <div className="size-full overflow-x-hidden overflow-y-visible">
      <EditorContent
        editor={editor}
        className={cn(
          "size-full cursor-text overflow-x-hidden overflow-y-visible border-0",
          "h-full min-h-full w-full text-base leading-relaxed",
          "antialiased caret-foreground selection:bg-primary/25",
          "outline-none focus:outline-none focus-visible:outline-none",
          className,
        )}
      />
    </div>
  )
}

export default TextEditor
