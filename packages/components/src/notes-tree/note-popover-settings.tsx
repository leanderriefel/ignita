import { DeleteNoteDialogTrigger } from "../dialogs/delete-note-dialog"
import { Divider } from "../ui/divider"
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
        <h4 className="text-center font-medium">{note.name}</h4>
        <Divider className="my-4" />
        <button
          onClick={onRename}
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start rounded-md px-3 py-2 text-sm"
        >
          Rename
        </button>
        <DeleteNoteDialogTrigger note={note} asChild>
          <button className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start rounded-md px-3 py-2 text-sm">
            Delete
          </button>
        </DeleteNoteDialogTrigger>
      </PopoverContent>
    </Popover>
  )
}
