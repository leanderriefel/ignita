import { useEditorState, type Editor } from "@tiptap/react"

import { Toggle } from "../../ui/toggle"

export const Menu = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
      isStrikethrough: ctx.editor.isActive("strike"),
      isCode: ctx.editor.isActive("code"),
      isBlockquote: ctx.editor.isActive("blockquote"),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      isTaskList: ctx.editor.isActive("taskList"),
      isCodeBlock: ctx.editor.isActive("codeBlock"),
      isHeading: ctx.editor.isActive("heading"),
      isParagraph: ctx.editor.isActive("paragraph"),
    }),
  })

  return (
    <div className="flex overflow-hidden rounded-md border bg-background shadow-sm">
      <Toggle
        className="rounded-none font-bold"
        pressed={editorState.isBold}
        onPressedChange={() => {
          editor.chain().focus().toggleBold().run()
        }}
      >
        B
      </Toggle>
      <Toggle
        className="rounded-none italic"
        pressed={editorState.isItalic}
        onPressedChange={() => {
          editor.chain().focus().toggleItalic().run()
        }}
      >
        I
      </Toggle>
      <Toggle
        className="rounded-none underline"
        pressed={editorState.isUnderline}
        onPressedChange={() => {
          editor.chain().focus().toggleUnderline().run()
        }}
      >
        U
      </Toggle>
      <Toggle
        className="rounded-none line-through"
        pressed={editorState.isStrikethrough}
        onPressedChange={() => {
          editor.chain().focus().toggleStrike().run()
        }}
      >
        S
      </Toggle>
      <Toggle
        className="rounded-none font-geist-mono"
        pressed={editorState.isCode}
        onPressedChange={() => {
          editor.chain().focus().toggleCode().run()
        }}
      >
        C
      </Toggle>
    </div>
  )
}
