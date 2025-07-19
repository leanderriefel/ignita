import type { NoteProp } from "../types"

export const DirectoryNoteView = ({
  note,
}: {
  note: NoteProp<"directory">
}) => {
  return (
    <div className="flex size-full items-center justify-center">
      {note.name} is a directory note
    </div>
  )
}
