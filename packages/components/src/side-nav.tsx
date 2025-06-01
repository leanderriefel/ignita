"use client"

import { SidebarNotesSelection } from "./notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"

interface SideNavProps {
  children: React.ReactNode
  initialWidth?: number
  widthStorageKey?: string
  toggledStorageKey?: string
}

export const WithSideNav = ({
  children,
  initialWidth = 280,
  widthStorageKey = "sidebar-width",
  toggledStorageKey = "sidebar-toggled",
}: SideNavProps) => {
  return (
    <SidebarProvider
      initialWidth={initialWidth}
      widthStorageKey={widthStorageKey}
      toggledStorageKey={toggledStorageKey}
    >
      <div className="bg-border/50 flex h-dvh w-dvw overflow-hidden">
        <Sidebar className="flex flex-col gap-y-2 py-9">
          <div className="text-center text-lg font-bold">ignita</div>
          <div className="grow">
            <SidebarNotesSelection />
          </div>
        </Sidebar>
        <div className="bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-auto rounded-xl border">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
