import { Extension, type Editor } from "@tiptap/core"
import { ChangeSet, simplifyChanges } from "@tiptap/pm/changeset"
import {
  DOMSerializer,
  Fragment,
  Mark,
  type Node as PMNode,
} from "@tiptap/pm/model"
import {
  EditorState,
  Plugin,
  PluginKey,
  type Transaction,
} from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface TrackedChange {
  id: string
  oldRange: { from: number; to: number }
  newRange: { from: number; to: number }
}

interface ChangesPluginState {
  previousDoc: PMNode | null
  changes: TrackedChange[]
  decorations: DecorationSet
  docId: string | null
}

type ChangesMeta =
  | undefined
  | {
      previousDoc?: PMNode | null
      docSwitch?: boolean
      docId?: string | null
    }

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    changes: {
      setChangesDocId: (docId: string | null) => ReturnType
      startTrackingChanges: () => ReturnType
      stopTrackingChanges: () => ReturnType
      acceptAllChanges: () => ReturnType
      rejectAllChanges: () => ReturnType
      acceptChange: (id: string) => ReturnType
      rejectChange: (id: string) => ReturnType
    }
  }
}

// Token encoder for changeset diffing - same as AI changes
const tokenEncoder = {
  encodeCharacter: (char: number, marks: readonly Mark[]) => ({
    type: "char" as const,
    char,
    marks,
  }),
  encodeNodeStart: (node: PMNode) => ({ type: "nodeStart" as const, node }),
  encodeNodeEnd: () => ({ type: "nodeEnd" as const }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  compareTokens: (a: any, b: any): boolean => {
    switch (a.type) {
      case "char":
        return (
          a.type === b.type &&
          a.char === b.char &&
          Mark.sameSet(a.marks, b.marks)
        )
      case "nodeStart":
        return a.type === b.type && a.node.sameMarkup(b.node)
      case "nodeEnd":
        return a.type === b.type
      default:
        return false
    }
  },
}

const maybeSame = <T>(a: T, b: T): T | null => (a === b ? a : null)

const getChanges = ({
  previousDoc,
  currentDoc,
}: {
  previousDoc: PMNode
  currentDoc: PMNode
}): TrackedChange[] => {
  const tr = EditorState.create({ doc: previousDoc }).tr
  tr.replaceWith(0, tr.doc.content.size, currentDoc)

  const stepMaps = tr.steps.map((s) => s.getMap())
  const changeSet = ChangeSet.create(
    previousDoc,
    maybeSame,
    tokenEncoder,
  ).addSteps(currentDoc, stepMaps, null)

  return simplifyChanges(changeSet.changes, currentDoc).map(
    (
      c: { fromA: number; toA: number; fromB: number; toB: number },
      index: number,
    ) => ({
      id: (index + 1).toString(),
      oldRange: { from: c.fromA, to: c.toA },
      newRange: { from: c.fromB, to: c.toB },
    }),
  )
}

const renderToHTMLElement = ({
  node,
  editor,
  pos = 0,
}: {
  node: PMNode | PMNode[] | Fragment
  editor: Editor
  pos?: number
}): DocumentFragment => {
  const nodeViews = editor.extensionManager.nodeViews
  const fragment = new DocumentFragment()
  let resolvedPos = pos

  Fragment.from(node).forEach((child) => {
    const ctor = nodeViews[child.type.name]
    if (!ctor) {
      fragment.appendChild(
        DOMSerializer.fromSchema(editor.schema).serializeNode(child),
      )
      resolvedPos += child.nodeSize
      return
    }

    const view = ctor(
      child,
      editor.view,
      () => resolvedPos,
      [],
      DecorationSet.empty,
    )

    if (view.contentDOM) {
      view.contentDOM.appendChild(
        renderToHTMLElement({ node: child.content, editor, pos: resolvedPos }),
      )
    }

    fragment.appendChild(view.dom)
    resolvedPos += child.nodeSize
  })

  return fragment
}

const createDecorations = (
  state: EditorState,
  changes: TrackedChange[],
  previousDoc: PMNode,
  editor: Editor,
): Decoration[] => {
  const decos: Decoration[] = []

  for (const change of changes) {
    if (previousDoc) {
      // Show deleted/old text as widget
      decos.push(
        Decoration.widget(
          change.newRange.from,
          () => {
            const span = document.createElement("span")
            span.className = "tiptap-changes--deleted"
            span.appendChild(
              renderToHTMLElement({
                node: previousDoc.slice(
                  change.oldRange.from,
                  change.oldRange.to,
                ).content,
                editor,
              }),
            )
            return span
          },
          { side: -1 },
        ),
      )
    }

    // Highlight new text
    decos.push(
      Decoration.inline(change.newRange.from, change.newRange.to, {
        class: "tiptap-changes--inserted",
      }),
    )
  }
  return decos
}

const initialState = (): ChangesPluginState => ({
  previousDoc: null,
  changes: [],
  decorations: DecorationSet.empty,
  docId: null,
})

export const createChangesPlugin = (
  key: PluginKey<ChangesPluginState>,
  editor: Editor,
  storage: ChangesStorage,
) =>
  new Plugin<ChangesPluginState>({
    key,
    state: {
      init: initialState,
      apply: (tr, prev, _old, nextState) => {
        let previousDoc = prev.previousDoc
        let activeDocId = prev.docId
        const meta = tr.getMeta(key) as ChangesMeta

        if (meta && "previousDoc" in meta) {
          previousDoc = meta.previousDoc ?? null
          if ("docId" in meta) {
            activeDocId = meta.docId ?? null
          }
        }

        if (meta?.docSwitch) {
          if (!previousDoc) return initialState()
          const changes = getChanges({ previousDoc, currentDoc: nextState.doc })
          const decorations = DecorationSet.create(
            nextState.doc,
            createDecorations(nextState, changes, previousDoc, editor),
          )
          return { previousDoc, changes, decorations, docId: activeDocId }
        }

        if (!previousDoc) {
          return initialState()
        }

        // Always recompute changes
        const changes =
          tr.docChanged || meta
            ? getChanges({ previousDoc, currentDoc: nextState.doc })
            : prev.changes

        // Auto-stop when all changes are resolved
        if (changes.length === 0 && prev.changes.length > 0) {
          if (activeDocId) {
            storage.baselinesByDocId.delete(activeDocId)
          }
          return initialState()
        }

        // Always recreate decorations
        const decorations = DecorationSet.create(
          nextState.doc,
          createDecorations(nextState, changes, previousDoc, editor),
        )

        return { previousDoc, changes, decorations, docId: activeDocId }
      },
    },
    props: {
      decorations(state) {
        const s = key.getState(state) as ChangesPluginState | undefined
        return s?.decorations
      },
    },
  })

type ChangesStorage = {
  key: PluginKey<ChangesPluginState>
  baselinesByDocId: Map<string, PMNode>
  currentDocId: string | null
  setDocId: (docId: string | null) => void
  getChanges: () => TrackedChange[]
  isTracking: () => boolean
}

declare module "@tiptap/core" {
  interface Storage {
    changes: ChangesStorage
  }
}

const Changes = Extension.create<{}, ChangesStorage>({
  name: "changes",
  addStorage() {
    return {
      key: new PluginKey<ChangesPluginState>("changes"),
      baselinesByDocId: new Map<string, PMNode>(),
      currentDocId: null,
      setDocId: () => {},
      getChanges: () => [],
      isTracking: () => false,
    }
  },
  addProseMirrorPlugins() {
    return [createChangesPlugin(this.storage.key, this.editor, this.storage)]
  },
  addCommands() {
    const metaOf = (tr: Transaction) =>
      (tr.getMeta(this.storage.key) as ChangesMeta) ?? {}
    const setMeta = (tr: Transaction, meta: NonNullable<ChangesMeta>) => {
      const curr = metaOf(tr)
      return tr.setMeta(this.storage.key, { ...curr, ...meta })
    }

    return {
      setChangesDocId:
        (docId: string | null) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true
          this.storage.currentDocId = docId
          const baseline = docId
            ? (this.storage.baselinesByDocId.get(docId) ?? null)
            : null
          const nextTr = setMeta(tr, {
            previousDoc: baseline,
            docSwitch: true,
            docId,
          })
          dispatch(nextTr)
          return true
        },

      startTrackingChanges:
        () =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true
          if (this.storage.isTracking()) return true
          if (this.storage.currentDocId) {
            this.storage.baselinesByDocId.set(this.storage.currentDocId, tr.doc)
          }
          dispatch(
            setMeta(tr, {
              previousDoc: tr.doc,
              docId: this.storage.currentDocId ?? null,
            }),
          )
          return true
        },

      stopTrackingChanges:
        () =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true
          if (!this.storage.isTracking()) return true
          if (this.storage.currentDocId) {
            this.storage.baselinesByDocId.delete(this.storage.currentDocId)
          }
          dispatch(
            setMeta(tr, {
              previousDoc: null,
              docId: this.storage.currentDocId ?? null,
            }),
          )
          return true
        },

      acceptAllChanges:
        () =>
        ({ tr, dispatch }) => {
          if (!dispatch) return false
          if (!this.storage.isTracking()) return false
          if (this.storage.currentDocId) {
            this.storage.baselinesByDocId.delete(this.storage.currentDocId)
          }
          dispatch(
            setMeta(tr, {
              previousDoc: null,
              docId: this.storage.currentDocId ?? null,
            }),
          )
          return true
        },

      rejectAllChanges:
        () =>
        ({ state, commands }) => {
          const pluginState = this.storage.key.getState(state) as
            | ChangesPluginState
            | undefined
          if (!pluginState?.previousDoc) return false
          if (!this.storage.isTracking()) return false
          return commands.setContent(pluginState.previousDoc)
        },

      acceptChange:
        (id: string) =>
        ({ state, dispatch }) => {
          const pluginState = this.storage.key.getState(state) as
            | ChangesPluginState
            | undefined
          if (!pluginState?.previousDoc) return false
          if (!this.storage.isTracking()) return false
          const change = pluginState.changes.find((c) => c.id === id)
          if (!change) return false

          if (!dispatch) return true

          // Update baseline to accept this change
          const baseState = EditorState.create({ doc: pluginState.previousDoc })
          const baseTr = baseState.tr
          const slice = state.doc.slice(
            change.newRange.from,
            change.newRange.to,
          )
          baseTr.replaceWith(
            change.oldRange.from,
            change.oldRange.to,
            slice.content,
          )

          if (this.storage.currentDocId) {
            this.storage.baselinesByDocId.set(
              this.storage.currentDocId,
              baseTr.doc,
            )
          }

          const tr = state.tr.setMeta(this.storage.key, {
            previousDoc: baseTr.doc,
          })
          dispatch(tr)
          return true
        },

      rejectChange:
        (id: string) =>
        ({ state, dispatch }) => {
          const pluginState = this.storage.key.getState(state) as
            | ChangesPluginState
            | undefined
          if (!pluginState?.previousDoc) return false
          if (!this.storage.isTracking()) return false
          const change = pluginState.changes.find((c) => c.id === id)
          if (!change) return false

          if (!dispatch) return true

          const tr = state.tr
          const oldSlice = pluginState.previousDoc.slice(
            change.oldRange.from,
            change.oldRange.to,
          )
          tr.replaceWith(
            change.newRange.from,
            change.newRange.to,
            oldSlice.content,
          )
          dispatch(tr)
          return true
        },
    }
  },
  onCreate() {
    const get = () =>
      this.storage.key.getState(this.editor.state) as
        | ChangesPluginState
        | undefined
    this.storage.getChanges = () => get()?.changes ?? []
    this.storage.isTracking = () => !!get()?.previousDoc
    this.storage.setDocId = (docId: string | null) => {
      this.storage.currentDocId = docId
    }
  },
})

export default Changes
