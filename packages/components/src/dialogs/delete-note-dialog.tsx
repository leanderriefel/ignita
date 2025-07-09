"use client"

import { useState } from "react"
import { usePostHog } from "posthog-js/react"
import { useLocation, useNavigate } from "react-router"

import { useDeleteNote } from "@ignita/hooks"
import type { RouterOutputs } from "@ignita/trpc"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Loading } from "../ui/loading"

export type DeleteNoteDialogTriggerProps = {
  note: NonNullable<RouterOutputs["notes"]["getNotes"]>[number]
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export const DeleteNoteDialogTrigger = ({
  note,
  children,
  asChild,
  className,
}: DeleteNoteDialogTriggerProps) => {
  const [open, setOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const posthog = usePostHog()

  const deleteNoteMutation = useDeleteNote(
    { workspaceId: note.workspaceId },
    {
      onSuccess: () => {
        posthog.capture("note_deleted", {
          name: note.name,
          workspaceId: note.workspaceId,
          noteId: note.id,
        })

        if (location.pathname.includes(note.id)) {
          navigate(`/notes/${note.workspaceId}`)
        }
      },
      onSettled: () => {
        setOpen(false)
      },
    },
  )

  const handleDelete = () => {
    deleteNoteMutation.mutate({ id: note.id })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild} className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-96">
        <DialogHeader>
          <DialogTitle>Confirm Note Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{note.name}"? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteNoteMutation.isPending}
          >
            {deleteNoteMutation.isPending ? (
              <Loading className="fill-destructive-foreground size-6" />
            ) : (
              "Delete Note"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
