import { auth } from "@/auth"
import { getQueryClient, trpc } from "@/server/trpc/caller"

const Notes = async ({
  params,
}: {
  params: Promise<{ workspaceId: string; noteId?: string }>
}) => {
  const awaitedParams = await params
  const session = await auth()

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.workspaces.getWorkspaces.queryOptions())

  return (
    <div className="size-full">
      <p>Hi {session?.user.name}</p>
      <p>Workspace: {awaitedParams.workspaceId}</p>
      <p>Note: {awaitedParams.noteId}</p>
    </div>
  )
}

export default Notes
