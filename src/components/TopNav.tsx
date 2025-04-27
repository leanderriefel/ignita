import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { SidebarToggle } from "@/components/ui/Sidebar"
import { WorkspaceDropdown } from "@/components/WorkspaceDropdown"
import { getWorkspaces } from "@/server/actions/workspaces"

export const TopNav = async ({ params }: { params?: string[] }) => {
  const workspaces = await getWorkspaces()

  return (
    <div className="flex h-16 w-full items-center justify-start gap-x-2">
      <SidebarToggle />
      <ThemeSwitcher />
      <WorkspaceDropdown params={params} />
    </div>
  )
}
