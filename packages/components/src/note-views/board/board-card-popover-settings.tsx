"use client"

import { type ComponentPropsWithoutRef } from "react"

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

  return (
    <Popover>
      <PopoverTrigger {...props} />
      <PopoverContent className="grid w-60">
        <button
          disabled={deleteBoardCard.isPending}
          onClick={() =>
            deleteBoardCard.mutate({
              noteId: note.id,
              cardId: card.id,
            })
          }
          className="inline-flex items-center justify-start rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          Delete{" "}
          {deleteBoardCard.isPending && <Loading className="ml-auto size-4" />}
        </button>
      </PopoverContent>
    </Popover>
  )
}
