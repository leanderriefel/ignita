import { DeleteNoteDialogTrigger } from "../dialogs/delete-note-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import type { Note } from "./utils"

export type NotePopoverSettingsProps = {
  note: Note
  children: React.ReactNode
  asChild?: boolean
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onRename: () => void
}

export const NotePopoverSettingsTrigger = ({
  note,
  children,
  asChild,
  className,
  open,
  onOpenChange,
  onRename,
}: NotePopoverSettingsProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild={asChild} className={className}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="grid w-60">
        <button
          onClick={onRename}
          className="inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Rename
        </button>
        <DeleteNoteDialogTrigger note={note} asChild>
          <button className="inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
            Delete
          </button>
        </DeleteNoteDialogTrigger>
      </PopoverContent>
    </Popover>
  )
}
