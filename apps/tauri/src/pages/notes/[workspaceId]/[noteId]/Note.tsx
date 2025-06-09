import { useParams } from "react-router"

import { NoteView } from "@ignita/components"

const Note = () => {
  const { noteId } = useParams()

  if (!noteId) {
    return <div>Note not found</div>
  }

  return (
    <div className="size-full">
      <NoteView noteId={noteId} />
    </div>
  )
}

export default Note
