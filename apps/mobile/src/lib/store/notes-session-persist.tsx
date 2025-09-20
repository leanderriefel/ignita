import { useEffect, useRef } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { notesSessionStore } from "@ignita/lib"

const STORAGE_KEY = "notes-session-workspace"

export const NotesSessionPersist = () => {
  const loaded = useRef(false)

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as { workspaceId?: string | null }
          const workspaceId =
            typeof parsed.workspaceId === "string" ? parsed.workspaceId : null
          const prev = notesSessionStore.state
          notesSessionStore.setState({ ...prev, workspaceId })
        }
      } catch {}
      loaded.current = true
    }

    load()

    const unsubscribe = notesSessionStore.subscribe(({ currentVal }) => {
      if (!loaded.current) return
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ workspaceId: currentVal.workspaceId }),
      ).catch(() => {})
    })

    return () => unsubscribe()
  }, [])

  return null
}
