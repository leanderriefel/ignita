"use client"

import { CreateWorkspaceDialogTrigger } from "@/components/dialogs/CreateWorkspaceDialog"
import { UpdateWorkspaceDialogTrigger } from "@/components/dialogs/UpdateWorkspaceDialog"
import { Button } from "@/components/ui/Button"
import { Loading } from "@/components/ui/Loading"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover"
import { useTRPC } from "@/lib/trpc"
import { cn } from "@/lib/utils"
import { CaretDownIcon, Pencil2Icon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useParams } from "next/navigation"

export const WorkspaceDropdown = () => {
  const { workspaceId } = useParams<{ workspaceId: string; noteId?: string }>()

  const trpc = useTRPC()
  const query = useQuery(trpc.workspaces.getWorkspaces.queryOptions())

  const className = "text-card-foreground text-sm mx-2"

  if (query.isLoading) {
    return (
      <p className={cn(className, "inline-flex items-center")}>
        <Loading className="fill-card-foreground mr-2 size-4" /> Loading
        workspaces...
      </p>
    )
  }

  const workspaces = query.data!

  if (workspaces.length === 0) {
    return (
      <CreateWorkspaceDialogTrigger asChild>
        <Button variant="link" className={className}>
          Create your first workspace
        </Button>
      </CreateWorkspaceDialogTrigger>
    )
  }

  const currentWorkspace = workspaces.find((ws) => ws.id === workspaceId)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={className}>
          {currentWorkspace ? currentWorkspace?.name : "Select a workspace"}
          <CaretDownIcon className="mt-1 -ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-56"
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
      </PopoverContent>
    </Popover>
  )
}
