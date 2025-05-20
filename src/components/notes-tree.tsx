"use client"

import { CreateNoteDialogTrigger } from "@/components/dialogs/create-note-dialog"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { useTRPC } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { type RouterOutputs } from "@/trpc/query-provider"
import {
  DndContext,
  rectIntersection,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  restrictToFirstScrollableAncestor,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import { CaretRightIcon, DragHandleDots2Icon } from "@radix-ui/react-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export const NoteItem = ({
  note,
}: {
  note: {
    id: string
    parentId: string | null
    name: string
    workspaceId: string
  }
}) => {
  const { workspaceId, noteId } = useParams<{
    workspaceId: string
    noteId?: string
  }>()
  const trpc = useTRPC()

  const children = useQuery(
    trpc.notes.getNotesByParentId.queryOptions(
      { workspaceId, parentId: note.id ?? null },
      { enabled: !!workspaceId },
    ),
  )

  const [expanded, setExpanded] = useState(false)

  const droppable = useDroppable({ id: note.id, data: note })
  const draggable = useDraggable({ id: note.id, data: note })

  return (
    <motion.div
      className="relative flex flex-col w-full rounded-md transition-colors"
      ref={draggable.setNodeRef}
      animate={
        draggable.transform
          ? {
              translateX: draggable.transform.x,
              translateY: draggable.transform.y,
              scale: draggable.isDragging ? 1.1 : 1,
              zIndex: draggable.isDragging ? 40 : 0,
              opacity: draggable.isDragging ? 0.6 : 1,
            }
          : {
              translateX: 0,
              translateY: 0,
              scale: 1,
              zIndex: 0,
              opacity: 1,
            }
      }
      transition={{
        duration: !draggable.isDragging ? 0.25 : 0,
        easings: {
          type: "spring",
        },
        scale: {
          duration: 0.25,
        },
        zIndex: {
          delay: draggable.isDragging ? 0 : 0.25,
        },
      }}
    >
      <motion.div
        className={cn(
          "flex items-center px-2 py-1.5 rounded-sm hover:bg-primary/20 transition-all group relative mb-1",
          {
            "bg-primary/15": note.id === noteId,
          },
          {
            "outline-primary outline":
              (droppable.isOver && note.id !== noteId) || draggable.isDragging,
          },
        )}
        ref={droppable.setNodeRef}
      >
        <motion.button
          initial={false}
          transition={{ duration: 0.2 }}
          animate={{ rotate: expanded ? 90 : 0 }}
          className="cursor-pointer mr-2 text-xs rounded-sm bg-secondary/70 p-1 text-secondary-foreground hover:bg-secondary transition-colors"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <CaretRightIcon className="size-3" />
        </motion.button>
        <div className="text-sm font-medium text-foreground truncate transition-colors w-full">
          <Link
            href={`/notes/${note.workspaceId}/${note.id}`}
            className="w-full block select-none"
            prefetch
          >
            {note.name}
          </Link>
        </div>
        <div
          className="absolute right-2 overflow-hidden cursor-grab active:cursor-grabbing bg-primary rounded-[0.35rem] translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all"
          {...draggable.listeners}
          ref={draggable.setActivatorNodeRef}
        >
          <div className="bg-secondary/60 p-1">
            <DragHandleDots2Icon className="size-3" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && !draggable.isDragging && (
          <motion.div
            key={`${note.id}-children`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l ml-2"
          >
            <NoteList
              className="pl-3"
              parentId={note.id}
              notes={children.data ?? []}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export const NoteList = ({
  notes,
  parentId,
  className,
}: {
  notes: {
    id: string
    parentId: string | null
    name: string
    workspaceId: string
  }[]
  parentId: string | undefined
  className?: string
}) => {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  return (
    <div className={cn("flex flex-col size-full", className)}>
      <motion.div
        key={`group-${parentId ?? "root"}`}
        initial="hidden"
        animate="visible"
        className="space-y-0.25"
      >
        {notes
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((note, index) => (
            <motion.div
              key={note.id}
              className="w-full"
              variants={{
                hidden: { opacity: 0, y: -10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut",
              }}
            >
              <NoteItem note={note} />
            </motion.div>
          ))}
      </motion.div>

      <div>
        {notes.length === 0 && (
          <motion.em
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
            }}
            className="text-muted-foreground text-xs block pl-4 mt-2 mb-1 italic"
          >
            No notes found
          </motion.em>
        )}

        <CreateNoteDialogTrigger
          workspaceId={workspaceId}
          parentId={parentId}
          asChild
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: notes.length ? notes.length * 0.1 : 0.1,
              ease: "easeOut",
            }}
            className="w-full"
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs justify-start px-3 py-2 text-muted-foreground hover:bg-muted rounded-md font-medium"
            >
              <span className="mr-1.5 opacity-70">+</span> create new note
            </Button>
          </motion.div>
        </CreateNoteDialogTrigger>
      </div>
    </div>
  )
}

export const SidebarNotesSelection = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const notesQuery = useQuery(
    trpc.notes.getNotesByParentId.queryOptions(
      { workspaceId, parentId: null },
      { enabled: !!workspaceId },
    ),
  )

  const [overId, setOverId] = useState<string>()
  const [activeId, setActiveId] = useState<string>()

  const moveNoteMutation = useMutation(trpc.notes.moveNote.mutationOptions())

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(String(event.over?.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setOverId(undefined)
    setActiveId(undefined)
    const { active, over } = event

    const activeNote = active.data.current as Omit<
      NonNullable<RouterOutputs["notes"]["getNote"]>,
      "children" | "content"
    >
    const overNote = over?.data.current
      ? (over?.data.current as unknown as Omit<
          NonNullable<RouterOutputs["notes"]["getNote"]>,
          "children" | "content"
        >)
      : null

    if (activeNote.id === overNote?.id) return
    if ((activeNote.parentId ?? null) === (overNote?.id ?? null)) return

    void queryClient.cancelQueries({
      queryKey: trpc.notes.pathKey(),
    })

    queryClient.setQueryData(
      trpc.notes.getNotesByParentId.queryKey({
        parentId: activeNote?.parentId ?? null,
        workspaceId: workspaceId,
      }),
      (old) => old?.filter((n) => n.id !== active.id) ?? [],
    )

    queryClient.setQueryData(
      trpc.notes.getNotesByParentId.queryKey({
        parentId: overNote?.id ?? null,
        workspaceId: workspaceId,
      }),
      (old) => [
        ...(old ?? []),
        { ...activeNote, parentId: overNote?.id ?? null, children: [] },
      ],
    )

    void moveNoteMutation.mutate(
      {
        id: String(active.id),
        parentId: over?.id ? String(over.id) : null,
      },
      {
        onSettled: () =>
          void queryClient.invalidateQueries({
            queryKey: trpc.notes.pathKey(),
          }),
      },
    )
  }

  return (
    <div className="flex flex-col size-full">
      {!workspaceId && (
        <em className="text-muted-foreground text-sm self-center my-4">
          No workspace selected
        </em>
      )}

      {notesQuery.isLoading && (
        <div className="flex justify-center p-4">
          <Loading className="size-5 text-muted-foreground" />
        </div>
      )}

      {notesQuery.isError && (
        <em className="text-destructive text-sm self-center my-4">
          Error loading notes
        </em>
      )}

      {notesQuery.isSuccess && notesQuery.data.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            className="text-muted-foreground text-sm mb-2"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            No notes found
          </motion.p>
          <CreateNoteDialogTrigger
            workspaceId={workspaceId}
            parentId={undefined}
            asChild
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                className="px-4 py-2 rounded-full border border-border text-sm"
              >
                Create your first note
              </Button>
            </motion.div>
          </CreateNoteDialogTrigger>
        </motion.div>
      )}

      {notesQuery.isSuccess && notesQuery.data.length > 0 && (
        <motion.div
          className={cn(
            "overflow-y-auto overflow-x-hidden h-full scrollbar-thin pl-6 pr-4 overscroll-x-none touch-pan-y",
            {
              "bg-primary/25": !overId && activeId,
            },
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <DndContext
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            modifiers={[
              restrictToFirstScrollableAncestor,
              restrictToVerticalAxis,
            ]}
          >
            <NoteList notes={notesQuery.data} parentId={undefined} />
          </DndContext>
        </motion.div>
      )}
    </div>
  )
}
