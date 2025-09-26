"use client"

import { usePostHog } from "posthog-js/react"
import { toast } from "sonner"

import { useDeleteNote } from "@ignita/hooks"
import { setNote } from "@ignita/lib"
import type { RouterOutputs } from "@ignita/trpc"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Loading } from "../ui/loading"

export type DeleteNoteDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  note: NonNullable<RouterOutputs["notes"]["getNotes"]>[number]
}

export const DeleteNoteDialog = ({
  isOpen,
  onOpenChange,
  note,
}: DeleteNoteDialogProps) => {
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

        setNote(null)
        toast.success("Note deleted successfully")
      },
      onSettled: () => {
        onOpenChange(false)
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("An unknown error occurred")
        }
      },
    },
  )

  const handleCancel = () => {
    onOpenChange(false)
  }

  const handleDelete = () => {
    deleteNoteMutation.mutate({ id: note.id })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          deleteNoteMutation.reset()
        }
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-96">
        <DialogHeader>
          <DialogTitle>Confirm Note Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-bold">{note.name}</span>?
            <br /> <br />
            This action cannot be undone and will permanently delete the note
            and all of its children.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 pt-4">
          <Button variant="outline" className="w-full" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={deleteNoteMutation.isPending}
          >
            {deleteNoteMutation.isPending ? (
              <Loading
                className="size-4 border-destructive-foreground"
                variant="none"
              />
            ) : (
              "Delete Note"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
