"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { z } from "zod"

import { useTRPC } from "@nuotes/trpc/client"

import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
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
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const trpc = useTRPC()

  const createWorkspaceMutation = useMutation(
    trpc.workspaces.createWorkspace.mutationOptions({
      onSuccess: (data) => {
        navigate(`/notes/${data.id}`)
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.workspaces.pathKey(),
        })
        form.reset()
        setOpen(false)
      },
    }),
  )

  const form = useForm({
    defaultValues: {
      name: "workspace",
    },
    validators: {
      onChange: z.object({
        name: z.string().min(1, "Name is required").max(20, "Name is too long"),
      }),
    },
    onSubmit: async ({ value }) => {
      createWorkspaceMutation.mutate({ name: value.name })
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
