"use client"

import { Store } from "@tanstack/react-store"

export type NotesSessionState = {
  workspaceId: string | null
  noteId: string | null
}

const STORAGE_KEY = "notes-session-state"

const loadInitialState = (): NotesSessionState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { workspaceId: null, noteId: null }
    const parsed = JSON.parse(raw) as Partial<NotesSessionState>
    return {
      workspaceId:
        typeof parsed.workspaceId === "string" ? parsed.workspaceId : null,
      noteId: typeof parsed.noteId === "string" ? parsed.noteId : null,
    }
  } catch {
    return { workspaceId: null, noteId: null }
  }
}

export const notesSessionStore = new Store<NotesSessionState>(
  loadInitialState(),
)

const persist = (state: NotesSessionState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {}
}

notesSessionStore.subscribe(({ currentVal }) => {
  persist(currentVal)
})

export const setWorkspace = (workspaceId: string | null) => {
  const next: NotesSessionState = { ...notesSessionStore.state, workspaceId }
  if (!workspaceId) next.noteId = null
  notesSessionStore.setState(next)
}

export const setNote = (noteId: string | null) => {
  const next: NotesSessionState = { ...notesSessionStore.state, noteId }
  notesSessionStore.setState(next)
}

export const clearNotesSession = () => {
  notesSessionStore.setState({ workspaceId: null, noteId: null })
}
