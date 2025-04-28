"use client"

import { Button } from "@/components/ui/Button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Loading } from "@/components/ui/Loading"
import { createWorkspace } from "@/server/actions/workspaces"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { z } from "zod"

export const CreateWorkspaceDialogTrigger = ({
  children,
  asChild,
  className,
}: {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}) => {
  const form = useForm({
    defaultValues: {
      name: "workspace",
    },
    validators: {
      onChange: z.object({
        name: z.string().min(1, "Name is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      await createWorkspace(value.name)
      form.reset()
      setOpen(false)
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
            void form.handleSubmit()
          }}
        >
          <form.Field name="name">
            {(field) => (
              <>
                <Input
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
