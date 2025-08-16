import {
  Extension,
  Mark,
  mergeAttributes,
  type CommandProps,
} from "@tiptap/core"
import {
  acceptAllSuggestions,
  acceptSuggestionsInRange,
  applySuggestion,
  rejectAllSuggestions,
  rejectSuggestionsInRange,
  suggestionModePlugin,
} from "prosemirror-suggestion-mode"

export type SuggestionInput = {
  textToReplace: string
  textReplacement: string
  textBefore?: string
  textAfter?: string
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    suggestionMode: {
      applySuggestion: (suggestion: SuggestionInput) => ReturnType
      applySuggestions: (suggestions: SuggestionInput[]) => ReturnType
      acceptAllSuggestions: () => ReturnType
      rejectAllSuggestions: () => ReturnType
      acceptSuggestionsInRange: (from: number, to: number) => ReturnType
      rejectSuggestionsInRange: (from: number, to: number) => ReturnType
      acceptSuggestionAt: (pos: number) => ReturnType
      rejectSuggestionAt: (pos: number) => ReturnType
      acceptSelectedSuggestion: () => ReturnType
      rejectSelectedSuggestion: () => ReturnType
    }
  }
}

export const SuggestionInsert = Mark.create({
  name: "suggestion_insert",
  group: "suggestion",
  excludes: "suggestion",
  inclusive: true,
  parseHTML() {
    return [{ tag: 'span[data-suggestion-insert="true"]' }]
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-suggestion-insert": "true" }),
      0,
    ]
  },
  addAttributes() {
    return {
      id: { default: null },
      username: { default: null },
      data: { default: null },
      date: { default: null },
    }
  },
})

export const SuggestionDelete = Mark.create({
  name: "suggestion_delete",
  group: "suggestion",
  excludes: "suggestion",
  inclusive: true,
  parseHTML() {
    return [{ tag: 'span[data-suggestion-delete="true"]' }]
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-suggestion-delete": "true" }),
      0,
    ]
  },
  addAttributes() {
    return {
      id: { default: null },
      username: { default: null },
      data: { default: null },
      date: { default: null },
    }
  },
})

function getNonEmptySelectionRange(state: CommandProps["state"]) {
  const { from, to } = state.selection
  if (from !== to) return { from, to }
  const min = Math.max(0, from - 1)
  const max = Math.min(state.doc.content.size, to + 1)
  return { from: min, to: max }
}

export const SuggestionMode = Extension.create({
  name: "suggestionMode",

  addExtensions() {
    return [SuggestionInsert, SuggestionDelete]
  },

  addProseMirrorPlugins() {
    return [
      suggestionModePlugin({
        inSuggestionMode: false,
      }),
    ]
  },

  addCommands() {
    return {
      applySuggestion:
        (suggestion: SuggestionInput) =>
        ({ editor }: CommandProps) => {
          ;(
            applySuggestion as unknown as (
              view: unknown,
              suggestion: unknown,
              username?: string,
            ) => void
          )(editor.view, suggestion)
          return true
        },

      applySuggestions:
        (suggestions: SuggestionInput[]) =>
        ({ editor }: CommandProps) => {
          const call = applySuggestion as unknown as (
            view: unknown,
            suggestion: unknown,
            username?: string,
          ) => void
          for (const s of suggestions) call(editor.view, s)
          return true
        },

      acceptAllSuggestions:
        () =>
        ({ state, dispatch }: CommandProps) => {
          acceptAllSuggestions(state, dispatch)
          return true
        },

      rejectAllSuggestions:
        () =>
        ({ state, dispatch }: CommandProps) => {
          rejectAllSuggestions(state, dispatch)
          return true
        },

      acceptSuggestionsInRange:
        (from: number, to: number) =>
        ({ state, dispatch }: CommandProps) => {
          acceptSuggestionsInRange(from, to)(state, dispatch)
          return true
        },

      rejectSuggestionsInRange:
        (from: number, to: number) =>
        ({ state, dispatch }: CommandProps) => {
          rejectSuggestionsInRange(from, to)(state, dispatch)
          return true
        },

      acceptSuggestionAt:
        (pos: number) =>
        ({ state, dispatch }: CommandProps) => {
          const from = Math.max(0, pos)
          const to = Math.min(state.doc.content.size, pos + 1)
          acceptSuggestionsInRange(from, to)(state, dispatch)
          return true
        },

      rejectSuggestionAt:
        (pos: number) =>
        ({ state, dispatch }: CommandProps) => {
          const from = Math.max(0, pos)
          const to = Math.min(state.doc.content.size, pos + 1)
          rejectSuggestionsInRange(from, to)(state, dispatch)
          return true
        },

      acceptSelectedSuggestion:
        () =>
        ({ state, dispatch }: CommandProps) => {
          const { from, to } = getNonEmptySelectionRange(state)
          acceptSuggestionsInRange(from, to)(state, dispatch)
          return true
        },

      rejectSelectedSuggestion:
        () =>
        ({ state, dispatch }: CommandProps) => {
          const { from, to } = getNonEmptySelectionRange(state)
          rejectSuggestionsInRange(from, to)(state, dispatch)
          return true
        },
    }
  },
})
