"use client"

import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { motion } from "motion/react"
import { createPortal } from "react-dom"
import { useParams } from "react-router"

import { useMoveNote, useNotes } from "@ignita/hooks"
import { cn } from "@ignita/lib"

import { CreateNoteDialogTrigger } from "../dialogs/create-note-dialog"
import { Button } from "../ui/button"
import { Loading } from "../ui/loading"
import { NoteItem } from "./note-item"
import { NoteList } from "./note-list"
import { NotesTreeProvider } from "./notes-tree-context"
import { buildTree, type Note, type NoteWithChildren } from "./utils"

export const NotesTree = () => {
  const { workspaceId } = useParams()
  const [overId, setOverId] = useState<string>()
  const [activeId, setActiveId] = useState<string>()
  const [activeItem, setActiveItem] = useState<NoteWithChildren | null>(null)

  const notes = useNotes({ workspaceId: workspaceId ?? "" })
  const moveNote = useMoveNote({ workspaceId: workspaceId ?? "" })

  const tree = useMemo(() => {
    if (!notes.data) return []
    return buildTree(notes.data)
  }, [notes.data])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItem(event.active.data.current as NoteWithChildren)
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(String(event.over?.id))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null)
    if (!workspaceId) return

    setOverId(undefined)
    setActiveId(undefined)
    const { active, over } = event

    const activeNote = active.data.current as Note
    const overNote = over?.data.current as Note | undefined

    if (activeNote.id === overNote?.id) return

    void moveNote.mutate({
      id: String(active.id),
      parentPath: overNote?.id ?? null,
    })
  }

  return (
    <div className="flex size-full flex-col">
      {!workspaceId && (
        <em className="text-muted-foreground my-4 self-center text-sm">
          No workspace selected
        </em>
      )}

      {notes.isPending && (
        <div className="flex justify-center p-4">
          <Loading className="text-muted-foreground size-5" />
        </div>
      )}

      {notes.isError && (
        <em className="text-destructive my-4 self-center text-sm">
          Error loading notes
        </em>
      )}

      {notes.isSuccess && tree.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.p
            className="text-muted-foreground mb-2 text-sm"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            No notes found
          </motion.p>
          <CreateNoteDialogTrigger
            workspaceId={workspaceId ?? ""}
            parentPath={null}
            asChild
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                className="border-border rounded-full border px-4 py-2 text-sm"
              >
                Create your first note
              </Button>
            </motion.div>
          </CreateNoteDialogTrigger>
        </motion.div>
      )}

      {notes.isSuccess && tree.length > 0 && (
        <NotesTreeProvider>
          <motion.div
            className={cn(
              "scrollbar-thin h-full touch-pan-y overflow-x-hidden overflow-y-auto overscroll-x-none pt-6 pr-2 pl-4",
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
            >
              <NoteList notes={tree} parentPath={null} />
              {createPortal(
                <DragOverlay dropAnimation={{ duration: 0 }}>
                  {activeItem && (
                    <NoteItem note={activeItem} expandedOverride={false} />
                  )}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>
          </motion.div>
        </NotesTreeProvider>
      )}
    </div>
  )
}
