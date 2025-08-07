"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type InferSelectModel } from "drizzle-orm"
import { usePostHog } from "posthog-js/react"
import { useNavigate, useParams } from "react-router"
import { z } from "zod"

import type { workspaces } from "@ignita/database/schema"
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

export const UpdateWorkspaceDialogTrigger = ({
  children,
  asChild,
  className,
  workspace,
}: {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  workspace: InferSelectModel<typeof workspaces>
}) => {
  const params = useParams()
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const trpc = useTRPC()

  const posthog = usePostHog()

  const updateWorkspaceMutation = useMutation(
    trpc.workspaces.updateWorkspace.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.workspaces.pathKey(),
        })
        form.reset()
        setOpen(false)
      },
    }),
  )
  const deleteWorkspaceMutation = useMutation(
    trpc.workspaces.deleteWorkspace.mutationOptions({
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.workspaces.pathKey(),
        })
        form.reset()
        setOpen(false)
      },
      onSuccess: (data) => {
        if (params.workspaceId === data.id) {
          navigate("/notes")
        }
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: workspace.name,
    },
    onSubmit: async ({ value }) => {
      updateWorkspaceMutation.mutate(
        {
          id: workspace.id,
          name: value.name,
        },
        {
          onSuccess: (data) => {
            posthog.capture("workspace_updated", {
              name: data.name,
              workspaceId: data.id,
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
          <DialogTitle>Update workspace</DialogTitle>
          <DialogDescription>
            Update the name of your workspace and hit update.
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
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <Loading className="size-6 fill-primary-foreground" />
                ) : (
                  "Update"
                )}
              </Button>
            )}
          </form.Subscribe>
          <Dialog>
            <DialogTrigger className="mt-4 w-full" asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your workspace and remove all of your notes and pages from the
                  database.
                </DialogDescription>
              </DialogHeader>
              <Button
                type="submit"
                variant="destructive"
                onClick={async () => {
                  await deleteWorkspaceMutation.mutateAsync({
                    id: workspace.id,
                  })
                  void queryClient.invalidateQueries({
                    queryKey: trpc.workspaces.pathKey(),
                  })
                  form.reset()
                  setOpen(false)
                }}
              >
                {deleteWorkspaceMutation.isPending ? (
                  <Loading className="size-6 fill-destructive" />
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogContent>
          </Dialog>
        </form>
      </DialogContent>
    </Dialog>
  )
}
