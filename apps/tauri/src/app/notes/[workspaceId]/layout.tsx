import { TopNav, WithSideNav } from "@nuotes/components"

const WorkspaceLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <WithSideNav>
      <div className="grid grid-rows-[auto_1fr]">
        <TopNav />
        <div className="size-full">{children}</div>
      </div>
    </WithSideNav>
  )
}

export default WorkspaceLayout
