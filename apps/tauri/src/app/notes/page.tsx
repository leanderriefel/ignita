"use client"

import { useSession } from "@/lib/auth/auth-client"
import {
  Button,
  CreateWorkspaceDialogTrigger,
  Loading,
  ThemeSelector,
} from "@nuotes/components"
import { useTRPC } from "@nuotes/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { redirect } from "next/navigation"

const NoWorkspaceSelectedPage = () => {
  const session = useSession()
  const trpc = useTRPC()
  const workspace = useQuery(
    trpc.workspaces.getWorkspaces.queryOptions({
      enabled: !!session.data?.user.id,
    }),
  )

  if (session.isPending || workspace.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    redirect("/auth")
  }

  if (workspace.data) {
    const firstWorkspace = workspace.data[0]
    if (firstWorkspace) {
      redirect(`/notes/${firstWorkspace.id}`)
    }
  }

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-border/50">
      <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-scroll rounded-4xl border px-6 py-2 flex justify-center items-center">
        <ThemeSelector className="absolute top-8 left-8" />
        <CreateWorkspaceDialogTrigger asChild>
          <Button variant="outline" size="lg">
            Create your first workspace
          </Button>
        </CreateWorkspaceDialogTrigger>
      </div>
    </div>
  )
}

export default NoWorkspaceSelectedPage
