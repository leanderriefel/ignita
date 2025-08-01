import type { NoteProp } from "../types"

export const DirectoryNoteView = ({
  note,
}: {
  note: NoteProp<"directory">
}) => {
  return (
    <div className="mx-auto flex size-full max-w-1/2 items-center justify-center pt-20 text-center">
      I have not yet implemented a display for directory notes. For now this is
      purely for organizational purposes.
    </div>
  )
}
