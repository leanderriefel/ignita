import { InputRule, Node, type Editor } from "@tiptap/core"
import { NodeSelection, TextSelection } from "@tiptap/pm/state"

import LatexNodeView from "./nodeView"

const NODE_CLASS = "block-latex"
const INPUT_REGEX = /\$\$([^\$]*)\$\$/gi // matches for text inside $$
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    Latex: {
      toggleLatex: () => ReturnType
    }
  }
}

const Latex = Node.create({
  name: "latex",
  content: "text*",
  group: "block",
  marks: "",
  draggable: true,

  addAttributes() {
    return {
      showRendered: {
        default: true,
        renderHTML() {
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: `div.${NODE_CLASS}`, priority: 1000 }]
  },

  renderHTML() {
    return ["div", { class: NODE_CLASS }, 0]
  },
  addNodeView() {
    return (props) => new LatexNodeView(props)
  },

  addCommands() {
    return {
      toggleLatex:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, "paragraph", {
            showRendered: false,
          })
        },
    }
  },

  addInputRules() {
    return [
      new InputRule({
        find: INPUT_REGEX,
        handler: ({ state, range, match }) => {
          const [, matchedContent = ""] = match
          const textNode = state.schema.text(matchedContent)
          const latexNode = this.type.create({ showRendered: false }, textNode)
          const { tr } = state

          tr.replaceRangeWith(range.from, range.to, latexNode)
          tr.setSelection(
            TextSelection.create(tr.doc, range.from + latexNode.nodeSize - 1),
          )
        },
      }),
    ]
  },

  addKeyboardShortcuts() {
    const focusLatexNodeFromSelection = (editor: Editor) => {
      const { selection } = editor.state
      if (!(selection instanceof NodeSelection)) return false
      if (selection.node.type.name !== this.name) return false
      const position = selection.from
      return editor.commands.command(({ tr }) => {
        tr.setNodeAttribute(position, "showRendered", false)
        tr.setSelection(TextSelection.create(tr.doc, position + 1))
        return true
      })
    }

    return {
      ArrowDown: ({ editor }) => {
        const { empty, $anchor } = editor.state.selection

        // If selection is a node selection on latex, enter it
        if (focusLatexNodeFromSelection(editor)) return true

        // If cursor is at end of a block and next node is latex, enter latex
        if (empty) {
          const { parentOffset, parent } = $anchor
          if (parentOffset === parent.content.size) {
            const nextPos = $anchor.after()
            const nextNode = editor.state.doc.nodeAt(nextPos)
            if (nextNode?.type.name === this.name) {
              return editor.commands.command(({ tr }) => {
                tr.setNodeAttribute(nextPos, "showRendered", false)
                tr.setSelection(TextSelection.create(tr.doc, nextPos + 1))
                return true
              })
            }
          }
        }

        if (!empty || $anchor.parent.type.name !== this.name) {
          return false
        }

        const posAfter = $anchor.after()
        const resolvedPosition = editor.state.doc.resolve(posAfter)
        if (
          !resolvedPosition.nodeAfter ||
          resolvedPosition.nodeAfter.type.name === "footnotes"
        ) {
          const paragraphType = editor.state.schema.nodes.paragraph
          if (!paragraphType) return false
          return editor.commands.command(({ tr }) => {
            const paragraph = paragraphType.create()
            tr.insert(posAfter, paragraph)
            const resolvedPos = tr.doc.resolve(posAfter + 1)
            tr.setSelection(TextSelection.near(resolvedPos))
            return true
          })
        }
        return false
      },

      Enter: ({ editor }) => {
        const { $anchor } = editor.state.selection
        if ($anchor.parent.type.name !== this.name) {
          return false
        }

        // If this latex node is the first block and cursor at start, insert above
        const blockStart = $anchor.start()
        const resolvedStart = editor.state.doc.resolve(blockStart)
        if ($anchor.parentOffset === 0 && !resolvedStart.nodeBefore) {
          const paragraphType = editor.state.schema.nodes.paragraph
          if (!paragraphType) return false
          return editor.commands.command(({ tr }) => {
            const paragraph = paragraphType.create()
            tr.insert(blockStart, paragraph)
            const resolvedPos = tr.doc.resolve(blockStart + 1)
            tr.setSelection(TextSelection.near(resolvedPos))
            return true
          })
        }

        const posAfter = $anchor.after()
        const resolvedPosition = editor.state.doc.resolve(posAfter)
        if (
          !resolvedPosition.nodeAfter ||
          resolvedPosition.nodeAfter.type.name === "footnotes"
        ) {
          const paragraphType = editor.state.schema.nodes.paragraph
          if (!paragraphType) return false
          return editor.commands.command(({ tr }) => {
            const paragraph = paragraphType.create()
            tr.insert(posAfter, paragraph)
            const resolvedPos = tr.doc.resolve(posAfter + 1)
            tr.setSelection(TextSelection.near(resolvedPos))
            return true
          })
        }
        return editor.commands.setTextSelection(
          posAfter + resolvedPosition.nodeAfter.content.size + 1,
        )
      },
    }
  },
})

export default Latex
