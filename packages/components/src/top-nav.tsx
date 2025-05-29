import { ThemeSelector } from "./theme-selector"
import { SidebarToggle } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

export const TopNav = async () => {
  return (
    <div className="flex h-16 w-full items-center justify-start gap-x-2">
      <SidebarToggle />
      <ThemeSelector />
      <WorkspaceDropdown />
    </div>
  )
}
