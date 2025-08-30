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
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Toggle } from "../../ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"

type ThemeColors = {
  textColors: string[]
  highlightColors: string[]
}

const THEME_COLORS: ThemeColors = {
  textColors: [
    "var(--text-color-900)",
    "var(--text-color-800)",
    "var(--text-color-700)",
    "var(--text-color-600)",
    "var(--text-color-500)",
    "var(--text-color-400)",
    "var(--text-color-300)",
    "var(--text-color-200)",
    "var(--text-color-100)",
    "var(--text-accent-blue)",
    "var(--text-accent-green)",
    "var(--text-accent-yellow)",
    "var(--text-accent-red)",
    "var(--text-accent-purple)",
    "var(--text-accent-pink)",
    "var(--text-accent-cyan)",
    "var(--text-accent-lime)",
  ],
  highlightColors: [
    "var(--highlight-yellow)",
    "var(--highlight-blue)",
    "var(--highlight-green)",
    "var(--highlight-pink)",
    "var(--highlight-purple)",
    "var(--highlight-orange)",
    "var(--highlight-gray-light)",
    "var(--highlight-gray-dark)",
  ],
}

export const Menu = ({ editor }: { editor: Editor }) => {
  const [openPopover, setOpenPopover] = useState<
    "textColor" | "highlight" | "link" | null
  >(null)
  const [linkUrl, setLinkUrl] = useState("")

  const { textColors, highlightColors } = THEME_COLORS

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
      textColor: ctx.editor.getAttributes("textStyle")?.color,
      highlightColor: ctx.editor.getAttributes("highlight")?.color,

      // Changes tracking
      isTrackingChanges: ctx.editor.storage.changes.isTracking(),

      // Link
      isLink: ctx.editor.isActive("link"),
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

  const applyLink = () => {
    const raw = linkUrl.trim()
    if (!raw) return
    const hasProtocol = /^(https?:)?\/\//i.test(raw)
    const href = hasProtocol ? raw : `https://${raw}`
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run()
    setOpenPopover(null)
  }

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
    setOpenPopover(null)
  }

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
          <Popover
            open={openPopover === "textColor"}
            onOpenChange={(open) => setOpenPopover(open ? "textColor" : null)}
          >
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9",
                  {
                    "bg-accent": editorState.textColor,
                  },
                )}
                size="square"
                variant="ghost"
              >
                <span
                  className="text-xs font-bold"
                  style={{
                    color: editorState.textColor ?? THEME_COLORS.textColors[0],
                  }}
                >
                  A
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="m-2 min-w-48 p-3"
              align="start"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="mb-2 text-xs font-medium text-foreground/70">
                Text Color
              </div>
              <div className="flex flex-wrap gap-2">
                {textColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "size-8 cursor-pointer rounded border-2 border-transparent transition-colors hover:border-ring",
                      {
                        "border-3 border-ring": editorState.textColor === color,
                      },
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      handleColorSelect(color)
                      setOpenPopover(null)
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-3 border-t pt-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    handleColorSelect("")
                    setOpenPopover(null)
                  }}
                  variant="outline"
                  size="xs"
                >
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={openPopover === "highlight"}
            onOpenChange={(open) => setOpenPopover(open ? "highlight" : null)}
          >
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9",
                  {
                    "bg-accent": editorState.highlightColor,
                  },
                )}
                size="square"
                variant="ghost"
              >
                <span
                  className="rounded px-1 py-0.5 text-xs font-bold"
                  style={{
                    backgroundColor:
                      editorState.highlightColor ??
                      THEME_COLORS.highlightColors[0],
                  }}
                >
                  A
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="m-2 min-w-48 p-3"
              align="start"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="mb-2 text-xs font-medium text-foreground/70">
                Highlight
              </div>
              <div className="flex flex-wrap gap-2">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "size-8 cursor-pointer rounded border-2 border-transparent transition-colors hover:border-ring",
                      {
                        "border-3 border-ring":
                          editorState.highlightColor === color,
                      },
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      handleHighlightSelect(color)
                      setOpenPopover(null)
                    }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-3 border-t pt-3">
                <Button
                  className="w-full"
                  onClick={() => {
                    handleHighlightSelect("")
                    setOpenPopover(null)
                  }}
                  variant="outline"
                  size="xs"
                >
                  Reset
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mx-1 h-6 w-px self-center bg-border" />

        {/* Group: Link & History */}
        <div className="flex items-center justify-center gap-1">
          <Popover
            open={openPopover === "link"}
            onOpenChange={(open) => {
              setOpenPopover(open ? "link" : null)
              if (open) {
                const current = editor.getAttributes("link")?.href ?? ""
                setLinkUrl(current)
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                className={cn(
                  "size-8 shrink-0 p-0 max-sm:min-h-9 max-sm:min-w-9",
                  { "bg-accent": editorState.isLink },
                )}
                size="square"
                variant="ghost"
              >
                <LinkIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="m-2 min-w-56 p-3"
              align="start"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="flex flex-col gap-2">
                <div className="space-y-1">
                  <Label htmlFor="menu-link-input" className="text-xs">
                    Link
                  </Label>
                  <Input
                    id="menu-link-input"
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyLink()
                    }}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="xs"
                    onClick={applyLink}
                    disabled={!linkUrl.trim()}
                  >
                    Apply
                  </Button>
                  {editorState.isLink ? (
                    <Button size="xs" variant="outline" onClick={removeLink}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
