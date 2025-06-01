import { Outlet } from "react-router"

import { TopNav, WithSideNav } from "@ignita/components"

const WorkspaceLayout = () => {
  return (
    <WithSideNav>
      <div className="absolute top-6 right-6 left-6 z-30">
        <TopNav />
      </div>
      <div className="size-full">
        <Outlet />
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
