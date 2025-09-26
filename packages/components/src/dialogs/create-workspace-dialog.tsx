"use client"

import { useState } from "react"
import { revalidateLogic } from "@tanstack/form-core"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usePostHog } from "posthog-js/react"
import { toast } from "sonner"
import { z } from "zod"

import { setNote, setWorkspace } from "@ignita/lib"
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

export const CreateWorkspaceDialogTrigger = ({
  children,
  asChild,
  className,
}: {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}) => {
  const queryClient = useQueryClient()
  const trpc = useTRPC()

  const posthog = usePostHog()

  const createWorkspaceMutation = useMutation(
    trpc.workspaces.createWorkspace.mutationOptions({
      onSuccess: (data) => {
        void queryClient.invalidateQueries({
          queryKey: trpc.workspaces.pathKey(),
        })
        form.reset()
        setOpen(false)

        posthog.capture("workspace_created", {
          name: data.name,
          workspaceId: data.id,
        })

        setWorkspace(data.id)
        setNote(null)
      },
      onError: (error) => {
        if (error instanceof Error) {
          toast.error(error.message)
        } else {
          toast.error("An unknown error occurred")
        }
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: "workspace",
    },
    validationLogic: revalidateLogic(),
    onSubmit: async ({ value }) => {
      try {
        await createWorkspaceMutation.mutateAsync({ name: value.name })
      } catch {
        return
      }
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
          <DialogTitle>Create a new workspace</DialogTitle>
          <DialogDescription>
            A workspace is a collection of notes. Give your workspace a name and
            hit create.
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
              onDynamic: z
                .string()
                .min(1, "Name is required")
                .max(20, "Name is too long"),
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
                  <em className="text-sm text-destructive">
                    {field.state.meta.errors
                      .map((error) => error?.message)
                      .join(",")}
                  </em>
                ) : null}
              </>
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
                className="mt-4 w-full"
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
}
