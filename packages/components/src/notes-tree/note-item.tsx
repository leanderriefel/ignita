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
  const highlight =
    (isSelected || sortable.isDragging) && (!sortable.active || !overlay)

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
      className={cn({
        "pointer-events-none ml-1 inline-block w-40 p-0 opacity-75 select-none":
          overlay,
      })}
    >
      <div
        ref={sortable.setDraggableNodeRef}
        className={cn(
          "group mb-1 flex w-full items-center overflow-hidden rounded-full border px-1 py-1 transition-all",
          {
            "from-primary-darker/40 to-primary-lighter/20 z-10 bg-gradient-to-r":
              sortable.isDragging,
            "from-primary-darker/20 to-primary-lighter/10 border-primary/50 bg-gradient-to-r":
              note.id === noteId,
            "bg-secondary hover:bg-secondary text-secondary-foreground shadow-xl":
              overlay,
            "hover:bg-primary/20 hover:border-primary/50": !overlay,
          },
        )}
      >
        {note.children.length > 0 && !overlay ? (
          <button
            className={cn(
              "bg-accent text-accent-foreground cursor-pointer rounded-full p-1.5 text-xs shadow-sm transition-all",
              {
                "bg-primary/20 text-primary-foreground": highlight,
                "group-hover:bg-primary/20 hover:bg-primary/50 group-hover:text-primary-foreground hover:text-primary-foreground":
                  !overlay,
                "rotate-90": expanded,
              },
            )}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleExpand}
          >
            <CaretRightIcon className="size-3" />
          </button>
        ) : null}
        <div
          className="text-foreground ml-2 w-full truncate text-xs font-medium transition-colors"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <Link
            to={`/notes/${note.workspaceId}/${note.id}`}
            prefetch="viewport"
            className="block w-full select-none"
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
              "bg-accent text-accent-foreground ml-auto cursor-pointer rounded-full p-1.5 text-xs shadow-sm transition-all",
              {
                "bg-primary/20 text-primary-foreground": highlight,
                "group-hover:bg-primary/20 hover:bg-primary/50 group-hover:text-primary-foreground hover:text-primary-foreground opacity-0 group-hover:opacity-100":
                  !overlay,
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
            <PlusIcon className="size-3" />
          </button>
        </CreateNoteDialogTrigger>
      </div>
      {/* {note.children.length === 0 &&
        expanded &&
        !overlay &&
        !sortable.isDragging && (
          <div
            className="text-muted-foreground mt-2 mb-1 block text-xs italic"
            style={{ paddingLeft: `${INDENTATION_WIDTH * 2}px` }}
          >
            No notes found
          </div>
        )} */}
    </div>
  )
}

