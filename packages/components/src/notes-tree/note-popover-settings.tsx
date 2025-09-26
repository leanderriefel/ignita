import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

export type NotePopoverSettingsProps = {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onRename: () => void
  onDelete: () => void
}

export const NotePopoverSettingsTrigger = ({
  children,
  asChild,
  className,
  open,
  onOpenChange,
  onRename,
  onDelete,
}: NotePopoverSettingsProps) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild={asChild} className={className}>
        {children}
      </PopoverTrigger>
      <PopoverContent className="grid w-60">
        <button
          onClick={(e) => {
            e.stopPropagation()

            onRename()
          }}
          className="inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Rename
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()

            onOpenChange?.(false)
            onDelete()
          }}
          className="inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Delete
        </button>
      </PopoverContent>
    </Popover>
  )
}
