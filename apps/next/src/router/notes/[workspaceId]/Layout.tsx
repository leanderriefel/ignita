import { Outlet } from "react-router"

import { TopNav, WithSideNav } from "@ignita/components"

import { authClient, authHooks } from "~/lib/auth/auth-client"

const WorkspaceLayout = () => {
  return (
    <WithSideNav>
      <div className="absolute top-6 right-6 left-6 z-30">
        <TopNav authClient={authClient} authHooks={authHooks} />
      </div>
      <div className="relative size-full">
        <Outlet />
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
