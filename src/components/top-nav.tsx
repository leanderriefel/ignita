import { ThemeSelector } from "@/components/theme-selector"
import { SidebarToggle } from "@/components/ui/sidebar"
import { WorkspaceDropdown } from "@/components/workspace-dropdown"

export const TopNav = async () => {
  return (
    <div className="flex h-16 w-full items-center justify-start gap-x-2">
      <SidebarToggle />
      <ThemeSelector />
      <WorkspaceDropdown />
    </div>
  )
}
