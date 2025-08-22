"use client"

import { useRef, useState } from "react"
import type { ItemInstance } from "@headless-tree/core"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronRightIcon, EllipsisVertical, PlusIcon } from "lucide-react"
import { Link, useParams } from "react-router"

import { useUpdateNoteName } from "@ignita/hooks"
import { cn } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { CreateNoteDialogTrigger } from "../dialogs/create-note-dialog"
import { NotePopoverSettingsTrigger } from "./note-popover-settings"
import { INDENTATION_WIDTH, type TreeNote } from "./utils"

type NoteTreeItemProps = {
  item: ItemInstance<TreeNote>
}

export const NoteTreeItem = ({ item }: NoteTreeItemProps) => {
  const { workspaceId, noteId } = useParams()
  const note = item.getItemData()

  const isSelected = note.id === noteId
  const isExpanded = item.isExpanded()
  const isOver = item.isDragTarget()

  const [editMode, setEditMode] = useState(false)
  const [tempName, setTempName] = useState(note.name)
  const inputRef = useRef<HTMLInputElement>(null)

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const updateNoteName = useUpdateNoteName({
    workspaceId: workspaceId ?? "",
  })

  const enterEditMode = () => {
    setEditMode(true)
    setTempName(note.name)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
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
      {...item.getProps()}
      onMouseEnter={handleHover}
      style={{
        paddingLeft: `${item.getItemMeta().level * INDENTATION_WIDTH}px`,
      }}
      className={cn(
        "group mb-0.5 flex h-8 w-full cursor-pointer items-center rounded-md transition-all duration-200 ease-out",
        "border border-transparent",
        {
          "border-muted-foreground/20 bg-muted": isSelected,
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
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <Link
            to={`/notes/${note.workspaceId}/${note.id}`}
            prefetch="viewport"
            className="inline-flex w-full items-center truncate py-1 outline-none select-none focus:outline-none"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleLinkDoubleClick}
          >
            {note.name}
          </Link>
        )}
      </div>

      <NotePopoverSettingsTrigger note={note} asChild onRename={enterEditMode}>
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

      <CreateNoteDialogTrigger
        workspaceId={workspaceId ?? ""}
        parentId={note.id}
        asChild
      >
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
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <PlusIcon className="size-3" />
        </button>
      </CreateNoteDialogTrigger>
    </div>
  )
}
