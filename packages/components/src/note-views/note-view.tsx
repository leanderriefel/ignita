import { useNote } from "@ignita/hooks"

import { Loading } from "../ui/loading"
import { BoardNoteView } from "./board/board-note-view"
import { DirectoryNoteView } from "./directory/directory-note-view"
import { Tiptap } from "./text/text-note-view"

export const NoteView = ({ noteId }: { noteId: string }) => {
  const { data, ...query } = useNote(noteId, { enabled: !!noteId })

  if (query.isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading className="size-8" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <em className="text-destructive">
          Error loading note:{" "}
          {query.error.data?.zodError
            ? Object.values(query.error.data.zodError.fieldErrors).join(", ")
            : query.error.message}
        </em>
      </div>
    )
  }

  if (!data?.note) {
    return (
      <div className="flex h-full items-center justify-center">
        <em className="text-muted-foreground">Note not found</em>
      </div>
    )
  }

  switch (data.note.type) {
    case "text":
      return <Tiptap note={{ ...data, note: data.note }} />
    case "directory":
      return <DirectoryNoteView note={{ ...data, note: data.note }} />
    case "board":
      return <BoardNoteView note={{ ...data, note: data.note }} />
    default:
      return (
        <div className="flex size-full items-center justify-center">
          <em className="text-muted-foreground max-w-1/2 text-center">
            Note type not supported yet: {data.note.type}. Please check back in
            later! This project is still under heavy development.
          </em>
        </div>
      )
  }
}
