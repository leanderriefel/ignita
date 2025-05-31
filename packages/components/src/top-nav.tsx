"use client"

import { ThemeSelector } from "./theme-selector"
import { SidebarToggle } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

export const TopNav = () => {
  return (
    <div className="flex h-auto w-full items-center justify-start gap-x-2">
      <SidebarToggle />
      <ThemeSelector />
      <WorkspaceDropdown />
    </div>
  )
}
