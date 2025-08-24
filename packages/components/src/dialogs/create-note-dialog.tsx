"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { motion } from "motion/react"
import { usePostHog } from "posthog-js/react"
import { useNavigate } from "react-router"
import { z } from "zod"

import { useCreateNote } from "@ignita/hooks"
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
import { Loading } from "../ui/loading"

type NoteTypeOption = {
  value: Note["type"]
  label: string
  description?: string
}

const noteTypeOptions: NoteTypeOption[] = [
  { value: "board", label: "Board" },
  { value: "text", label: "Text" },
  { value: "directory", label: "Directory" },
]

const NoteTypeSelector = ({
  value,
  onChange,
}: {
  value: Note["type"]
  onChange: (value: Note["type"]) => void
}) => {
  return (
    <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-xl border border-border bg-muted/30 p-1">
      {noteTypeOptions.map((option) => (
        <Button
          key={option.value}
          variant="ghost"
          className="relative w-full flex-col gap-1 rounded-lg border-0 bg-transparent p-3 text-xs font-medium transition-all duration-200 hover:bg-background/80 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
          onClick={() => onChange(option.value)}
        >
          <motion.div
            className="relative z-10"
            animate={{
              color:
                value === option.value
                  ? "hsl(var(--primary-foreground))"
                  : "hsl(var(--foreground))",
            }}
            transition={{ duration: 0.2 }}
          >
            {option.label}
          </motion.div>
          {value === option.value && (
            <motion.div
              layoutId="note-type-active"
              className="absolute inset-0 rounded-lg bg-primary/50 shadow-sm"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1,
                bounce: 0,
              }}
            />
          )}
        </Button>
      ))}
    </div>
  )
}

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
              <div className="mb-6 space-y-0.5">
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
