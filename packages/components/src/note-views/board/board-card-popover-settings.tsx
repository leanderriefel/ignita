import { useCallback, type ComponentPropsWithoutRef } from "react"

import { useUpdateNoteContent } from "@ignita/hooks"

import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import type { NoteProp } from "../types"
import type { Card, Column } from "./types"

export const BoardCardPopoverSettingsTrigger = ({
  card,
  column,
  note,
  ...props
}: {
  card: Card
  column: Column
  note: NoteProp<"board">
} & ComponentPropsWithoutRef<typeof PopoverTrigger>) => {
  const updateNoteContent = useUpdateNoteContent()

  const deleteCard = useCallback(() => {
    updateNoteContent.mutate({
      id: note.id,
      note: {
        type: "board",
        content: {
          columns: note.note.content.columns.map((col: Column) =>
            col.id === column.id
              ? {
                  ...col,
                  cards: col.cards.filter((c) => c.id !== card.id),
                }
              : col,
          ),
        },
      },
    })
  }, [card.id, column.id, note.id, updateNoteContent])

  return (
    <Popover>
      <PopoverTrigger {...props} />
      <PopoverContent className="grid w-60">
        <button className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm">
          Rename
        </button>
        <button
          onClick={deleteCard}
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm"
        >
          Delete
        </button>
      </PopoverContent>
    </Popover>
  )
}
