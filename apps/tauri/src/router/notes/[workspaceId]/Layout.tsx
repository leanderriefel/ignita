import { Navigate, Outlet, useParams } from "react-router"

import { Loading, TopNav, WithSideNav } from "@ignita/components"
import { useWorkspace } from "@ignita/hooks"

import { authClient } from "~/lib/auth/auth-client"

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

  return (
    <WithSideNav contentClassName="mt-0" sidebarClassName="pt-6">
      <div className="absolute top-6 right-0 left-0 z-30 mx-8">
        <TopNav authClient={authClient} />
      </div>
      <div className="size-full">
        <Outlet />
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
