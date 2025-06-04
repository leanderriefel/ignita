import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router"

import { Loading } from "@ignita/components"
import { useTRPC } from "@ignita/trpc/client"

const Workspace = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  const trpc = useTRPC()
  const workspace = useQuery(
    trpc.workspaces.getWorkspace.queryOptions(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: workspaceId!,
      },
      {
        enabled: !!workspaceId,
      },
    ),
  )

  if (workspace.isPending) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!workspace.data) {
    return (
      <div className="h-size-full flex items-center justify-center">
        <div className="text-2xl font-bold">Workspace not found</div>
      </div>
    )
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div className="text-2xl font-bold">{workspace.data.name}</div>
    </div>
  )
}

export default Workspace
