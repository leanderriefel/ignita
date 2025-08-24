import { Navigate, useSearchParams } from "react-router"

import {
  Button,
  CreateWorkspaceDialogTrigger,
  Loading,
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
    <div className="flex size-full items-center justify-center">
      <CreateWorkspaceDialogTrigger asChild>
        <Button variant="outline" size="lg">
          Create your first workspace
        </Button>
      </CreateWorkspaceDialogTrigger>
    </div>
  )
}

export default Notes

