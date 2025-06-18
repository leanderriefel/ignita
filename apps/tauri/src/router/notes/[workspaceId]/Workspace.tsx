import { useParams } from "react-router"

import { Loading } from "@ignita/components"
import { useWorkspace } from "@ignita/hooks"

const Workspace = () => {
  const { workspaceId } = useParams()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const workspace = useWorkspace(workspaceId!)

  if (workspace.isPending) {
    return (
      <div className="flex size-full items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!workspace.data) {
    return (
      <div className="flex size-full items-center justify-center">
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
