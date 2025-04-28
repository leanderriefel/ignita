import { ThemeSwitcher } from "@/components/ThemeSwitcher"
import { SidebarToggle } from "@/components/ui/Sidebar"
import { WorkspaceDropdown } from "@/components/WorkspaceDropdown"

export const TopNav = async ({ params }: { params?: string[] }) => {
  return (
    <div className="flex h-16 w-full items-center justify-start gap-x-2">
      <SidebarToggle />
      <ThemeSwitcher />
      <WorkspaceDropdown params={params} />
    </div>
  )
}
