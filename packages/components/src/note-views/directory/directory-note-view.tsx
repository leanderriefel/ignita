import type { NoteProp } from "../types"

export const DirectoryNoteView = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  note,
}: {
  note: NoteProp<"directory">
}) => {
  return (
    <div className="flex size-full items-center justify-center">
      This is a directory note
    </div>
  )
}
