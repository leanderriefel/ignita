import { useSession } from "@/lib/auth/auth-client"
import {
  Button,
  CreateWorkspaceDialogTrigger,
  Loading,
  ThemeSelector,
} from "@nuotes/components"
import { useTRPC } from "@nuotes/trpc/client"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

const Notes = () => {
  const session = useSession()
  const trpc = useTRPC()
  const workspace = useQuery(
    trpc.workspaces.getWorkspaces.queryOptions({
      enabled: !!session.data?.user.id,
    }),
  )
  const navigate = useNavigate()

  if (session.isPending || workspace.isPending) {
    return (
      <div className="flex h-dvh w-dvw items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!session.data) {
    navigate("/auth")
    return null
  }

  if (workspace.data) {
    const firstWorkspace = workspace.data[0]
    if (firstWorkspace) {
      navigate(`/notes/${firstWorkspace.id}`)
      return null
    }
  }

  return (
    <div className="flex h-dvh w-dvw overflow-hidden bg-border/50">
      <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-auto rounded-4xl border px-6 py-2 flex justify-center items-center">
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
