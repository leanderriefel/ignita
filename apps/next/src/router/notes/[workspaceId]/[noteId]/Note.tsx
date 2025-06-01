import { useParams } from "react-router"

import { Editor } from "@nuotes/components"

const Note = () => {
  const { noteId } = useParams<{ noteId: string }>()

  if (!noteId) {
    return <div>Note not found</div>
  }

  return (
    <div className="size-full">
      <Editor noteId={noteId} />
    </div>
  )
}

export default Note
