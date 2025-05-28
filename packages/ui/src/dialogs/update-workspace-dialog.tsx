"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { useTRPC } from "@/lib/trpc"
import { type workspaces } from "@/server/db/schema"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type InferSelectModel } from "drizzle-orm"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

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
  const router = useRouter()

  const queryClient = useQueryClient()
  const trpc = useTRPC()

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
          router.push("/notes")
        }
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: workspace.name,
    },
    validators: {
      onChange: z.object({
        name: z.string().min(1, "Name is required").max(20, "Name is too long"),
      }),
    },
    onSubmit: async ({ value }) => {
      updateWorkspaceMutation.mutate({
        id: workspace.id,
        name: value.name,
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
          <DialogTitle>Update workspace</DialogTitle>
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
                  <Loading className="fill-destructive size-6" />
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
