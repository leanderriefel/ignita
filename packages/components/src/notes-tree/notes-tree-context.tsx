import { createContext, useContext, useState, type ReactNode } from "react"

// Context to persist expanded state of notes across re-mounts
interface NotesTreeContextValue {
  expandedMap: Record<string, boolean>
  toggleExpanded: (id: string) => void
  setExpanded: (id: string, expanded: boolean) => void
}

const NotesTreeContext = createContext<NotesTreeContextValue | undefined>(
  undefined,
)

export const NotesTreeProvider = ({ children }: { children: ReactNode }) => {
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  const toggleExpanded = (id: string) =>
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }))

  const setExpanded = (id: string, expanded: boolean) =>
    setExpandedMap((prev) => ({ ...prev, [id]: expanded }))

  return (
    <NotesTreeContext.Provider
      value={{ expandedMap, toggleExpanded, setExpanded }}
    >
      {children}
    </NotesTreeContext.Provider>
  )
}

export const useNotesTreeContext = () => {
  const ctx = useContext(NotesTreeContext)
  if (!ctx)
    throw new Error("useNotesTreeContext must be used within NotesTreeProvider")
  return ctx
}
