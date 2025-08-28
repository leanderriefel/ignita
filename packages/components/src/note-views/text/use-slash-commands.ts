import type React from "react"
import type { Editor } from "@tiptap/react"
import {
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  TypeIcon,
} from "lucide-react"

export interface SlashCommandItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  command: (editor: Editor) => void
  group: string
}

export const useSlashCommands = () => {
  const getSlashCommandItems = (_editor: Editor): SlashCommandItem[] => [
    // Headings
    {
      title: "Heading 1",
      description: "Large heading",
      icon: Heading1Icon,
      command: (editor) =>
        editor.chain().focus().setHeading({ level: 1 }).run(),
      group: "Headings",
    },
    {
      title: "Heading 2",
      description: "Medium heading",
      icon: Heading2Icon,
      command: (editor) =>
        editor.chain().focus().setHeading({ level: 2 }).run(),
      group: "Headings",
    },
    {
      title: "Heading 3",
      description: "Small heading",
      icon: Heading3Icon,
      command: (editor) =>
        editor.chain().focus().setHeading({ level: 3 }).run(),
      group: "Headings",
    },

    // Lists
    {
      title: "Bullet List",
      description: "Create a bullet list",
      icon: ListIcon,
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
      group: "Lists",
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: ListOrderedIcon,
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
      group: "Lists",
    },

    // Blocks
    {
      title: "Quote",
      description: "Create a blockquote",
      icon: QuoteIcon,
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      group: "Blocks",
    },
    {
      title: "Code Block",
      description: "Create a code block",
      icon: CodeIcon,
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      group: "Blocks",
    },
    {
      title: "Paragraph",
      description: "Create a paragraph",
      icon: TypeIcon,
      command: (editor) => editor.chain().focus().setParagraph().run(),
      group: "Blocks",
    },
  ]

  return { getSlashCommandItems }
}
