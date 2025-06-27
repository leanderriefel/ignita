import { useState } from "react"
import { useDndMonitor, useDraggable, useDroppable } from "@dnd-kit/core"
import { CaretRightIcon, PlusIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "motion/react"
import { Link, useParams } from "react-router"

import { cn } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { CreateNoteDialogTrigger } from "../dialogs/create-note-dialog"
import { NoteList } from "./note-list"
import { useNotesTreeContext } from "./notes-tree-context"
import type { NoteWithChildren } from "./utils"

type NoteItemProps = {
  note: NoteWithChildren
  expandedOverride?: boolean
}

export const NoteItem = ({ note, expandedOverride }: NoteItemProps) => {
  const { workspaceId, noteId } = useParams()
  const { expandedMap, toggleExpanded, setExpanded } = useNotesTreeContext()
  const [dialogOpen, setDialogOpen] = useState(false)
  const expanded = expandedOverride ?? expandedMap[note.id] ?? false

  const droppable = useDroppable({ id: note.id, data: note })
  const draggable = useDraggable({
    id: note.id,
    data: note,
    disabled: dialogOpen,
  })

  const isSelected = note.id === noteId
  const highlight = isSelected || (droppable.isOver && !draggable.isDragging)

  useDndMonitor({
    onDragEnd: (event) => {
      const overId = event.over?.id ? String(event.over.id) : null
      const activeId = String(event.active.id)
      if (
        (overId === note.id && overId !== activeId) ||
        (note.id === activeId && !overId)
      ) {
        setExpanded(note.id, true)
      }
    },
  })

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
      className={cn(
        "relative flex w-full flex-col rounded-full transition-colors",
        {
          "z-10 opacity-50": draggable.isDragging,
        },
      )}
      ref={draggable.setNodeRef}
      {...draggable.listeners}
      {...draggable.attributes}
    >
      <motion.div
        className={cn(
          "hover:bg-primary/20 group outline-primary/50 relative mb-1 flex items-center overflow-hidden rounded-full px-1 py-1 transition-all",
          {
            "from-primary-darker/20 to-primary-lighter/10 outline-primary/50 bg-gradient-to-r outline":
              note.id === noteId && !draggable.active,
            "from-primary-darker/10 to-primary-lighter/5 outline-primary/25 bg-gradient-to-r outline":
              note.id === noteId && !!draggable.active,
            "bg-primary/20 outline-primary outline":
              droppable.isOver && !draggable.isDragging && note.id !== noteId,
            "outline-border outline": draggable.isDragging,
          },
        )}
        ref={droppable.setNodeRef}
        transition={{ duration: 0.1 }}
        onMouseEnter={handleHover}
      >
        <motion.button
          initial={false}
          transition={{ duration: 0.2 }}
          animate={{ rotate: expanded ? 90 : 0 }}
          className={cn(
            "group-hover:bg-primary/20 bg-accent group-hover:text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground text-accent-foreground mr-2 cursor-pointer rounded-full p-1 text-xs shadow-sm transition-colors",
            {
              "bg-primary/20 text-primary-foreground": highlight,
            },
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => toggleExpanded(note.id)}
        >
          <CaretRightIcon className="size-3" />
        </motion.button>
        <div className="text-foreground w-full truncate text-xs font-medium transition-colors">
          <Link
            to={`/notes/${note.workspaceId}/${note.id}`}
            prefetch="viewport"
            className="block w-full select-none"
          >
            {note.name}
          </Link>
        </div>
        <CreateNoteDialogTrigger
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          workspaceId={workspaceId ?? ""}
          parentPath={note.id}
          asChild
        >
          <button
            className={cn(
              "group-hover:bg-primary/20 bg-accent group-hover:text-primary-foreground hover:bg-primary/50 hover:text-primary-foreground text-accent-foreground ml-auto cursor-pointer rounded-full p-1 text-xs opacity-0 shadow-sm transition-all group-hover:opacity-100",
              {
                "bg-primary/20 text-primary-foreground": highlight,
                "opacity-100": isSelected,
              },
            )}
          >
            <PlusIcon className="size-3" />
          </button>
        </CreateNoteDialogTrigger>
      </motion.div>

      <AnimatePresence>
        {expanded && !draggable.isDragging && expandedOverride !== false && (
          <motion.div
            key={`${note.id}-children`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="ml-2 border-l"
          >
            <NoteList
              className="pl-3"
              parentPath={note.id}
              notes={note.children}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

