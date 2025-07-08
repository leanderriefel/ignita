"use client"

import type { ItemInstance } from "@headless-tree/core"
import { CaretRightIcon, PlusIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router"

import { cn } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { CreateNoteDialogTrigger } from "../dialogs/create-note-dialog"
import { INDENTATION_WIDTH, type TreeNote } from "./utils"

type NoteTreeItemProps = {
  item: ItemInstance<TreeNote>
}

export const NoteTreeItem = ({ item }: NoteTreeItemProps) => {
  const { workspaceId, noteId } = useParams()
  const note = item.getItemData()

  const isSelected = note.id === noteId
  const isFocused = item.isFocused()
  const isExpanded = item.isExpanded()

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const handleHover = () => {
    if (!trpc.notes.getNote) return
    if (queryClient.getQueryData(trpc.notes.getNote.queryKey({ id: note.id })))
      return

    void queryClient.prefetchQuery(
      trpc.notes.getNote.queryOptions({ id: note.id }),
    )
  }

  const handleCaretClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    isExpanded ? item.collapse() : item.expand()
  }

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <div
      onMouseEnter={handleHover}
      style={{
        paddingLeft: `${item.getItemMeta().level * INDENTATION_WIDTH}px`,
      }}
      className="relative"
    >
      <div
        {...item.getProps()}
        onClick={handleItemClick}
        className={cn(
          "group relative mb-0.5 flex h-8 w-full cursor-pointer items-center rounded-md transition-all duration-200 ease-out",
          "border border-transparent",
          {
            "bg-muted border-muted-foreground/20": isSelected,
            "hover:bg-accent hover:border-border": !isSelected,
          },
        )}
      >
        <button
          className={cn(
            "ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm transition-all duration-200",
            "hover:bg-muted hover:text-foreground text-muted-foreground",
            "hover:scale-110 active:scale-95",
            {
              "text-foreground hover:bg-accent": isSelected,
            },
          )}
          onClick={handleCaretClick}
        >
          <CaretRightIcon
            className={cn("h-3 w-3 transition-transform duration-200", {
              "rotate-90": isExpanded,
            })}
          />
        </button>

        <div
          className={cn(
            "min-w-0 flex-1 px-2 py-1 text-sm transition-colors duration-200",
            {
              "text-foreground": true,
            },
          )}
        >
          <Link
            to={`/notes/${note.workspaceId}/${note.id}`}
            prefetch="viewport"
            className="block w-full truncate outline-none select-none focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {note.name}
          </Link>
        </div>

        <CreateNoteDialogTrigger
          workspaceId={workspaceId ?? ""}
          parentId={note.id}
          asChild
        >
          <button
            className={cn(
              "mr-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm transition-all duration-200",
              "opacity-0 group-hover:opacity-100",
              "hover:bg-muted hover:text-foreground text-muted-foreground",
              "hover:scale-110 active:scale-95",
              {
                "text-foreground hover:bg-accent opacity-100":
                  isSelected || isFocused,
              },
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <PlusIcon className="h-3 w-3" />
          </button>
        </CreateNoteDialogTrigger>
      </div>
    </div>
  )
}
