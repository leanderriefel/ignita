import { useStore } from "@tanstack/react-store"
import { Navigate } from "react-router"

import {
  Button,
  CreateWorkspaceDialogTrigger,
  Loading,
  NoteView,
} from "@ignita/components"
import { useNote, useWorkspace, useWorkspaces } from "@ignita/hooks"
import { notesSessionStore, setWorkspace } from "@ignita/lib"

import { useSession } from "~/lib/auth/auth-client"

const Notes = () => {
  const session = useSession()
  const { workspaceId, noteId } = useStore(notesSessionStore)

  const workspaces = useWorkspaces({ enabled: !!session.data?.user.id })

  if (session.isPending || workspaces.isPending) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  const note = useNote(noteId ?? "", { enabled: !!noteId })
  const workspace = useWorkspace(workspaceId ?? "", { enabled: !!workspaceId })

  if (noteId) {
    if (note.isPending) {
      return (
        <div className="flex size-full items-center justify-center">
          <Loading />
        </div>
      )
    }
    if (!note.data) return <Navigate to="/notes" replace />
    return (
      <div className="size-full">
        <NoteView noteId={noteId} />
      </div>
    )
  }

  if (workspaceId) {
    if (workspace.isPending) {
      return (
        <div className="flex size-full items-center justify-center">
          <Loading />
        </div>
      )
    }
    if (!workspace.data) return <Navigate to="/notes" replace />
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <div className="text-2xl font-bold">{workspace.data.name}</div>
      </div>
    )
  }

  if (workspaces.data && workspaces.data.length > 0) {
    const firstWorkspace = workspaces.data[0]
    if (firstWorkspace) {
      setWorkspace(firstWorkspace.id)
      return (
        <div className="flex size-full items-center justify-center">
          <Loading />
        </div>
      )
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
