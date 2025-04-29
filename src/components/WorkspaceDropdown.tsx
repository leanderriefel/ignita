"use client"

import { CreateWorkspaceDialogTrigger } from "@/components/dialogs/CreateWorkspaceDialog"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Loading } from "@/components/ui/Loading"
import { useTRPC } from "@/lib/trpc"
import { cn, extractSlugs } from "@/lib/utils"
import { CaretDownIcon } from "@radix-ui/react-icons"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

export const WorkspaceDropdown = ({ params }: { params?: string[] }) => {
  const slugs = extractSlugs(params)

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

  const currentWorkspace = workspaces.find((ws) => ws.id === slugs.workspace)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={className}>
          {currentWorkspace ? currentWorkspace?.name : "Select a workspace"}
          <CaretDownIcon className="mt-1 -ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              className="text-card-foreground"
              asChild
            >
              <Link href={`/notes/${workspace.id}`} prefetch className="w-full">
                {workspace.name}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={(e) => e.preventDefault()}>
            <CreateWorkspaceDialogTrigger className="cursor-pointer text-xs">
              + create new workspace
            </CreateWorkspaceDialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
