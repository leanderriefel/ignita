import { Redirect, useLocalSearchParams } from "expo-router"

import { NoteView } from "~/components/note-views/note-view"

const NotesPage = () => {
  const { noteId } = useLocalSearchParams()

  if (!noteId) {
    return <Redirect href="/" />
  }

  return <NoteView noteId={noteId as string} />
}

export default NotesPage
