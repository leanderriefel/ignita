import { useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CaretRightIcon, PlusIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router"

import { cn } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { CreateNoteDialogTrigger } from "../dialogs/create-note-dialog"
import { INDENTATION_WIDTH, type TreeNote } from "./utils"

type NoteItemProps = {
  note: TreeNote
  depth: number
  expanded: boolean
  onToggleExpand: () => unknown
  overlay?: boolean
}

export const NoteItem = ({
  note,
  depth,
  expanded,
  onToggleExpand,
  overlay,
}: NoteItemProps) => {
  const { workspaceId, noteId } = useParams()

  const sortable = useSortable({
    id: note.id,
    animateLayoutChanges: ({ isSorting, wasDragging }) =>
      !(isSorting || wasDragging),
  })

  const isSelected = note.id === noteId
  const isActive = sortable.isDragging || isSelected

  useEffect(() => {
    if (!overlay) return
    // eslint-disable-next-line no-console
    console.log("transform", CSS.Transform.toString(sortable.transform))
    // eslint-disable-next-line no-console
    console.log("transition", sortable.transition)
  }, [overlay, sortable.transform, sortable.transition])

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

  return (
    <div
      ref={sortable.setDroppableNodeRef}
      onMouseEnter={handleHover}
      style={{
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        paddingLeft: overlay ? 0 : `${depth * INDENTATION_WIDTH}px`,
      }}
      className={cn("relative", {
        "pointer-events-none ml-1 inline-block w-40 opacity-75 select-none":
          overlay,
      })}
    >
      <div
        style={{}}
        ref={sortable.setDraggableNodeRef}
        className={cn(
          "group relative mb-0.5 flex h-8 w-full cursor-pointer items-center rounded-md transition-all duration-200 ease-out",
          "border border-transparent",
          {
            "bg-card border-border z-20 scale-[1.02] shadow-lg":
              sortable.isDragging,
            "bg-muted border-muted-foreground/20":
              isSelected && !sortable.isDragging,
            "bg-card border-border shadow-xl": overlay,
            "hover:bg-accent hover:border-border":
              !overlay && !isSelected && !sortable.isDragging,
          },
        )}
        {...sortable.attributes}
        {...sortable.listeners}
      >
        {!overlay && note.children.length > 0 && (
          <button
            className={cn(
              "ml-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm transition-all duration-200",
              "hover:bg-muted hover:text-foreground text-muted-foreground",
              "hover:scale-110 active:scale-95",
              {
                "text-foreground hover:bg-accent": isSelected,
              },
            )}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleExpand}
          >
            <CaretRightIcon
              className={cn("h-3 w-3 transition-transform duration-200", {
                "rotate-60": expanded,
              })}
            />
          </button>
        )}

        <div
          className={cn(
            "min-w-0 flex-1 px-2 py-1 text-sm transition-colors duration-200",
            {
              "ml-1": !note.children.length || overlay,
              "text-foreground": true,
            },
          )}
        >
          <Link
            to={`/notes/${note.workspaceId}/${note.id}`}
            prefetch="viewport"
            className="block w-full truncate outline-none select-none focus:outline-none"
          >
            {note.name}
          </Link>
        </div>

        {!overlay && (
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
                  "text-foreground hover:bg-accent opacity-100": isActive,
                },
              )}
              onPointerDown={(e) => e.stopPropagation()}
              onDragStart={(e) => e.stopPropagation()}
              onDragEnd={(e) => e.stopPropagation()}
              onDragOver={(e) => e.stopPropagation()}
              onDragEnter={(e) => e.stopPropagation()}
              onDragLeave={(e) => e.stopPropagation()}
              onDrag={(e) => e.stopPropagation()}
              onDrop={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <PlusIcon className="h-3 w-3" />
            </button>
          </CreateNoteDialogTrigger>
        )}
      </div>
    </div>
  )
}
