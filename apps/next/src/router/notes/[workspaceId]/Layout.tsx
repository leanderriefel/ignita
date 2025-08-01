import { Outlet } from "react-router"

import { TopNav, WithSideNav } from "@ignita/components"

import { authClient } from "~/lib/auth/auth-client"

const WorkspaceLayout = () => {
  return (
    <WithSideNav>
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
