import { useNote } from "@ignita/hooks"

import { Loading } from "../ui/loading"
import { Tiptap } from "./text/tiptap"

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
    default:
      return null
  }
}
