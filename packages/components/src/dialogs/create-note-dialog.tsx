"use client"

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react"
import { revalidateLogic } from "@tanstack/form-core"
import { useForm } from "@tanstack/react-form"
import { usePostHog } from "posthog-js/react"
import { toast } from "sonner"
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
  const { primaryOptions, secondaryOptions } = useMemo(() => {
    const primary = noteTypeOptions.filter(
      (option) => option.value === "text" || option.value === "directory",
    )
    const secondary = noteTypeOptions.filter(
      (option) => option.value !== "text" && option.value !== "directory",
    )

    return { primaryOptions: primary, secondaryOptions: secondary }
  }, [])
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

export type CreateNoteDialogTarget = {
  workspaceId: string
  parentId: string | null
  parentName: string | null
}

export type CreateNoteDialogProps = {
  target: CreateNoteDialogTarget | null
  onClose: () => void
}

export type CreateNoteDialogRef = {
  focusNameInput: () => void
}

export const CreateNoteDialog = forwardRef<
  CreateNoteDialogRef,
  CreateNoteDialogProps
>(({ target, onClose }, ref) => {
  const posthog = usePostHog()

  const createNoteMutation = useCreateNote({
    onSuccess: (data) => {
      form.reset()
      onClose()
      posthog.capture("note_created", {
        name: data.name,
        workspaceId: data.workspaceId,
        noteId: data.id,
      })
      setNote(data.id)
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("An unknown error occurred")
      }
    },
  })

  const form = useForm({
    defaultValues: {
      name: "",
      type: "text" as Note["type"],
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      if (!target) return
      try {
        await createNoteMutation.mutateAsync({
          workspaceId: target.workspaceId,
          parentId: target.parentId,
          name: value.name,
          note: defaultNote(value.type) ?? defaultTextNote,
        })
      } catch {
        return
      }
    },
  })

  const nameInputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    focusNameInput: () => {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    },
  }))

  useEffect(() => {
    if (target) {
      const frame = requestAnimationFrame(() => {
        nameInputRef.current?.focus()
        nameInputRef.current?.select()
      })
      return () => cancelAnimationFrame(frame)
    }

    form.reset()
    return undefined
  }, [target])

  return (
    <Dialog
      open={Boolean(target)}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-112">
        <DialogHeader>
          <DialogTitle>
            Create a new note{" "}
            {target?.parentName ? `in ${target.parentName}` : ""}
          </DialogTitle>
          <DialogDescription>
            Give your note a name and hit create.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <form.Field
            validators={{
              onDynamic: z
                .string()
                .min(1, "Name is required")
                .max(30, "Name is too long"),
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
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="w-full"
                  ref={nameInputRef}
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
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <Loading className="size-4" variant="secondary" />
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
})

CreateNoteDialog.displayName = "CreateNoteDialog"
