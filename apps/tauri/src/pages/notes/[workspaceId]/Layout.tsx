import { TopNav, WithSideNav } from "@nuotes/components"
import { Outlet } from "react-router-dom"

const WorkspaceLayout = () => {
  return (
    <WithSideNav>
      <div className="grid grid-rows-[auto_1fr]">
        <TopNav />
        <div className="size-full">
          <Outlet />
        </div>
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
