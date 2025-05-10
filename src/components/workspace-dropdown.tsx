"use client"

import { CreateWorkspaceDialogTrigger } from "@/components/dialogs/create-workspace-dialog"
import { UpdateWorkspaceDialogTrigger } from "@/components/dialogs/update-workspace-dialog"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTRPC } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { CaretDownIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import Link from "next/link"
import { useParams } from "next/navigation"

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

  const workspaces = query.data!

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
                className="text-card-foreground flex justify-between items-center gap-x-2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start"
                  asChild
                >
                  <Link href={`/notes/${workspace.id}`} prefetch>
                    {workspace.name}
                  </Link>
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
          <div className="border-b w-full my-4" />
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
