"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { useTRPC } from "@/lib/trpc"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

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
  const router = useRouter()

  const queryClient = useQueryClient()
  const trpc = useTRPC()

  const createNoteMutation = useMutation(
    trpc.notes.createNote.mutationOptions({
      onSuccess: (data) => {
        router.push(`/notes/${data.workspaceId}/${data.id}`)
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
    validators: {
      onChange: z.object({
        name: z.string().min(1, "Name is required").max(12, "Name is too long"),
      }),
    },
    onSubmit: async ({ value }) => {
      createNoteMutation.mutate({
        workspaceId,
        parentId,
        name: value.name,
        note: {
          type: "text",
          content: "",
        },
      })
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
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <form.Field name="name">
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
                {field.state.meta.errors.length ? (
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
