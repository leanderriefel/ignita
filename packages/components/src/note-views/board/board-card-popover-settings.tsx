import { useCallback, type ComponentPropsWithoutRef } from "react"

import { useDeleteBoardCard } from "@ignita/hooks"

import { Loading } from "../../ui/loading"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import type { NoteProp } from "../types"
import type { Card } from "./types"

export const BoardCardPopoverSettingsTrigger = ({
  card,
  note,
  ...props
}: {
  card: Card
  note: NoteProp<"board">
} & ComponentPropsWithoutRef<typeof PopoverTrigger>) => {
  const deleteBoardCard = useDeleteBoardCard({ optimistic: false })

  const deleteCard = useCallback(() => {
    deleteBoardCard.mutate({
      noteId: note.id,
      cardId: card.id,
    })
  }, [card.id, note.id, deleteBoardCard])

  return (
    <Popover>
      <PopoverTrigger {...props} />
      <PopoverContent className="grid w-60">
        <button className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm">
          Rename
        </button>
        <button
          disabled={deleteBoardCard.isPending}
          onClick={deleteCard}
          className="hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm"
        >
          Delete{" "}
          {deleteBoardCard.isPending && <Loading className="ml-auto size-4" />}
        </button>
      </PopoverContent>
    </Popover>
  )
}
