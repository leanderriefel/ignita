import { Navigate, Outlet, useParams } from "react-router"

import { Loading } from "@ignita/components"
import { useWorkspace } from "@ignita/hooks"

const WorkspaceLayout = () => {
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
    return <Navigate to="/notes?noRedirect=true" replace />
  }

  return <Outlet />
}

export default WorkspaceLayout
