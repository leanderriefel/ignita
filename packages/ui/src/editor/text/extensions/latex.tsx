import { cn } from "@/lib/utils"
import { Extension, getChangedRanges } from "@tiptap/core"
import { type Node as ProseMirrorNode } from "@tiptap/pm/model"
import {
  Plugin,
  PluginKey,
  type EditorState,
  type Transaction,
} from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"
import katex from "katex"

import "katex/dist/katex.min.css"

interface LaTeXDecorationSpec {
  content: string
  isEditable: boolean
  isEditing: boolean
  katexOptions?: katex.KatexOptions
}

interface LaTeXPluginState {
  decorations: DecorationSet | undefined
  isEditable: boolean | undefined
}

interface CalculateChangedRangeResult {
  minFrom: number
  maxTo: number
}

/**
 * Calculate the minimum and maximum range of document changes or selection changes.
 */
const calculateChangedRange = (
  prevState: EditorState,
  prevPluginState: LaTeXPluginState,
  isEditable: boolean,
  transaction: Transaction,
  oldState: EditorState,
): CalculateChangedRangeResult => {
  const docEnd = prevState.doc.nodeSize - 2
  let minFrom = 0
  let maxTo = docEnd

  if (prevPluginState.isEditable !== isEditable) {
    minFrom = 0
    maxTo = docEnd
  } else if (transaction.docChanged) {
    minFrom = docEnd
    maxTo = 0
    getChangedRanges(transaction).forEach((range) => {
      minFrom = Math.min(
        minFrom,
        range.newRange.from - 1,
        range.oldRange.from - 1,
      )
      maxTo = Math.max(maxTo, range.newRange.to + 1, range.oldRange.to + 1)
    })
  } else if (transaction.selectionSet) {
    const { $from: newFrom, $to: newTo } = oldState.selection
    const { $from: prevFrom, $to: prevTo } = prevState.selection
    minFrom = Math.min(
      newFrom.depth === 0 ? 0 : newFrom.before(),
      prevFrom.depth === 0 ? 0 : prevFrom.before(),
    )
    maxTo = Math.max(
      newTo.depth === 0 ? maxTo : newTo.after(),
      prevTo.depth === 0 ? maxTo : prevTo.after(),
    )
  }
  return { minFrom: Math.max(minFrom, 0), maxTo: Math.min(maxTo, docEnd) }
}

interface LaTeXPluginOptions {
  regex: RegExp
  katexOptions?: katex.KatexOptions
  editor: { isEditable: boolean }
  shouldRender: (
    state: EditorState,
    pos: number,
    node: ProseMirrorNode,
  ) => boolean
}

const doesDecorationExist = (
  decorations: DecorationSet,
  matchStart: number,
  matchEnd: number,
  isEditing: boolean,
  latexContent: string,
  isEditable: boolean,
  katexOptions?: katex.KatexOptions,
) =>
  decorations.find(matchStart, matchEnd, (dec: Decoration) => {
    const spec = dec.spec as LaTeXDecorationSpec | undefined
    return (
      spec !== undefined &&
      isEditing === spec.isEditing &&
      latexContent === spec.content &&
      isEditable === spec.isEditable &&
      katexOptions === spec.katexOptions
    )
  }).length > 0

const createLatexWidget =
  (
    latexContent: string,
    isEditable: boolean,
    _isEditing: boolean,
    katexOptions?: katex.KatexOptions,
  ) =>
  () => {
    const span = document.createElement("span")
    span.className = cn(span.className, {
      "inline-block cursor-pointer hover:bg-secondary rounded-[0.2rem] transition-colors p-1":
        isEditable,
    })
    try {
      katex.render(latexContent, span, katexOptions)
    } catch {
      span.innerHTML = latexContent
    }
    return span
  }

const handleLaTeXMatch = (
  decorations: DecorationSet,
  decorationsToAdd: Decoration[],
  matchStart: number,
  matchEnd: number,
  latexContent: string,
  isEditing: boolean,
  isEditable: boolean,
  katexOptions?: katex.KatexOptions,
) => {
  if (
    doesDecorationExist(
      decorations,
      matchStart,
      matchEnd,
      isEditing,
      latexContent,
      isEditable,
      katexOptions,
    )
  ) {
    return
  }
  decorationsToAdd.push(
    Decoration.inline(
      matchStart,
      matchEnd,
      {
        class: cn("bg-foreground text-background p-1 rounded-[0.2rem]", {
          "inline-block h-0 opacity-0 overflow-hidden absolute w-0":
            !isEditing || !isEditable,
        }),
      },
      {
        content: latexContent,
        isEditable,
        isEditing,
        katexOptions,
      } satisfies LaTeXDecorationSpec,
    ),
  )
  if (!isEditable || !isEditing) {
    decorationsToAdd.push(
      Decoration.widget(
        matchStart,
        createLatexWidget(latexContent, isEditable, isEditing, katexOptions),
      ),
    )
  }
}

/**
 * Create a ProseMirror plugin for rendering LaTeX using KaTeX.
 */
const createLaTeXPlugin = ({
  regex,
  katexOptions = {},
  editor,
  shouldRender,
}: LaTeXPluginOptions): Plugin => {
  return new Plugin<LaTeXPluginState>({
    key: new PluginKey("latex"),
    state: {
      init() {
        return { decorations: undefined, isEditable: undefined }
      },
      apply(transaction, pluginState, oldState, newState): LaTeXPluginState {
        if (
          !transaction.docChanged &&
          !transaction.selectionSet &&
          pluginState.decorations
        )
          return pluginState

        const decorations = (
          pluginState.decorations ?? DecorationSet.empty
        ).map(transaction.mapping, transaction.doc)

        const { selection } = newState
        const isEditable = editor.isEditable
        const decorationsToAdd: Decoration[] = []
        const { minFrom, maxTo } = calculateChangedRange(
          newState,
          pluginState,
          isEditable,
          transaction,
          oldState,
        )

        newState.doc.nodesBetween(
          minFrom,
          maxTo,
          (node: ProseMirrorNode, pos: number) => {
            const shouldRenderNode = shouldRender(newState, pos, node)

            if (node.isText && node.text && shouldRenderNode) {
              let match: RegExpExecArray | null

              while ((match = regex.exec(node.text))) {
                const matchStart = pos + match.index
                const matchEnd = matchStart + match[0].length
                const latexContent = match.slice(1).find(Boolean)

                if (latexContent) {
                  const selectionDiff = selection.from - selection.to
                  const isSelectionAnchorInRange =
                    selection.anchor >= matchStart &&
                    selection.anchor <= matchEnd
                  const isSelectionWithinRange =
                    selection.from >= matchStart && selection.to <= matchEnd
                  const isEditing =
                    (selectionDiff === 0 && isSelectionAnchorInRange) ||
                    isSelectionWithinRange

                  handleLaTeXMatch(
                    decorations,
                    decorationsToAdd,
                    matchStart,
                    matchEnd,
                    latexContent,
                    isEditing,
                    isEditable,
                    katexOptions,
                  )
                }
              }
            }
          },
        )

        const decorationsToRemove = decorationsToAdd.flatMap((decoration) => {
          const from = decoration.from
          const to = decoration.to
          return decorations.find(from, to)
        })

        return {
          decorations: decorations
            .remove(decorationsToRemove)
            .add(transaction.doc, decorationsToAdd),
          isEditable,
        }
      },
    },
    props: {
      decorations(state: EditorState) {
        const pluginState = this.getState(state)!
        return pluginState?.decorations ?? DecorationSet.empty
      },
    },
  })
}

/**
 * Default function to determine if LaTeX should render (not inside code blocks).
 */
const defaultShouldRender = (state: EditorState, pos: number): boolean =>
  !(state.doc.resolve(pos).parent.type.name === "codeBlock")

/**
 * TipTap LaTeX Extension
 */
export const LaTeX = Extension.create({
  name: "LaTeX",
  addOptions() {
    return {
      regex: /\$([^\$]*)\$/gi,
      katexOptions: undefined,
      shouldRender: defaultShouldRender,
    }
  },
  addProseMirrorPlugins() {
    return [
      createLaTeXPlugin({
        ...(this.options as LaTeXPluginOptions),
        editor: this.editor,
      }),
    ]
  },
})
