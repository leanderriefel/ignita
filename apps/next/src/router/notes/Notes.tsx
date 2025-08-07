import { Navigate, useSearchParams } from "react-router"

import {
  Button,
  CreateWorkspaceDialogTrigger,
  Loading,
  ThemeSelector,
} from "@ignita/components"
import { useWorkspaces } from "@ignita/hooks"

import { useSession } from "~/lib/auth/auth-client"

const Notes = () => {
  const session = useSession()
  const [searchParams] = useSearchParams()
  const noRedirect = searchParams.get("noRedirect") !== null

  const workspaces = useWorkspaces({ enabled: !!session.data?.user.id })

  if (session.isPending || workspaces.isPending) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  // Redirect to last visited route if available
  if (!noRedirect) {
    const lastNotesPath = localStorage.getItem("pick-up-where-left-off")
    if (
      lastNotesPath &&
      lastNotesPath !== "/notes" &&
      lastNotesPath !== "/notes/" &&
      lastNotesPath !== "/"
    ) {
      return <Navigate to={lastNotesPath} replace />
    }
  } else {
    localStorage.removeItem("pick-up-where-left-off")
  }

  if (workspaces.data && workspaces.data.length > 0) {
    const firstWorkspace = workspaces.data[0]
    if (firstWorkspace) {
      return <Navigate to={`/notes/${firstWorkspace.id}`} replace />
    }
  }

  return (
    <div className="flex size-full overflow-hidden bg-border/50">
      <div className="relative m-2 flex flex-1 items-center justify-center overflow-x-hidden overflow-y-auto rounded-4xl border bg-background px-6 py-2 text-card-foreground">
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
