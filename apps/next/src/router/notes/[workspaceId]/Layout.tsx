import { TopNav, WithSideNav } from "@nuotes/components"
import { Outlet } from "react-router"

const WorkspaceLayout = () => {
  return (
    <WithSideNav>
      <div className="absolute top-6 left-6 right-6">
        <TopNav />
      </div>
      <div className="size-full">
        <Outlet />
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
