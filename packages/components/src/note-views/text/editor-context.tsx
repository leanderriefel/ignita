"use client"

import { createContext, useContext, useState } from "react"
import type { Editor } from "@tiptap/react"

type DocSnapshot = { docId: string | null; docName: string | null }

type EditorContextValue = {
  editor: Editor | null
  setEditor: (editor: Editor | null) => void
  docSnapshot: DocSnapshot
  setDocSnapshot: (snapshot: DocSnapshot) => void
}

const defaultSnapshot: DocSnapshot = { docId: null, docName: null }

const Ctx = createContext<EditorContextValue | undefined>(undefined)

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [docSnapshot, setDocSnapshot] = useState<DocSnapshot>(defaultSnapshot)

  return (
    <Ctx.Provider value={{ editor, setEditor, docSnapshot, setDocSnapshot }}>
      {children}
    </Ctx.Provider>
  )
}

export const useEditorContext = (): EditorContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error("useEditorContext must be used within EditorProvider")
  return ctx
}
