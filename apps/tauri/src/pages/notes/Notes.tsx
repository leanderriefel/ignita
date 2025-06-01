import { useQuery } from "@tanstack/react-query"
import { Navigate } from "react-router"

import {
  Button,
  CreateWorkspaceDialogTrigger,
  Loading,
  ThemeSelector,
} from "@ignita/components"
import { useTRPC } from "@ignita/trpc/client"

import { useSession } from "~/lib/auth/auth-client"

const Notes = () => {
  const session = useSession()
  const trpc = useTRPC()
  const workspace = useQuery(
    trpc.workspaces.getWorkspaces.queryOptions({
      enabled: !!session.data?.user.id,
    }),
  )

  if (session.isLoading || workspace.isLoading) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.isLoading && !session.data) {
    return <Navigate to="/auth" replace />
  }

  if (workspace.data) {
    const firstWorkspace = workspace.data[0]
    if (firstWorkspace) {
      return <Navigate to={`/notes/${firstWorkspace.id}`} replace />
    }
  }

  return (
    <div className="bg-border/50 flex h-dvh w-dvw overflow-hidden">
      <div className="bg-background text-card-foreground relative m-2 flex flex-1 items-center justify-center overflow-x-hidden overflow-y-auto rounded-4xl border px-6 py-2">
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

export default Notes
