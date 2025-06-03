"use client"

import { CaretDownIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { Link, useParams } from "react-router"

import { cn } from "@ignita/lib"
import { useTRPC } from "@ignita/trpc/client"

import { CreateWorkspaceDialogTrigger } from "./dialogs/create-workspace-dialog"
import { UpdateWorkspaceDialogTrigger } from "./dialogs/update-workspace-dialog"
import { Button } from "./ui/button"
import { Loading } from "./ui/loading"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

export const WorkspaceDropdown = ({ className }: { className?: string }) => {
  const { workspaceId } = useParams<{ workspaceId: string; noteId?: string }>()
  const trpc = useTRPC()

  const query = useQuery(trpc.workspaces.getWorkspaces.queryOptions())

  const baseClassName = "text-card-foreground text-sm mx-2"

  if (query.isLoading) {
    return (
      <p className={cn(baseClassName, "inline-flex items-center", className)}>
        <Loading className="fill-card-foreground mr-2 size-4" /> Loading
        workspaces...
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={cn(baseClassName, className)}>
          {currentWorkspace ? currentWorkspace?.name : "Select a workspace"}
          <CaretDownIcon className="mt-1 -ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-56"
        asChild
      >
        <motion.div
          className="size-full"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="text-card-foreground flex items-center justify-between gap-x-2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  asChild
                >
                  <Link to={`/notes/${workspace.id}`}>{workspace.name}</Link>
                </Button>
                <div className="flex gap-x-1">
                  <UpdateWorkspaceDialogTrigger workspace={workspace} asChild>
                    <Button
                      variant="ghost"
                      size="square"
                      className="size-7 rounded-sm"
                    >
                      <Pencil2Icon className="size-4" />
                    </Button>
                  </UpdateWorkspaceDialogTrigger>
                </div>
              </div>
            ))}
          </div>
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
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}
