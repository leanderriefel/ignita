"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usePostHog } from "posthog-js/react"
import { useNavigate } from "react-router"
import { z } from "zod"

import { useTRPC } from "@ignita/trpc/client"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Loading } from "../ui/loading"

export const CreateNoteDialogTrigger = ({
  workspaceId,
  parentId,
  children,
  asChild,
  className,
}: {
  workspaceId: string
  parentId: string | undefined
  children: React.ReactNode
  asChild?: boolean
  className?: string
}) => {
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const trpc = useTRPC()

  const posthog = usePostHog()

  const createNoteMutation = useMutation(
    trpc.notes.createNote.mutationOptions({
      onSuccess: (data) => {
        navigate(`/notes/${data.workspaceId}/${data.id}`)
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.notes.pathKey(),
        })
        form.reset()
        setOpen(false)
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: "note",
    },
    onSubmit: async ({ value }) => {
      createNoteMutation.mutate(
        {
          workspaceId,
          parentId,
          name: value.name,
          note: {
            type: "text",
            content: "",
          },
        },
        {
          onSuccess: (data) => {
            posthog.capture("note_created", {
              name: data.name,
              workspaceId: data.workspaceId,
              noteId: data.id,
            })
          },
        },
      )
    },
  })

  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild} className={className}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-96">
        <DialogHeader>
          <DialogTitle>Create a new note</DialogTitle>
          <DialogDescription>
            Give your note a name and hit create.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field
            validators={{
              onBlur: z
                .string()
                .min(1, "Name is required")
                .max(12, "Name is too long"),
            }}
            name="name"
          >
            {(field) => (
              <>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full"
                />
                {!field.state.meta.isValid ? (
                  <em className="text-destructive text-sm">
                    {field.state.meta.errors
                      .map((error) => error?.message)
                      .join(",")}
                  </em>
                ) : null}
              </>
            )}
          </form.Field>
          <form.Subscribe
            selector={(formState) => [
              formState.canSubmit,
              formState.isSubmitting,
            ]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="mt-4 w-full"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <Loading className="fill-primary-foreground size-6" />
                ) : (
                  "Create"
                )}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  )
}
