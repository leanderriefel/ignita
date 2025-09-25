"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { usePostHog } from "posthog-js/react"
import { z } from "zod"

import { useCreateNote } from "@ignita/hooks"
import { setNote } from "@ignita/lib"
import { defaultNote, defaultTextNote, type Note } from "@ignita/lib/notes"

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
import { Label } from "../ui/label"
import { Loading } from "../ui/loading"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

type NoteTypeOption = {
  value: Note["type"]
  label: string
  description?: string
}

const noteTypeOptions: NoteTypeOption[] = [
  { value: "text", label: "Text" },
  { value: "directory", label: "Directory" },
  { value: "board", label: "Board" },
  { value: "canvas", label: "Canvas" },
]

const NoteTypeSelector = ({
  value,
  onChange,
}: {
  value: Note["type"]
  onChange: (value: Note["type"]) => void
}) => {
  const primaryOptions = noteTypeOptions.filter((option) =>
    ["text", "directory"].includes(option.value),
  )
  const secondaryOptions = noteTypeOptions.filter(
    (option) => !["text", "directory"].includes(option.value),
  )
  const selectedSecondaryOption = secondaryOptions.find(
    (option) => option.value === value,
  )

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-border bg-muted/30 p-1">
        {primaryOptions.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "primary" : "ghost"}
            className="grow rounded-lg text-xs font-medium"
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <Select
        key={value}
        value={selectedSecondaryOption?.value}
        onValueChange={(nextValue) => onChange(nextValue as Note["type"])}
      >
        <SelectTrigger className="w-full justify-between rounded-xl border-border text-sm font-medium">
          <SelectValue placeholder="Other Types" />
        </SelectTrigger>
        <SelectContent className="w-full">
          {secondaryOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export const CreateNoteDialogTrigger = ({
  workspaceId,
  parentId,
  parentName,
  children,
  asChild,
  className,
}: {
  workspaceId: string
  parentId: string | null
  parentName: string | null
  children: React.ReactNode
  asChild?: boolean
  className?: string
}) => {
  const [open, setOpen] = useState(false)

  const posthog = usePostHog()

  const createNoteMutation = useCreateNote({
    onSuccess: (data) => {
      setNote(data.id)
    },
    onSettled: () => {
      form.reset()
      setOpen(false)
    },
  })

  const form = useForm({
    defaultValues: {
      name: "",
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
      <DialogContent className="sm:max-w-112">
        <DialogHeader>
          <DialogTitle>
            Create a new note {parentName ? `in ${parentName}` : ""}
          </DialogTitle>
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
              <div className="mb-6 space-y-0.5">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full"
                  autoFocus
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
              <NoteTypeSelector
                value={field.state.value}
                onChange={field.handleChange}
              />
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
