"use client"

import { useRef, useState } from "react"
import type { ItemInstance } from "@headless-tree/core"
import { useQueryClient } from "@tanstack/react-query"
import { useStore } from "@tanstack/react-store"
import { ChevronRightIcon, EllipsisVertical, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { useUpdateNoteName } from "@ignita/hooks"
import { cn, notesSessionStore, setNote } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { NotePopoverSettingsTrigger } from "./note-popover-settings"
import { INDENTATION_WIDTH, type TreeNote } from "./utils"

type NoteTreeItemProps = {
  item: ItemInstance<TreeNote>
  note: TreeNote
  onOpenCreate: (parentId: string, parentName: string | null) => void
  onOpenDelete: (noteId: string) => void
  onOpenPopover: (noteId: string) => void
  onClosePopover: () => void
  activePopoverId: string | null
}

export const NoteTreeItem = ({
  item,
  note,
  onOpenCreate,
  onOpenDelete,
  onOpenPopover,
  onClosePopover,
  activePopoverId,
}: NoteTreeItemProps) => {
  const { workspaceId, noteId } = useStore(notesSessionStore)

  const isSelected = note.id === noteId
  const isExpanded = item.isExpanded()
  const isOver = item.isDragTarget()

  const [editMode, setEditMode] = useState(false)
  const [tempName, setTempName] = useState(note.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const updateNoteName = useUpdateNoteName(
    {
      workspaceId: workspaceId ?? "",
    },
    {
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("An unknown error occurred")
        }
      },
    },
  )

  const enterEditMode = () => {
    setEditMode(true)
    setTempName(note.name)
  }

  const exitEditMode = () => {
    if (tempName !== note.name) {
      updateNoteName.mutate({
        id: note.id,
        name: tempName,
      })
    }

    setEditMode(false)
    setTempName(note.name)
  }

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

  const handleLinkDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    enterEditMode()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()

      exitEditMode()
    } else if (e.key === "Escape") {
      e.preventDefault()
      exitEditMode()
    }
  }

  const handleBlur = () => {
    exitEditMode()
  }

  return (
    <div
      {...(editMode ? {} : item.getProps())}
      onMouseEnter={handleHover}
      style={{
        paddingLeft: `${item.getItemMeta().level * INDENTATION_WIDTH}px`,
      }}
      className={cn(
        "group mb-0.5 flex h-8 w-full cursor-pointer items-center rounded-md transition-all duration-200 ease-out",
        "border border-transparent",
        {
          "border-muted-foreground/20 bg-background/50": isSelected,
          "hover:border-border hover:bg-accent": !isSelected,
          "bg-primary/25 hover:bg-primary/50": isOver,
        },
      )}
    >
      <button
        className={cn(
          "peer ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm transition-all duration-200",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
          "hover:scale-110 active:scale-95",
          {
            "text-foreground hover:bg-accent": isSelected,
          },
        )}
        onClick={handleCaretClick}
      >
        <ChevronRightIcon
          className={cn("h-3 w-3 transition-transform duration-200", {
            "rotate-90": isExpanded,
          })}
        />
      </button>

      <div
        className={cn(
          "peer min-w-0 flex-1 px-2 text-sm transition-colors duration-200",
          {
            "text-foreground": true,
          },
        )}
      >
        {editMode ? (
          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="inline-flex w-full items-center truncate border-none bg-transparent py-1 text-sm underline underline-offset-2 outline-none"
            autoFocus
          />
        ) : (
          <span
            className="inline-flex w-full cursor-pointer items-center truncate py-1 outline-none select-none"
            onClick={() => setNote(note.id)}
            onDoubleClick={handleLinkDoubleClick}
          >
            {note.name}
          </span>
        )}
      </div>

      <NotePopoverSettingsTrigger
        asChild
        onRename={() => {
          enterEditMode()
          onClosePopover()
        }}
        onDelete={() => onOpenDelete(note.id)}
        open={activePopoverId === note.id}
        onOpenChange={(open) => {
          if (open) {
            onOpenPopover(note.id)
          } else {
            onClosePopover()
          }
        }}
      >
        <button
          className={cn(
            "flex size-6 cursor-pointer items-center justify-center rounded-sm transition-all duration-200",
            "opacity-0 group-hover:opacity-100 group-focus:opacity-100 peer-focus:opacity-100 focus:opacity-100",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            "hover:scale-110 active:scale-95",
            {
              "text-foreground opacity-100 hover:bg-accent": isSelected,
            },
          )}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <EllipsisVertical className="size-3" />
        </button>
      </NotePopoverSettingsTrigger>

      <button
        className={cn(
          "mr-1 flex size-6 cursor-pointer items-center justify-center rounded-sm transition-all duration-200",
          "opacity-0 group-hover:opacity-100 group-focus:opacity-100 peer-focus:opacity-100 focus:opacity-100",
          "text-muted-foreground hover:bg-muted hover:text-foreground",
          "hover:scale-110 active:scale-95",
          {
            "text-foreground opacity-100 hover:bg-accent": isSelected,
          },
        )}
        onClick={(event) => {
          event.stopPropagation()
          onOpenCreate(note.id, note.name)
        }}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <PlusIcon className="size-3" />
      </button>
    </div>
  )
}
