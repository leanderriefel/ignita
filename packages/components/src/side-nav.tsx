import { cn } from "@ignita/lib"

import { NotesTree } from "./notes-tree/notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

interface SideNavProps {
  children: React.ReactNode
  initialWidth?: number
  widthStorageKey?: string
  toggledStorageKey?: string
  sidebarClassName?: string
  contentClassName?: string
}

export const WithSideNav = ({
  children,
  initialWidth = 280,
  widthStorageKey = "sidebar-width",
  toggledStorageKey = "sidebar-toggled",
  sidebarClassName,
  contentClassName,
}: SideNavProps) => {
  return (
    <SidebarProvider
      initialWidth={initialWidth}
      widthStorageKey={widthStorageKey}
      toggledStorageKey={toggledStorageKey}
    >
      <div className="bg-border/50 before:to-primary/10 flex size-full overflow-hidden before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:blur-md">
        <Sidebar className={cn("flex flex-col gap-y-2 py-9", sidebarClassName)}>
          <div className="text-center">
            <WorkspaceDropdown />
          </div>
          <div className="grow">
            <NotesTree />
          </div>
        </Sidebar>
        <div
          className={cn(
            "bg-background text-card-foreground relative m-2 flex-1 overflow-x-hidden overflow-y-auto rounded-xl border",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
