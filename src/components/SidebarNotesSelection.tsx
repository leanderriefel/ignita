"use client"

import { CreateNoteDialogTrigger } from "@/components/dialogs/CreateNoteDialog"
import { Button } from "@/components/ui/Button"
import { Loading } from "@/components/ui/Loading"
import { useTRPC } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { type RouterOutputs } from "@/trpc/provider"
import { useQueries, useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState } from "react"

export const NoteItem = ({
  note,
}: {
  note: NonNullable<RouterOutputs["notes"]["getNote"]>
}) => {
  const trpc = useTRPC()
  const childrenOfChildren = useQueries({
    queries: note.children.map((child) =>
      trpc.notes.getNotesByParentId.queryOptions({ parentId: child.id }),
    ),
  })

  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className="flex flex-col w-full rounded-md overflow-hidden transition-colors"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <motion.div
        className="flex items-center px-2 py-1.5 rounded-sm hover:bg-accent/50 transition-colors"
        whileTap={{ scale: 0.98 }}
        layout
      >
        <motion.button
          className="flex justify-center items-center cursor-pointer w-5 h-5 mr-2 text-xs rounded-sm bg-secondary/70 text-secondary-foreground hover:bg-secondary transition-colors"
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "−" : "+"}
        </motion.button>
        <motion.div
          className="text-sm font-medium text-foreground truncate transition-colors"
          layout
        >
          <Link href={`/notes/${note.workspaceId}/${note.id}`}>
            {note.name}
          </Link>
        </motion.div>
      </motion.div>{" "}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <NoteList
            className="pl-4 border-l border-l-border/60 ml-3"
            parentId={note.id}
            notes={note.children.map((child) => ({
              ...child,
              children:
                childrenOfChildren.find(
                  (query) => query.data?.[0]?.parentId === child.id,
                )?.data ?? [],
            }))}
          />
        </motion.div>
      )}
    </motion.div>
  )
}

export const NoteList = ({
  notes,
  parentId,
  className,
}: {
  notes: NonNullable<RouterOutputs["notes"]["getNote"]>[]
  parentId: string | undefined
  className?: string
}) => {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  return (
    <motion.div
      className={cn("flex flex-col w-full", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
    >
      <motion.div className="space-y-0.5" layout>
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <NoteItem note={note} />
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {notes.length === 0 && (
          <motion.em
            className="text-muted-foreground text-xs block pl-4 mt-2 mb-1 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            No notes found
          </motion.em>
        )}
        <CreateNoteDialogTrigger
          workspaceId={workspaceId}
          parentId={parentId}
          asChild
        >
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs justify-start px-3 py-2 text-muted-foreground hover:bg-muted rounded-md font-medium"
            >
              <span className="mr-1.5 opacity-70">+</span> create new note
            </Button>
          </motion.div>
        </CreateNoteDialogTrigger>
      </motion.div>
    </motion.div>
  )
}

export const SidebarNotesSelection = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  const trpc = useTRPC()

  const notesQuery = useQuery(
    trpc.notes.getTopNotes.queryOptions(
      { workspaceId: workspaceId },
      { enabled: !!workspaceId },
    ),
  )

  return (
    <motion.div
      className="flex flex-col p-3 overflow-hidden h-full w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!workspaceId && (
        <motion.em
          className="text-muted-foreground text-sm self-center my-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          No workspace selected
        </motion.em>
      )}

      {notesQuery.isLoading && (
        <motion.div
          className="flex justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Loading className="size-5 text-muted-foreground" />
        </motion.div>
      )}

      {notesQuery.isError && (
        <motion.p
          className="text-destructive text-sm self-center my-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Error loading notes
        </motion.p>
      )}

      {notesQuery.isSuccess && notesQuery.data.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-muted-foreground text-sm mb-2">No notes found</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CreateNoteDialogTrigger
              workspaceId={workspaceId}
              parentId={undefined}
              asChild
            >
              <Button
                variant="ghost"
                className="px-4 py-2 rounded-full border border-border text-sm"
              >
                Create your first note
              </Button>
            </CreateNoteDialogTrigger>
          </motion.div>
        </motion.div>
      )}

      {notesQuery.isSuccess && notesQuery.data.length > 0 && (
        <motion.div
          className="overflow-y-auto max-h-[calc(100vh-12rem)] pr-1 scrollbar-thin"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NoteList notes={notesQuery.data} parentId={undefined} />
        </motion.div>
      )}
    </motion.div>
  )
}
