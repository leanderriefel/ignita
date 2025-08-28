"use client"

import { useState } from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@ignita/lib"

import { Button } from "../../ui/button"
import { Toggle } from "../../ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"
import { SimpleColorPicker } from "./color-picker"

const TEXT_COLORS = [
  "#000000",
  "#374151",
  "#6B7280",
  "#9CA3AF",
  "#D1D5DB",
  "#1F2937",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#7C3AED",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
]

const HIGHLIGHT_COLORS = [
  "#FEF3C7",
  "#DBEAFE",
  "#D1FAE5",
  "#FCE7F3",
  "#E0E7FF",
  "#FEF2F2",
  "#FFF7ED",
  "#F0FDF4",
  "#FAFAFA",
  "#F3F4F6",
]

export const Menu = ({ editor }: { editor: Editor }) => {
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showHighlightColorPicker, setShowHighlightColorPicker] =
    useState(false)

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      // Basic marks
      isBold: ctx.editor.isActive("bold"),
      isItalic: ctx.editor.isActive("italic"),
      isUnderline: ctx.editor.isActive("underline"),
      isStrikethrough: ctx.editor.isActive("strike"),
      isCode: ctx.editor.isActive("code"),

      // Headings
      isHeading1: ctx.editor.isActive("heading", { level: 1 }),
      isHeading2: ctx.editor.isActive("heading", { level: 2 }),
      isHeading3: ctx.editor.isActive("heading", { level: 3 }),
      isHeading4: ctx.editor.isActive("heading", { level: 4 }),

      // Lists
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),

      // Other blocks
      isBlockquote: ctx.editor.isActive("blockquote"),
      isCodeBlock: ctx.editor.isActive("codeBlock"),

      // Text alignment
      isAlignLeft: ctx.editor.isActive({ textAlign: "left" }),
      isAlignCenter: ctx.editor.isActive({ textAlign: "center" }),
      isAlignRight: ctx.editor.isActive({ textAlign: "right" }),
      isAlignJustify: ctx.editor.isActive({ textAlign: "justify" }),

      // Text styling
      textColor: ctx.editor.getAttributes("textStyle")?.color ?? "",
      highlightColor: ctx.editor.getAttributes("highlight")?.color ?? "",

      // Changes tracking
      isTrackingChanges: ctx.editor.storage.changes.isTracking(),
    }),
  })

  const handleMarkToggle = (mark: string) => {
    const commands: Record<string, () => void> = {
      bold: () => editor.chain().focus().toggleBold().run(),
      italic: () => editor.chain().focus().toggleItalic().run(),
      underline: () => editor.chain().focus().toggleUnderline().run(),
      strike: () => editor.chain().focus().toggleStrike().run(),
      code: () => editor.chain().focus().toggleCode().run(),
    }
    commands[mark]?.()
  }

  const handleHeadingToggle = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  const handleListToggle = (type: "bulletList" | "orderedList") => {
    const commands: Record<string, () => void> = {
      bulletList: () => editor.chain().focus().toggleBulletList().run(),
      orderedList: () => editor.chain().focus().toggleOrderedList().run(),
    }
    commands[type]?.()
  }

  const handleBlockToggle = (block: string) => {
    const commands: Record<string, () => void> = {
      blockquote: () => editor.chain().focus().toggleBlockquote().run(),
      codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
    }
    commands[block]?.()
  }

  const handleAlignment = (align: string) => {
    editor.chain().focus().setTextAlign(align).run()
  }

  const handleUndo = () => editor.chain().focus().undo().run()
  const handleRedo = () => editor.chain().focus().redo().run()

  const handleColorSelect = (color: string) => {
    if (color) {
      editor.chain().focus().setColor(color).run()
    } else {
      editor.chain().focus().unsetColor().run()
    }
  }

  const handleHighlightSelect = (color: string) => {
    if (color) {
      editor.chain().focus().setHighlight({ color }).run()
    } else {
      editor.chain().focus().unsetHighlight().run()
    }
  }

  const canUndo = editor.can().undo()
  const canRedo = editor.can().redo()

  return (
    <motion.div
      className={cn(
        "mx-auto w-fit rounded-xl border bg-background p-1 shadow-sm",
        "max-w-[calc(100vw-2rem)]",
        "xs:max-w-none",
      )}
      layout="size"
    >
      {/* Toolbar: single row; horizontally scrollable on small screens */}
      <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto [scrollbar-width:thin] sm:overflow-x-visible">
        {/* Group: Text formatting */}
        <div className="flex items-center justify-center gap-1">
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isBold}
            onPressedChange={() => handleMarkToggle("bold")}
          >
            <BoldIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isItalic}
            onPressedChange={() => handleMarkToggle("italic")}
          >
            <ItalicIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isUnderline}
            onPressedChange={() => handleMarkToggle("underline")}
          >
            <UnderlineIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isStrikethrough}
            onPressedChange={() => handleMarkToggle("strike")}
          >
            <StrikethroughIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isCode}
            onPressedChange={() => handleMarkToggle("code")}
          >
            <CodeIcon className="size-4" />
          </Toggle>
        </div>

        <div className="mx-1 h-6 w-px self-center bg-border" />

        {/* Group: Headings */}
        <div className="flex items-center justify-center gap-1">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Toggle
                className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
                size="square"
                pressed={editorState.isHeading1}
                onPressedChange={() => handleHeadingToggle(1)}
              >
                <Heading1Icon className="size-4" />
              </Toggle>
            </TooltipTrigger>
            <TooltipContent className="flex w-fit flex-col gap-y-1 rounded-xl p-1">
              <Toggle
                className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
                size="square"
                pressed={editorState.isHeading4}
                onPressedChange={() => handleHeadingToggle(4)}
              >
                <Heading4Icon className="size-4" />
              </Toggle>
              <Toggle
                className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
                size="square"
                pressed={editorState.isHeading3}
                onPressedChange={() => handleHeadingToggle(3)}
              >
                <Heading3Icon className="size-4" />
              </Toggle>
              <Toggle
                className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
                size="square"
                pressed={editorState.isHeading2}
                onPressedChange={() => handleHeadingToggle(2)}
              >
                <Heading2Icon className="size-4" />
              </Toggle>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mx-1 h-6 w-px self-center bg-border" />

        {/* Group: Lists & Quote */}
        <div className="flex items-center justify-center gap-1">
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isBulletList}
            onPressedChange={() => handleListToggle("bulletList")}
          >
            <ListIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isOrderedList}
            onPressedChange={() => handleListToggle("orderedList")}
          >
            <ListOrderedIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isBlockquote}
            onPressedChange={() => handleBlockToggle("blockquote")}
          >
            <QuoteIcon className="size-4" />
          </Toggle>
        </div>

        <div className="mx-1 h-6 w-px self-center bg-border" />

        {/* Group: Alignment */}
        <div className="flex items-center justify-center gap-1">
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isAlignLeft}
            onPressedChange={() => handleAlignment("left")}
          >
            <AlignLeftIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isAlignCenter}
            onPressedChange={() => handleAlignment("center")}
          >
            <AlignCenterIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isAlignRight}
            onPressedChange={() => handleAlignment("right")}
          >
            <AlignRightIcon className="size-4" />
          </Toggle>
          <Toggle
            className="size-8 shrink-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            pressed={editorState.isAlignJustify}
            onPressedChange={() => handleAlignment("justify")}
          >
            <AlignJustifyIcon className="size-4" />
          </Toggle>
        </div>

        <div className="mx-1 h-6 w-px self-center bg-border" />

        {/* Group: Colors */}
        <div className="flex items-center justify-center gap-1">
          <div className="relative z-101">
            <Button
              className={cn(
                "size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9",
                editorState.textColor && "bg-accent",
              )}
              size="square"
              variant="ghost"
              onClick={() => {
                setShowTextColorPicker(!showTextColorPicker)
                setShowHighlightColorPicker(false)
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: editorState.textColor ?? "#000000" }}
              >
                A
              </span>
            </Button>
            {showTextColorPicker && (
              <SimpleColorPicker
                colors={TEXT_COLORS}
                onColorSelect={handleColorSelect}
                isOpen={showTextColorPicker}
                onClose={() => setShowTextColorPicker(false)}
                title="Text Color"
              />
            )}
          </div>
          <div className="relative z-101">
            <Button
              className={cn(
                "size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9",
                editorState.highlightColor && "bg-accent",
              )}
              size="square"
              variant="ghost"
              onClick={() => {
                setShowHighlightColorPicker(!showHighlightColorPicker)
                setShowTextColorPicker(false)
              }}
            >
              <span
                className="rounded bg-yellow-200 px-0.5 text-xs font-bold"
                style={{
                  backgroundColor: editorState.highlightColor ?? "#FEF3C7",
                }}
              >
                A
              </span>
            </Button>
            {showHighlightColorPicker && (
              <SimpleColorPicker
                colors={HIGHLIGHT_COLORS}
                onColorSelect={handleHighlightSelect}
                isOpen={showHighlightColorPicker}
                onClose={() => setShowHighlightColorPicker(false)}
                title="Highlight"
              />
            )}
          </div>
        </div>

        <div className="mx-1 h-6 w-px self-center bg-border" />

        {/* Group: Link & History */}
        <div className="flex items-center justify-center gap-1">
          <Button
            className="size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            variant="ghost"
            onClick={() => {
              editor.commands.focus()
            }}
          >
            <LinkIcon className="size-4" />
          </Button>
          <Button
            className="size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            variant="ghost"
            disabled={!canUndo}
            onClick={handleUndo}
          >
            <Undo2Icon className="size-4" />
          </Button>
          <Button
            className="size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9"
            size="square"
            variant="ghost"
            disabled={!canRedo}
            onClick={handleRedo}
          >
            <Redo2Icon className="size-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
