"use client"

import { useState } from "react"
import { useStore } from "@tanstack/react-store"
import { ChevronDownIcon, SquarePen } from "lucide-react"

import { useWorkspaces } from "@ignita/hooks"
import { cn, notesSessionStore, setNote, setWorkspace } from "@ignita/lib"

import { CreateWorkspaceDialogTrigger } from "./dialogs/create-workspace-dialog"
import { UpdateWorkspaceDialogTrigger } from "./dialogs/update-workspace-dialog"
import { Button } from "./ui/button"
import { Loading } from "./ui/loading"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export const WorkspaceDropdown = ({ className }: { className?: string }) => {
  const { workspaceId } = useStore(notesSessionStore)

  const [open, setOpen] = useState(false)

  const query = useWorkspaces()

  const baseClassName = "text-card-foreground text-sm mx-2"

  if (query.isPending) {
    return (
      <p className={cn(baseClassName, "inline-flex items-center", className)}>
        <Loading className="mr-2 size-4" /> Loading workspaces...
      </p>
    )
  }

  const workspaces = query.data

  if (!workspaces) return null

  if (workspaces.length === 0) {
    return (
      <CreateWorkspaceDialogTrigger asChild>
        <Button variant="link" className={cn(baseClassName, className)}>
          Create your first workspace
        </Button>
      </CreateWorkspaceDialogTrigger>
    )
  }

  const currentWorkspace = workspaces.find((ws) => ws.id === workspaceId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(baseClassName, "truncate", className)}
        >
          {currentWorkspace ? currentWorkspace?.name : "Select a workspace"}
          <ChevronDownIcon className="mt-0.5 -ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="m-2 w-60 space-y-2 p-4"
        asChild
      >
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className={cn(
              "flex items-center justify-between gap-x-2 rounded-lg border p-1 text-card-foreground transition-colors",
              workspace.id === workspaceId &&
                "border border-primary/50 bg-gradient-to-r from-primary-darker/20 to-primary-lighter/10",
              workspace.id !== workspaceId &&
                "has-hover:border-primary/50 has-hover:bg-primary/10",
            )}
          >
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (workspace.id === workspaceId) return
                setWorkspace(workspace.id)
                setNote(null)
                setOpen(false)
              }}
              className="h-7 w-full flex-1 cursor-pointer justify-start truncate rounded-sm px-2 py-1 text-start text-sm"
            >
              {workspace.name}
            </button>
            <div className="flex gap-x-1">
              <UpdateWorkspaceDialogTrigger workspace={workspace} asChild>
                <button className="size-7 cursor-pointer rounded-sm">
                  <SquarePen className="size-4" />
                </button>
              </UpdateWorkspaceDialogTrigger>
            </div>
          </div>
        ))}
        <div className="my-4 w-full border-b" />
        <CreateWorkspaceDialogTrigger asChild>
          <Button
            className="w-full cursor-pointer text-xs"
            size="sm"
            variant="ghost"
          >
            + create new workspace
          </Button>
        </CreateWorkspaceDialogTrigger>
      </PopoverContent>
    </Popover>
  )
}
