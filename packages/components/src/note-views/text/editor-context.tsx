"use client"

import { createContext, useContext, useState } from "react"
import type { Editor } from "@tiptap/react"

type EditorContextValue = {
  editor: Editor | null
  setEditor: (editor: Editor | null) => void
}

const Ctx = createContext<EditorContextValue | undefined>(undefined)

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [editor, setEditor] = useState<Editor | null>(null)

  return <Ctx.Provider value={{ editor, setEditor }}>{children}</Ctx.Provider>
}

export const useEditorContext = (): EditorContextValue => {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error("useEditorContext must be used within EditorProvider")
  return ctx
}
