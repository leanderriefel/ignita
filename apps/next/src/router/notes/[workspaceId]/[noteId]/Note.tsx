import { useParams } from "react-router"

import { Loading, NoteView } from "@ignita/components"
import { useNote } from "@ignita/hooks"

const Note = () => {
  const { noteId } = useParams()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const note = useNote(noteId!)

  if (note.isPending) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!note.data) {
    return (
      <div className="flex size-full items-center justify-center">
        <div className="text-2xl font-bold">Note not found</div>
      </div>
    )
  }

  return (
    <div className="size-full">
      {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
      <NoteView noteId={noteId!} />
    </div>
  )
}

export default Note
