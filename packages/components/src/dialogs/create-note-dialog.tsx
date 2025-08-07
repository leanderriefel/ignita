"use client"

import { useState } from "react"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { useForm } from "@tanstack/react-form"
import { usePostHog } from "posthog-js/react"
import { useNavigate } from "react-router"
import { z } from "zod"

import { useCreateNote } from "@ignita/hooks"
import {
  defaultNote,
  defaultTextNote,
  noteTypes,
  type Note,
} from "@ignita/lib/notes"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export const CreateNoteDialogTrigger = ({
  workspaceId,
  parentId,
  children,
  asChild,
  className,
}: {
  workspaceId: string
  parentId: string | null
  children: React.ReactNode
  asChild?: boolean
  className?: string
}) => {
  const [open, setOpen] = useState(false)

  const navigate = useNavigate()

  const posthog = usePostHog()

  const createNoteMutation = useCreateNote({
    onSuccess: (data) => {
      navigate(`/notes/${data.workspaceId}/${data.id}`)
    },
    onSettled: () => {
      form.reset()
      setOpen(false)
    },
  })

  const form = useForm({
    defaultValues: {
      name: "note",
      type: "text" as Note["type"],
    },
    onSubmit: async ({ value }) => {
      createNoteMutation.mutate(
        {
          workspaceId,
          parentId,
          name: value.name,
          note: defaultNote(value.type) ?? defaultTextNote,
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
              <div className="space-y-0.5">
                <label htmlFor={field.name} className="ml-1 text-sm">
                  Name
                </label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full"
                />
                {!field.state.meta.isValid ? (
                  <em className="text-sm text-destructive">
                    {field.state.meta.errors
                      .map((error) => error?.message)
                      .join(",")}
                  </em>
                ) : null}
              </div>
            )}
          </form.Field>
          <form.Field name="type">
            {(field) => (
              <div className="mt-4 space-y-0.5">
                <label htmlFor={field.name} className="ml-1 text-sm">
                  Type
                </label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) =>
                    field.handleChange(value as Note["type"])
                  }
                >
                  <SelectTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <SelectValue placeholder="Select a note type" />
                      <ChevronDownIcon className="size-4" />
                    </Button>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(noteTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
          <form.Subscribe
            selector={(formState) => ({
              canSubmit: formState.canSubmit,
              isSubmitting: formState.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button
                type="submit"
                className="mt-6 w-full"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <Loading className="size-6 fill-primary-foreground" />
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
