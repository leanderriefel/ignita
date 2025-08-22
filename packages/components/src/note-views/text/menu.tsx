import { useEditorState, type Editor } from "@tiptap/react"
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

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
      isTrackingChanges: ctx.editor.storage.changes.isTracking(),
    }),
  })

  return (
    <motion.div
      className={cn(
        "mx-auto grid w-fit grid-cols-1 overflow-hidden overflow-x-auto rounded-xl border bg-background p-1 shadow-sm",
        {
          "grid-rows-2": editorState.isTrackingChanges,
          "grid-rows-1": !editorState.isTrackingChanges,
        },
      )}
      layout="size"
    >
      <div className="flex items-center gap-2">
        <Toggle
          className="shrink-0"
          size="square"
          pressed={editorState.isBold}
          onPressedChange={() => {
            editor.chain().focus().toggleBold().run()
          }}
        >
          <BoldIcon className="size-4" />
        </Toggle>
        <Toggle
          className="shrink-0"
          size="square"
          pressed={editorState.isItalic}
          onPressedChange={() => {
            editor.chain().focus().toggleItalic().run()
          }}
        >
          <ItalicIcon className="size-4" />
        </Toggle>
        <Toggle
          className="shrink-0"
          size="square"
          pressed={editorState.isUnderline}
          onPressedChange={() => {
            editor.chain().focus().toggleUnderline().run()
          }}
        >
          <UnderlineIcon className="size-4" />
        </Toggle>
        <Toggle
          className="shrink-0"
          size="square"
          pressed={editorState.isStrikethrough}
          onPressedChange={() => {
            editor.chain().focus().toggleStrike().run()
          }}
        >
          <StrikethroughIcon className="size-4" />
        </Toggle>
        <Toggle
          className="shrink-0"
          size="square"
          pressed={editorState.isCode}
          onPressedChange={() => {
            editor.chain().focus().toggleCode().run()
          }}
        >
          <CodeIcon className="size-4" />
        </Toggle>
      </div>
    </motion.div>
  )
}
