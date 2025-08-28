import type { AnyExtension } from "@tiptap/core"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Color } from "@tiptap/extension-color"
import { Highlight } from "@tiptap/extension-highlight"
import { Mathematics } from "@tiptap/extension-mathematics"
import { Placeholder } from "@tiptap/extension-placeholder"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { StarterKit } from "@tiptap/starter-kit"
import { all, createLowlight } from "lowlight"

import Changes from "./changes"

export type CreateTextEditorExtensionsOptions = {
  placeholder?: string
  includeChanges?: boolean
  includePlaceholder?: boolean
}

export const createTextEditorExtensions = (
  options: CreateTextEditorExtensionsOptions = {},
): AnyExtension[] => {
  const placeholder = options.placeholder ?? "start editing ..."
  const includeChanges = options.includeChanges ?? true
  const includePlaceholder = options.includePlaceholder ?? true

  const lowlight = createLowlight(all)

  const extensions: (AnyExtension | null)[] = [
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
    includePlaceholder ? Placeholder.configure({ placeholder }) : null,
    CodeBlockLowlight.configure({ lowlight }),
    Mathematics,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    includeChanges ? Changes : null,
  ]

  return extensions.filter(Boolean) as AnyExtension[]
}

export const createTextEditorExtensionsServer = (
  options: Omit<
    CreateTextEditorExtensionsOptions,
    "includeChanges" | "includePlaceholder"
  > = {},
): AnyExtension[] => {
  return createTextEditorExtensions({
    ...options,
    includeChanges: false,
    includePlaceholder: false,
  })
}
