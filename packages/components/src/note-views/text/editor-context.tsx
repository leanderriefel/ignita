"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { Editor } from "@tiptap/react"

type EditorContextValue = {
  editor: Editor | null
  setEditor: (editor: Editor | null) => void
  docId: string | null
  setDocId: (docId: string | null) => void
}

const Ctx = createContext<EditorContextValue | undefined>(undefined)

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [editor, setEditorState] = useState<Editor | null>(null)
  const setEditor = useCallback((e: Editor | null) => setEditorState(e), [])
  const [docId, setDocId] = useState<string | null>(null)

  const value = useMemo<EditorContextValue>(
    () => ({ editor, setEditor, docId, setDocId }),
    [editor, setEditor],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useEditorContext = (): EditorContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error("useEditorContext must be used within EditorProvider")
  return ctx
}
