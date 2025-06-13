import { motion } from "motion/react"
import { useParams } from "react-router"

import { cn } from "@ignita/lib"

import { CreateNoteDialogTrigger } from "../dialogs/create-note-dialog"
import { Button } from "../ui/button"
import { NoteItem } from "./note-item"
import type { NoteWithChildren } from "./utils"

type NoteListProps = {
  notes: NoteWithChildren[]
  parentPath: string | null
  className?: string
}

export const NoteList = ({ notes, parentPath, className }: NoteListProps) => {
  const { workspaceId } = useParams()

  return (
    <div className={cn("flex size-full flex-col", className)}>
      <motion.div
        key={`group-${parentPath ?? "root"}`}
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
                duration: 0.2,
                delay: index * 0.05,
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
            className="text-muted-foreground mt-2 mb-1 block pl-4 text-xs italic"
          >
            No notes found
          </motion.em>
        )}

        <CreateNoteDialogTrigger
          workspaceId={workspaceId ?? ""}
          parentPath={parentPath}
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
              className="text-muted-foreground hover:bg-muted w-full justify-start rounded-md px-3 py-2 text-xs font-medium"
            >
              <span className="mr-1.5 opacity-70">+</span> create new note
            </Button>
          </motion.div>
        </CreateNoteDialogTrigger>
      </div>
    </div>
  )
}
