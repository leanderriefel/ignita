import { cn } from "@ignita/lib"

import { NotesTree } from "./notes-tree/notes-tree"
import { Sidebar, SidebarProvider } from "./ui/sidebar"
import { WorkspaceDropdown } from "./workspace-dropdown"

interface SideNavProps {
  children: React.ReactNode
  initialWidth?: number
  minWidth?: number
  maxWidth?: number
  widthStorageKey?: string
  toggledStorageKey?: string
  sidebarClassName?: string
  contentClassName?: string
}

export const WithSideNav = ({
  children,
  initialWidth = 280,
  minWidth,
  maxWidth = 5000,
  widthStorageKey = "sidebar-width",
  toggledStorageKey = "sidebar-toggled",
  sidebarClassName,
  contentClassName,
}: SideNavProps) => {
  return (
    <SidebarProvider
      initialWidth={initialWidth}
      minWidth={minWidth}
      maxWidth={maxWidth}
      widthStorageKey={widthStorageKey}
      toggledStorageKey={toggledStorageKey}
    >
      <div className="flex size-full overflow-hidden bg-border/50 before:absolute before:inset-0 before:-z-1 before:rounded-lg before:bg-gradient-to-b before:from-transparent before:to-primary/10 before:blur-md">
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
            "relative m-2 min-w-0 flex-1 overflow-auto rounded-xl border bg-background text-card-foreground",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
